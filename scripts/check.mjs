import { gitLessons } from '../src/content/git/course.ts';
import { gitMissions } from '../src/content/git/missions.ts';
import { rescueCases } from '../src/content/git/rescue.ts';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { walk, unzipStore } from '../upstream/java/scripts/lib.mjs';
const root=path.resolve(import.meta.dirname,'..'), dist=path.join(root,'dist'), base=process.env.BASE_PATH || '/';
const fail = message => { throw Error(message); };
const decode = s => s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const files=walk(dist), html=files.filter(f=>f.endsWith('.html'));
if(!html.length) fail('No generated pages. Run build first.');
let links=0,assets=0;
const resolve = (url,source) => {
  const u = new URL(decode(url), 'https://check.invalid'+base+path.relative(dist,source).replaceAll('\\','/'));
  if(u.origin !== 'https://check.invalid' || !['http:','https:'].includes(u.protocol)) return;
  if(!u.pathname.startsWith(base)) fail('Base path escaped: '+source+' -> '+url);
  let target=path.resolve(dist,'.'+decodeURIComponent(u.pathname.slice(base.length-1)));
  if(target!==dist && !target.startsWith(dist+path.sep)) fail('Unsafe path '+url);
  if(fs.existsSync(target) && fs.statSync(target).isDirectory()) target=path.join(target,'index.html');
  if(!fs.existsSync(target)) fail('Broken reference: '+path.relative(dist,source)+' -> '+url);
  if(u.hash && target.endsWith('.html')) {
    const id=decodeURIComponent(u.hash.slice(1));
    if(![...fs.readFileSync(target,'utf8').matchAll(/\bid="([^"]+)"/g)].some(m=>decode(m[1])===id)) fail('Missing anchor: '+url);
  }
  links++; if(!target.endsWith('.html')) assets++;
};
for(const file of html) {
  const text=fs.readFileSync(file,'utf8');
  if(/\{\{code:/.test(text)) fail('Unresolved code include '+file);
  if((text.match(/<h1\b/g)||[]).length!==1) fail('Expected one H1 '+file);
  const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length) fail('Duplicate ID '+file);
  if(!text.includes('lang="ja"') || !text.includes('name="viewport"')) fail('Missing locale/viewport '+file);
  // Only real HTML tag attributes; Java/JSP examples also contain href text.
  for(const tag of text.matchAll(/<[a-zA-Z][^>]*>/g)) for(const m of tag[0].matchAll(/\b(?:href|src)="([^"]+)"/g)) resolve(m[1],file);
}
for(const file of files.filter(f=>f.endsWith('.css'))) for(const m of fs.readFileSync(file,'utf8').matchAll(/url\(["']?([^\s"')]+)["']?\)/g)) resolve(m[1],file);
const forbidden=p=>/(^|\/)(?:\.git|\.local|\.tools|instructor-private|backup|backups|bin|build|classes|upstream)(?:\/|$)/i.test(p)||/\.(?:class|jar|war|bak|log)$/.test(p)||/(^|\/)db\.properties$/.test(p)||p.endsWith('.local.sql')||/(^|\/)\.env/.test(p);
function inspect(p,bytes) {
  if(forbidden(p)) fail('Private/unneeded file: '+p);
  const text=bytes.toString('utf8');
  if(p.endsWith('.properties.example') && /^db\.password=(?!CHANGE_ME_LOCAL\s*$).+/m.test(text)) fail('Non-placeholder password: '+p);
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}/.test(text)) fail('Credential pattern: '+p);
  if(p.endsWith('.sql') && /IDENTIFIED BY\s+'(?!CHANGE_ME_LOCAL')[^']+'/i.test(text)) fail('Non-placeholder SQL password: '+p);
}
for(const file of files) inspect(path.relative(dist,file).replaceAll('\\','/'), fs.readFileSync(file));
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'downloads/java/manifest.json'),'utf8'));
if(manifest.length!==11) fail('Expected 11 learner ZIPs');
let zipEntries=0;
for(const item of manifest) {
  const bytes=fs.readFileSync(path.join(dist,'downloads/java',item.file));
  if(bytes.length!==item.bytes || hash(bytes)!==item.sha256) fail('ZIP metadata mismatch '+item.file);
  const entries=unzipStore(bytes); if(entries.size!==item.entries) fail('ZIP entry mismatch '+item.file);
  for(const [p,data] of entries) { if(p.startsWith('/')||p.includes('..')||p.includes('\\')) fail('Unsafe ZIP entry '+p); inspect(p,data); }
  zipEntries+=entries.size;
}
const search=JSON.parse(fs.readFileSync(path.join(dist,'search.json'),'utf8'));
const javaRows=JSON.parse(fs.readFileSync(path.join(root,'src/content/java-pages.json'),'utf8'));
const network=JSON.parse(fs.readFileSync(path.join(root,'src/content/network/course.json'),'utf8'));
const additions=['foundations','missions'].flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,`src/content/network/${f}.json`),'utf8')));
const security=['basic-01-03','basic-04-06','advanced','lunatic'].flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,`src/content/security/${f}.json`),'utf8')));
if(search.length!==javaRows.length+network.lessons.length+network.missions.length+additions.length+security.length+gitLessons.length+gitMissions.length+rescueCases.length || search.some(e=>!e.text||!e.url.startsWith(base))) fail('Incomplete search index');
for(const entry of search) resolve(entry.url,path.join(dist,'index.html'));
const result={base,pages:html.length,references:links,assetReferences:assets,learnerZips:manifest.length,zipEntries,searchDocuments:search.length,status:'PASS'};
fs.mkdirSync(path.join(root,'.local'),{recursive:true});fs.writeFileSync(path.join(root,'.local/check-result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
