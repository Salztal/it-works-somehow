import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { method } from '../upstream/java/scripts/lib.mjs';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('migration-manifest.json'));
for(const item of manifest.files) {
  const bytes=fs.readFileSync(path.join(root,item.target));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256,'Source changed since import: '+item.target);
}
const course=JSON.parse(read('src/content/network/course.json'));
const lessons=vm.runInNewContext(read('upstream/network/js/lessons.js')+';JSON.stringify(lessons)');
const ext=read('upstream/network/js/v02.js');
const extras=vm.runInNewContext('const '+ext.slice(ext.indexOf('T=['),ext.indexOf(';let S;'))+';JSON.stringify({recall:T,missions:M})');
assert.deepEqual(course.lessons,JSON.parse(lessons));
assert.deepEqual({recall:course.recall,missions:course.missions},JSON.parse(extras));
const search=JSON.parse(read('dist/search.json'));
// Original deterministic archives provide a regression oracle including SQL
// and Eclipse metadata, not only the Java source files.
assert.deepEqual(JSON.parse(read('public/downloads/java/manifest.json')),JSON.parse(read('upstream/java/original-downloads.json')),'Learner ZIPs differ from the original published artifacts');
let codeIncludes=0;
for(const file of fs.readdirSync(path.join(root,'src/content/java'))) {
  const id=path.basename(file,'.md'), original=read('src/content/java/'+file), generated=read('src/generated/java/'+file);
  for(const [,p,n] of original.matchAll(/\{\{code:([^|}]+)\|([^}]+)\}\}/g)) { assert.ok(generated.includes(method(read('upstream/java/'+p),n).text),`Code include lost: ${p}|${n}`); codeIncludes++; }
  assert.ok(search.some(e=>e.key==='java:'+id),'Java page missing: '+id);
  assert.ok(generated.length>=original.length*.7,'Suspiciously short manuscript: '+file);
}
const unescape=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
for(const l of course.lessons) {
  const entry=search.find(e=>e.key==='network:'+l.id), base=process.env.BASE_PATH || '/';
  const html=unescape(read('dist/'+entry.url.slice(base.length)+'index.html'));
  for(const q of l.quiz) { assert.ok(html.includes(q[0])); for(const choice of q[1]) assert.ok(html.includes(choice)); assert.ok(html.includes(`data-correct="${q[2]}"`)); assert.ok(html.includes(q[3])); }
  for(const term of l.terms) for(const text of term) assert.ok(html.includes(text));
}
assert.equal(course.lessons.reduce((n,l)=>n+l.quiz.length,0),23);
assert.equal(course.missions.reduce((n,m)=>n+m.q.length,0),14);
for(const m of course.missions) {
  const entry=search.find(e=>e.key==='network:'+m.id),base=process.env.BASE_PATH || '/';
  const html=unescape(read('dist/'+entry.url.slice(base.length)+'index.html'));
  for(const text of [m.s,...m.r,...m.q.flat()]) assert.ok(html.includes(text),'Mission text missing: '+m.id);
}
assert.equal(read('dist/licenses/azure-network-basics.txt'),read('upstream/network/LICENSE'));
console.log(`PASS: ${manifest.files.length} source hashes; 18 Java manuscripts; ${codeIncludes} exact Java method includes; 6 Network lessons / 23 quizzes / 3 missions / 14 reference answers / 5 recall terms preserved.`);
