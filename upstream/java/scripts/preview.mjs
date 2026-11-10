import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';
const dir=path.join(root,'docs'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.zip':'application/zip'};
http.createServer((req,res)=>{
  let decoded;try{decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  // A repository prefix allows testing project Pages URLs locally.
  const local=decoded.replace(/^\/java-study-preview(?=\/|$)/,'')||'/';
  const file=path.resolve(dir,'.'+local+(local.endsWith('/')?'index.html':''));
  if(!file.startsWith(dir+path.sep)){res.writeHead(403).end();return;}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port+'/java-study-preview/'));
