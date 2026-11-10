import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,walk,unzipStore} from './lib.mjs';
const docs=path.join(root,'docs');let links=0,zipFiles=0;
for(const file of walk(docs).filter(p=>p.endsWith('.html'))){const text=fs.readFileSync(file,'utf8');
  if(/\{\{code:/.test(text))throw Error('Unresolved source include: '+file);
  for(const m of text.matchAll(/(?:href|src)="([^"]+)"/g)){
    const url=m[1].replaceAll('&amp;','&');if(/^(?:https?:|mailto:|data:)/.test(url))continue;
    if(url.startsWith('/'))throw Error('Absolute site path: '+url);
    const [p,anchor]=url.split('#'),target=p?path.resolve(path.dirname(file),p):file;
    if(!target.startsWith(docs+path.sep)||!fs.existsSync(target))throw Error('Broken link: '+file+' -> '+url);
    if(anchor&&target.endsWith('.html')&&!fs.readFileSync(target,'utf8').includes('id="'+anchor+'"'))throw Error('Missing anchor: '+url);
    links++;
  }
}
const forbidden=p=>/(^|\/)(\.local|\.tools|instructor-private|bin|build|classes)(\/|$)/.test(p)||/\.(?:jar|class)$/.test(p)||/(^|\/)db\.properties$/.test(p)||p.endsWith('.local.sql');
for(const item of JSON.parse(fs.readFileSync(path.join(docs,'assets/downloads/manifest.json'),'utf8'))){const data=fs.readFileSync(path.join(docs,'assets/downloads',item.file));
  if(crypto.createHash('sha256').update(data).digest('hex')!==item.sha256)throw Error('Hash mismatch: '+item.file);
  const entries=unzipStore(data);if(entries.size!==item.entries)throw Error('Entry count mismatch');
  for(const [p,content]of entries){
    if(forbidden(p))throw Error('Private/generated file in ZIP: '+p);
    if(p.endsWith('.properties.example')&&/^db\.password=(?!CHANGE_ME_LOCAL\s*$).+/m.test(content.toString()))throw Error('Non-placeholder password in example: '+p);
  }zipFiles++;
}
const exportDir=path.join(root,'release/java-study-public');if(fs.existsSync(exportDir)){
  const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'release/public-files.json'),'utf8')));
  for(const file of walk(exportDir)){const rel=path.relative(exportDir,file).replaceAll('\\','/');if(!allowed.has(rel)||forbidden(rel))throw Error('Unexpected public file: '+rel);const source=path.join(root,rel);if(!fs.readFileSync(source).equals(fs.readFileSync(file)))throw Error('Stale public file: '+rel);}
  for(const file of allowed)if(!fs.existsSync(path.join(exportDir,file)))throw Error('Missing export: '+file);
  const zipEntries=unzipStore(fs.readFileSync(path.join(root,'release/java-study-public.zip')));if(zipEntries.size!==allowed.size)throw Error('Public ZIP count mismatch');
  for(const [file,data]of zipEntries)if(!allowed.has(file)||!data.equals(fs.readFileSync(path.join(root,file))))throw Error('Public ZIP mismatch: '+file);
}
console.log('PASS: '+links+' local links, '+zipFiles+' ZIPs and hashes, public export privacy and consistency.');
