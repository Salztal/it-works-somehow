import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),base=process.env.BASE_PATH||'/';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const expected=['network','java','security','git','test-design','web','spring','mail'].map(id=>base+id+'/');
const links=text=>[...text.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1]);
const sameLinks=(actual,message)=>assert.deepEqual([...actual].sort(),[...expected].sort(),message);
const html=walk(path.join(root,'dist')).filter(p=>p.endsWith('.html'));
for(const file of html){
 const text=fs.readFileSync(file,'utf8');
 const nav=text.match(/<nav\b[^>]*aria-label="メインナビゲーション"[^>]*>([\s\S]*?)<\/nav>/)?.[1];assert.ok(nav,file);
 const panel=nav.match(/<div\b[^>]*id="catalog-panel"[^>]*>([\s\S]*)<\/div>/)?.[1];assert.ok(panel,file);sameLinks(links(panel),'Native category links '+file);
 assert.match(nav,/<details\b[^>]*data-catalog-menu/);assert.match(nav,/<summary\b[^>]*aria-controls="catalog-panel"/);
 assert.equal(links(nav).length,10,'Eight categories and two fixed utilities '+file);
 assert.ok(links(nav).includes(base+'search/'));assert.ok(links(nav).includes(base+'progress/'));
 const footer=text.match(/<nav\b[^>]*aria-label="分野別の教材"[^>]*>([\s\S]*?)<\/nav>/)?.[1];assert.ok(footer,file);sameLinks(links(footer),'Shared footer '+file);
 const chapter=text.match(/<details\b[^>]*class="course-navigation"[^>]*>/)?.[0];if(chapter){const reading=/<body\b[^>]*data-current="[^"]+"/.test(text);assert.equal(/\bopen(?:\s|>)/.test(chapter),reading,'Progressive chapter default '+file);}
}
const home=read('dist/index.html');
const title=home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g,'');assert.ok(title.length<40);assert.ok(!/Java|Security|Spring|Mail|ネットワーク/.test(title));
let offset=-1;for(const marker of ['class="home-intro"','class="home-search"','data-resume-panel','class="home-purposes"','id="courses"']){const next=home.indexOf(marker);assert.ok(next>offset,'Home order '+marker);offset=next;}
assert.match(home,/data-resume-panel\b[^>]*hidden/);for(const id of ['courses','courses-title','quick-title','resume-title','home-query'])assert.ok(home.includes(`id="${id}"`),'Existing home anchor '+id);
for(const title of ['仕組みから学ぶ','動かして理解する','困りごとから調べる'])assert.ok(home.includes(title));
for(const p of ['git/rescue/','web/diagnosis/','mail/diagnosis/','java/downloads/'])assert.ok(links(home).includes(base+p));
assert.equal((home.match(/<article\b[^>]*class="course-card /g)||[]).length,8);
const css=read('src/styles/ui.css');assert.ok(!/outline\s*:\s*(?:none|0)\b/.test(css),'Keep focus indicators');assert.ok(css.includes('min-height:44px'));assert.ok(css.includes('overflow-y:auto'));assert.ok(css.includes('@media(max-width:600px)'));
// Optional local audit snapshot proves the UI task did not change protected content/data/models.
const baselinePath=path.join(root,'.local/ui-phase9/protected-baseline.json');let protectedFiles=null;
if(fs.existsSync(baselinePath)){const original=JSON.parse(fs.readFileSync(baselinePath,'utf8'));for(const [file,hash] of Object.entries(original)){const now=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');assert.equal(now,hash,'Protected source changed: '+file);}protectedFiles=Object.keys(original).length;}
const indexPath=path.join(root,'.local/ui-phase9/search-baseline.json');let searchUnchanged=null;
if(fs.existsSync(indexPath)){
 const normalize=(docs,prefix)=>docs.map(d=>({...d,url:d.url.slice(prefix.length),text:d.area==='java'?d.text.replaceAll(']('+prefix,'](/'):d.text}));
 assert.deepEqual(normalize(JSON.parse(read('dist/search.json')),base),normalize(JSON.parse(fs.readFileSync(indexPath,'utf8')),'/'),'Search documents and data unchanged');searchUnchanged=true;
}
const result={status:'PASS',base,pages:html.length,nativeCategoryLinks:8,fixedHeaderUtilities:2,sharedFooterLinks:8,homeOrder:'intro/search/conditional-resume/purposes/courses',protectedFiles,searchUnchanged,scope:'Static UI and local integrity checks. Browser interaction checks are recorded separately.'};
fs.mkdirSync(path.join(root,'.local'),{recursive:true});fs.writeFileSync(path.join(root,'.local/ui-check-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
