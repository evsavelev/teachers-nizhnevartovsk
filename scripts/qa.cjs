const {chromium}=require('@playwright/test');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.QA_URL||'http://127.0.0.1:4195/teachers-nizhnevartovsk/';
const canonical='https://evsavelev.github.io/teachers-nizhnevartovsk/';
const dir=base.startsWith('https')?'qa/production':'qa/local';fs.mkdirSync(dir,{recursive:true});
const report={date:new Date().toISOString(),base,checks:[],errors:[],accessibility:[],metrics:[],links:[]};
const check=(name,condition)=>{assert.ok(condition,name);report.checks.push(name)};
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
for(const [width,height] of [[360,800],[390,844],[430,932],[768,1024],[1024,900],[1440,1000]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<640,hasTouch:width<640});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',e=>report.errors.push(`${width}: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(`${width}: ${m.text()}`)});
  const requests=[];page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)report.errors.push(`${width}: HTTP ${r.status()} ${r.url()}`)});
  page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{window.qaMetrics={cls:0,lcp:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.qaMetrics.cls+=e.value})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>window.qaMetrics.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true})});
  check(`${width}: HTTP 200`,(await page.goto(base,{waitUntil:'networkidle'})).status()===200);
  await page.evaluate(()=>document.fonts.ready);
  check(`${width}: single H1`,await page.locator('h1').count()===1);
  check(`${width}: font loaded`,await page.evaluate(()=>document.fonts.check('700 16px Inter')));
  check(`${width}: canonical`,await page.locator('link[rel=canonical]').getAttribute('href')===canonical);
  check(`${width}: OG`,await page.locator('meta[property="og:url"]').getAttribute('content')===canonical);
  check(`${width}: all four languages`,await page.locator('.language-card').count()===4);
  check(`${width}: no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
  await page.screenshot({path:`${dir}/hero-${width}.png`});
  if(width<640){check(`${width}: nav initially hidden`,await page.locator('#main-nav').isHidden());await page.getByRole('button',{name:'Меню'}).click();check(`${width}: menu opens`,await page.locator('#main-nav').isVisible());await page.screenshot({path:`${dir}/menu-${width}.png`});await page.keyboard.press('Escape');check(`${width}: Escape closes and focuses toggle`,await page.locator('#main-nav').isHidden()&&await page.locator('.menu-toggle').evaluate(e=>document.activeElement===e));await page.locator('.menu-toggle').click();await page.locator('#main-nav a[href="#languages"]').click();check(`${width}: nav selection closes menu`,await page.locator('#main-nav').isHidden());}
  else check(`${width}: desktop menu visible, toggle hidden`,await page.locator('#main-nav').isVisible()&&await page.locator('.menu-toggle').isHidden());
  let steps=0;
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=Math.floor(height*.75)){
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(65);
    check(`${width}: scroll ${steps++} within viewport`,await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
  }
  await page.waitForTimeout(450);
  for(const id of ['languages','formats','results','camp','reviews','process','contacts']){
    await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(460);
    await page.locator('#'+id).screenshot({path:`${dir}/${id}-${width}.png`});
  }
  const anchors=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(a=>({href:a.getAttribute('href'),exists:!!document.getElementById(a.getAttribute('href').slice(1))})));
  check(`${width}: anchors resolve`,anchors.every(a=>a.exists));
  check(`${width}: all enrollment CTA target contacts`,(await page.locator('a').evaluateAll(links=>links.filter(a=>a.textContent.includes('Записаться на занятие')).map(a=>a.getAttribute('href')))).every(h=>h==='#contacts'));
  const phones=await page.locator('a[href^="tel:"]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));check(`${width}: correct phone`,phones.length>=2&&phones.every(h=>h==='tel:+73466290027'));
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  report.accessibility.push({width,violations:axe});check(`${width}: WCAG A/AA axe`,axe.length===0);
  const metrics=await page.evaluate(()=>({...window.qaMetrics,resources:performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin)).map(e=>({name:e.name.split('/').pop(),size:e.decodedBodySize}))}));report.metrics.push({width,...metrics});
  if(width===390)report.links=await page.locator('a[href^="https://"]').evaluateAll(a=>[...new Set(a.map(x=>x.href))]);
  check(`${width}: no third-party requests`,requests.every(u=>u.startsWith(base)));
  await context.close();
}
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto(base);check('reduced motion: no pending/hidden reveals',await reduced.locator('.is-pending').count()===0);check('reduced motion: instant scrolling',await reduced.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'));await reduced.locator('.hero-actions a[href="#contacts"]').click();await reduced.waitForFunction(()=>location.hash==='#contacts');check('CTA reaches contacts',await reduced.locator('#contacts').isVisible());await reduced.screenshot({path:`${dir}/contact-cta-reduced.png`});await reduced.close();
const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base);check('no-JS: nav available',await nojs.locator('#main-nav').isVisible());check('no-JS: content visible',await nojs.locator('.language-card').count()===4&&await nojs.locator('.is-pending').count()===0);await nojs.screenshot({path:`${dir}/no-js.png`});await nojs.close();
const api=await browser.newContext();
for(const file of ['styles/site.css','scripts/site.js','assets/images/favicon.svg','assets/images/og.png','robots.txt','sitemap.xml']){const r=await api.request.get(base+file);check(`resource ${file}: HTTP 200`,r.status()===200);if(file==='robots.txt')check('robots sitemap URL',(await r.text()).includes(canonical+'sitemap.xml'));if(file==='sitemap.xml')check('sitemap canonical',(await r.text()).includes('<loc>'+canonical+'</loc>'));}
const missing=await api.request.get(base+'not-a-real-page');check('missing page HTTP 404',missing.status()===404);await api.close();
check('no console / page / resource errors',report.errors.length===0);
console.log(JSON.stringify({base,checks:report.checks.length,errors:report.errors,accessibility:report.accessibility,metrics:report.metrics},null,2));
}finally{fs.writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
