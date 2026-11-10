import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../dist');
const base = process.env.BASE_PATH || '/';
const port = Number(process.env.PORT || 4321);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.zip':'application/zip'};
export const server = http.createServer((req,res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if (!pathname.startsWith(base)) { res.writeHead(404).end(); return; }
  let file = path.resolve(root, '.' + '/' + pathname.slice(base.length));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) { res.writeHead(301,{Location:pathname+'/'}).end(); return; }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); res.end(fs.readFileSync(path.join(root,'404.html'))); return; }
  res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Content-Length':fs.statSync(file).size}); fs.createReadStream(file).pipe(res);
});
server.listen(port,'127.0.0.1',()=>console.log(`Local preview http://127.0.0.1:${server.address().port}${base} (PID ${process.pid})`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
