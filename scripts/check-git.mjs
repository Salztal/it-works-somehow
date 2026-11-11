import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gitLessons} from '../src/content/git/course.ts';
import {gitMissions} from '../src/content/git/missions.ts';
import {rescueCases,states} from '../src/content/git/rescue.ts';
import {sources} from '../src/content/git/sources.ts';
import {initial,transition,tip,getCommit,reachable} from '../src/lib/git-model.ts';
import {empty,validate,grade} from '../src/lib/progress.ts';
import {searchIndex} from '../src/lib/search.ts';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=JSON.parse(read('dist/search.json')),base=process.env.BASE_PATH||'/';
const normalize=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
const keys=new Set([...gitLessons,...gitMissions].map(l=>l.id));
const catalog=JSON.parse(read('src/generated/git-catalog.json'));
assert.deepEqual(catalog,[...gitLessons,...gitMissions].map(l=>{const section='unit' in l?`unit-${l.unit}`:'exercises';return {id:l.id,number:l.number,title:l.title,description:l.description,section,path:`/git/${section}/${l.id}/`};}));
assert.equal(gitLessons.length,15);assert.equal(gitMissions.length,5);assert.equal(keys.size,20);assert.equal(rescueCases.length,20);
assert.deepEqual([1,2,3,4,5].map(u=>gitLessons.filter(l=>l.unit===u).length),[3,3,3,3,3]);
let questions=0,branches=0;
for(const l of [...gitLessons,...gitMissions]){
 const entry=index.find(e=>e.key==='git:'+l.id);assert.ok(entry,'Search missing '+l.id);
 const html=normalize(read('dist/'+entry.url.slice(base.length)+'index.html'));
 const sections=l.sections??l.steps;
 const prose=sections.flatMap(s=>s.paragraphs).join('');assert.ok(prose.length>=(l.sections?700:230),'Thin prose '+l.id+' '+prose.length);
 for(const text of sections.flatMap(s=>s.paragraphs))assert.ok(html.includes(text),'Not rendered '+l.id);
 assert.equal(new Set(sections.map(s=>s.id)).size,sections.length);
 for(const key of l.related)assert.ok(keys.has(key),'Related key '+key);
 for(const key of l.sources){const r=sources[key];assert.ok(r?.title&&r.version&&r.publisher);assert.equal(r.checked,'2026-11-11');assert.ok(html.includes(r.url));}
 for(const q of l.quiz??l.choices){assert.equal(q.choices.length,4);assert.equal(q.explanations.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.explanations.every(s=>s.length>8));for(const s of [q.question,...q.choices,...q.explanations])assert.ok(html.includes(s),l.id+' question/explanation missing');for(let i=0;i<4;i++){assert.equal(grade(i,q.correct,4),i===q.correct);branches++;}questions++;}
}
assert.equal(questions,40);assert.equal(branches,160);
const rescueHTML=normalize(read('dist/git/rescue/index.html'));
for(const c of rescueCases){assert.ok(c.check&&c.avoid&&c.what);assert.ok(c.routes.some(r=>r.state==='unknown'));for(const r of c.routes){assert.ok(states.some(([k])=>r.state===k));for(const k of ['title','before','action','code','verify','limit'])assert.ok(r[k]&&rescueHTML.includes(r[k]),c.id+' missing '+k);}for(const id of c.lessons)assert.ok(keys.has(id));for(const k of c.sources)assert.ok(sources[k]);assert.ok(index.some(e=>e.url.endsWith('/git/rescue/#'+c.id)));}
assert.deepEqual(rescueCases.find(c=>c.id==='undo').routes.map(r=>r.state),states.map(([k])=>k));
for(const [query,key] of [['コミットが見えなく','git:qa-lost-commit'],['税込 割引','git:gm3'],['受付時間','git:g01'],['force-with-lease','git:g14'],['DTO','java:console-dto'],['DNSSEC','security:s10-02'],['DORA','network:n12-dhcp']])assert.ok(searchIndex(index,query).some(e=>e.key===key),'Search '+query);
const old={...empty(),completed:{'network:routing':true,'java:console-input':true,'security:s01-01':true},answers:{'routing:0':1},notes:{'java:console-input':'以前のメモ'},last:'java:console-input'};
const allKeys=new Set(index.map(e=>e.key));assert.deepEqual(validate(JSON.parse(JSON.stringify(old)),allKeys),old);
const mixed=structuredClone(old);mixed.completed['git:g01']=true;mixed.answers['g01:0']=0;mixed.notes['git:g01']='新しいメモ';mixed.recall['gm3:reason']='双方の意図を残す';mixed.last='git:g01';assert.deepEqual(validate(JSON.parse(JSON.stringify(mixed)),allKeys),mixed);
const run=(s,...actions)=>actions.reduce(transition,s);
let s=initial('branch');const original=structuredClone(s);s=run(s,{type:'branch',target:'task'},{type:'switch',target:'task'},{type:'edit',file:'guide.txt',value:'1'},{type:'stage',file:'guide.txt'},{type:'edit',file:'guide.txt',value:'2'},{type:'commit'});assert.equal(s.branches.main,'A');assert.equal(getCommit(s,tip(s)).tree['guide.txt'],'1');assert.equal(s.wt['guide.txt'],'2');assert.deepEqual(original,initial('branch'));
s=transition(initial('merge'),{type:'merge',target:'topic'});assert.deepEqual(getCommit(s,tip(s)).parents,['B','D']);assert.equal(s.branches.topic,'D');
s=transition(initial('ff'),{type:'merge',target:'topic'});assert.equal(tip(s),'D');assert.equal(s.commits.length,3);
s=transition(initial('squash'),{type:'squash',target:'topic'});assert.equal(tip(s),'B');assert.equal(s.pending,undefined);assert.notDeepEqual(s.index,initial('squash').index);s=transition(s,{type:'commit'});assert.deepEqual(getCommit(s,tip(s)).parents,['B']);assert.ok(!reachable(s,tip(s)).has('D'));
s=transition(initial('pick'),{type:'pick',target:'C'});assert.notEqual(tip(s),'C');assert.equal(getCommit(s,tip(s)).source,'C');assert.deepEqual(getCommit(s,tip(s)).parents,['B']);assert.equal(s.branches.topic,'C');
s=transition(initial('rebase'),{type:'rebase',target:'main'});assert.equal(s.branches.main,'B');assert.notEqual(s.branches.topic,'D');assert.equal(getCommit(s,tip(s)).source,'D');assert.equal(getCommit(s,getCommit(s,tip(s)).parents[0]).source,'C');
for(const [scenario,type,target] of [['conflict','merge','topic'],['pick-conflict','pick','C'],['rebase-conflict','rebase','main']]){
 const before=initial(scenario);s=transition(before,{type,target});assert.ok(s.pending);assert.ok(transition(s,{type:'continue'}).message.startsWith('操作できません'));assert.ok(transition(s,{type:'commit'}).message.startsWith('操作できません'));assert.ok(transition(s,{type:'stage',file:'price.txt'}).message.startsWith('操作できません'));
 const abort=transition(s,{type:'abort'});for(const k of ['head','detached','branches','wt','index'])assert.deepEqual(abort[k],before[k]);
 s=run(s,{type:'resolve',file:'price.txt',value:'price = base * 0.9 * 1.1'},{type:'stage',file:'price.txt'},{type:'continue'});assert.equal(s.pending,undefined);assert.equal(s.wt['price.txt'],'price = base * 0.9 * 1.1');
}
s=transition(initial('revert'),{type:'revert',target:'C'});assert.deepEqual(s.wt,getCommit(s,'A').tree);assert.deepEqual(getCommit(s,tip(s)).parents,['C']);assert.ok(reachable(s,tip(s)).has('C'));
s=transition(initial('rescue'),{type:'reset',target:'A'});const wt=structuredClone(s.wt);assert.equal(tip(s),'A');assert.deepEqual(s.index,getCommit(s,'A').tree);assert.equal(s.reflog[0].from,'C');s=transition(s,{type:'rescue',value:'C'});assert.equal(s.branches['rescue-found'],'C');assert.deepEqual(s.wt,wt);assert.equal(tip(s),'A');
assert.ok(transition(initial('branch'),{type:'commit'}).message.startsWith('操作できません'));assert.ok(transition(initial('merge'),{type:'merge',target:'missing'}).message.startsWith('操作できません'));assert.ok(transition(initial('merge'),{type:'continue'}).message.startsWith('操作できません'));
assert.ok(!/localStorage|fetch\(|XMLHttpRequest|node:|child_process/.test(read('src/lib/git-model.ts')));
console.log(JSON.stringify({status:'PASS',lessons:15,missions:5,faq:20,questions,answerBranches:branches,model:'DAG/tree/index/HEAD, merge/squash/pick/rebase/revert/reset/rescue, conflict continue/abort/invalid order',backup:'v1 legacy + mixed round trip',base},null,2));
