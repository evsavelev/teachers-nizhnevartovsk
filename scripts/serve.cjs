const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const prefix = '/teachers-nizhnevartovsk/';
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
http.createServer((req,res) => {
  let url; try { url=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400).end();return;}
  if(url==='/'){res.writeHead(302,{Location:prefix}).end();return;}
  const relative=url.startsWith(prefix)?url.slice(prefix.length)||'index.html':'__missing';
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)||relative.startsWith('.')||!types[path.extname(file)]||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(root,'404.html')));return;
  }
  res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT)||4195,'127.0.0.1',()=>console.log('http://127.0.0.1:4195'+prefix));
