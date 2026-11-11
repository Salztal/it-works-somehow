import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {testLessons} from '../src/content/test-design/course.ts';
import {testMissions} from '../src/content/test-design/missions.ts';
import {sources} from '../src/content/test-design/sources.ts';
import {labs,intents} from '../src/content/test-design/labs.ts';
import {expectedAmount,expectedTodo} from '../src/lib/test-design-spec.ts';
import {faultyAmount,faultyTodo} from '../src/lib/test-design-target.ts';
import {amountCandidates,runAmount,integerPartitions,decisionRules,ruleExpected,initialRules,checkRules,states,events,initialWorkflow,workflowEvent,validTransitions,codeCoverage,traceImpact,impactNodes,pairCoverage,runTodo} from '../src/lib/test-design-model.ts';
import {empty,validate,grade} from '../src/lib/progress.ts';
import {searchIndex} from '../src/lib/search.ts';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),base=process.env.BASE_PATH||'/';
const normalize=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
const index=JSON.parse(read('dist/search.json')),catalog=JSON.parse(read('src/generated/test-design-catalog.json'));
assert.equal(testLessons.length,15);assert.equal(testMissions.length,5);
assert.deepEqual([1,2,3,4,5].map(u=>testLessons.filter(l=>l.unit===u).length),[3,3,3,3,3]);
const all=[...testLessons,...testMissions],keys=new Set(all.map(l=>l.id));assert.equal(keys.size,20);
assert.deepEqual(catalog,all.map(l=>{const section='unit' in l?`unit-${l.unit}`:'exercises';return {id:l.id,number:l.number,title:l.title,description:l.description,section,path:`/test-design/${section}/${l.id}/`};}));
// Reviewed answer key is independent of grade() and the runtime question.correct field.
const answerKey=[[1,2,0],[2,0,3],[1,0,2],[2,1,0],[3,1,2],[0,2,1],[1,0,3],[2,1,0],[3,1,2],[1,0,3],[2,1,0],[3,1,2],[0,2,1],[3,0,2],[1,0,2],[2,0,1],[3,1,0],[2,0,1],[3,1,0],[2,0,1]];
let questions=0,answerBranches=0;const questionTexts=new Set(),paragraphs=new Set();
all.forEach((l,li)=>{
 assert.match(l.id,/^td-(t\d{2}|m[1-5])$/);
 const entry=index.find(e=>e.key===`test-design:${l.id}`);assert.ok(entry,'Missing search '+l.id);
 const html=normalize(read('dist/'+entry.url.slice(base.length)+'index.html'));
 const prose=l.explanation??[l.background,l.scope,l.assignment,...l.model,...l.defects,...l.risks];assert.ok(prose.join('').length>=('unit' in l?450:400),'Thin prose '+l.id);
 for(const p of prose){assert.ok(html.includes(p),'Not rendered '+l.id);assert.ok(!paragraphs.has(p),'Repeated paragraph');paragraphs.add(p);}
 for(const key of l.related)assert.ok(keys.has(key));
 assert.ok(l.sources.length>0);for(const k of l.sources){const s=sources[k];assert.ok(s?.title&&s.publisher&&s.version&&s.scope);assert.equal(s.checked,'2026-11-11');assert.ok(html.includes(s.url));}
 assert.ok(labs.some(([k])=>k===l.lab));assert.ok(html.includes(`data-test-lab="${l.lab}"`));
 for(const name of 'unit' in l?['situation','think','technique','example','practice','omissions','quiz','sources']:['situation','scope','quiz','assignment','model','risk','sources'])assert.ok(html.includes(`id="${name}"`));
 const qs=l.quiz??l.choices;assert.ok(qs.length>=3);
 qs.forEach((q,qi)=>{assert.equal(q.correct,answerKey[li][qi],l.id+' answer '+qi);assert.equal(q.choices.length,4);assert.equal(q.explanations.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(!questionTexts.has(q.question),'Duplicate question');questionTexts.add(q.question);assert.ok(q.explanations.every(s=>s.length>=12));for(const s of [q.question,...q.choices,...q.explanations])assert.ok(html.includes(s),l.id+' question missing');for(let i=0;i<4;i++){assert.equal(grade(i,q.correct,4),i===answerKey[li][qi]);answerBranches++;}questions++;});
});
assert.equal(questions,60);assert.equal(answerBranches,240);
for(const [lab] of labs){assert.ok(read(`dist/test-design/lab/${lab}/index.html`).includes(`data-test-lab="${lab}"`));assert.ok(index.some(e=>e.key===`test-design:lab-${lab}`));}
assert.equal(intents.length,6);for(const i of intents){assert.ok(keys.has(i.lesson));assert.ok(keys.has(i.mission));assert.ok(labs.some(([k])=>k===i.lab));}
// Literal acceptance/error fixtures are the authority, never the faulty code output.
const amountFixtures=[['-1','範囲エラー'],['0','範囲エラー'],['1','受理'],['2','受理'],['500000','受理'],['999999','受理'],['1000000','受理'],['1000001','範囲エラー'],['','未入力エラー'],['  ','未入力エラー'],['1.5','形式エラー'],['1.0','形式エラー'],['abc','形式エラー'],['NaN','形式エラー'],['Infinity','形式エラー'],['1e3','形式エラー'],['1,000','形式エラー'],['１','形式エラー'],['+1','受理'],['0001','受理'],['-0','範囲エラー'],[' 1 ','受理'],['9'.repeat(200),'範囲エラー']];
for(const [value,result] of amountFixtures)assert.equal(expectedAmount(value),result,'oracle '+value);
const independentAmount=value=>{const t=value.trim();if(!t)return '未入力エラー';if(!/^[+-]?[0-9]+$/.test(t))return '形式エラー';const n=BigInt(t);return n>=1n&&n<=1000000n?'受理':'範囲エラー';};
for(const n of [...Array.from({length:21},(_,i)=>i-10),...Array.from({length:21},(_,i)=>999990+i),...Array.from({length:1000},(_,i)=>i*999)])assert.equal(expectedAmount(String(n)),independentAmount(String(n)));
assert.equal(faultyAmount('0'),'受理');assert.equal(faultyAmount('1000000'),'範囲エラー');assert.equal(faultyAmount(''),'受理');
let report=runAmount(['500000']);assert.equal(report.rows.filter(r=>!r.match).length,0);assert.equal(report.covered.length,1);assert.equal(report.missing.length,10);
report=runAmount(['500000','0','1000000','']);assert.equal(report.rows.filter(r=>!r.match).length,3);assert.equal(report.covered.length,4);
assert.equal(runAmount(Array(20).fill('500000')).covered.length,1,'Do not grade by case count');
assert.ok(runAmount(amountCandidates.filter(v=>v!=='0')).missing.includes('下限の外側（0）'),'Negative representative must not hide an untested zero boundary');
report=runAmount(amountCandidates);assert.equal(report.covered.length,11);assert.deepEqual(report.rows.filter(r=>!r.match).map(r=>r.value),['0','1000000','']);assert.ok(runAmount(amountCandidates,true).rows.every(r=>r.match));
assert.deepEqual(integerPartitions(1,10,2).values,[0,1,10,11]);assert.deepEqual(integerPartitions(1,10,3).values,[0,1,2,9,10,11]);assert.deepEqual(integerPartitions(1,1,3).values,[0,1,2]);assert.deepEqual(integerPartitions(Number.MAX_SAFE_INTEGER-1,Number.MAX_SAFE_INTEGER-1,2).values,[Number.MAX_SAFE_INTEGER-2,Number.MAX_SAFE_INTEGER-1,Number.MAX_SAFE_INTEGER]);assert.deepEqual(integerPartitions(-2,0,3).values,[-3,-2,-1,0,1]);
for(const args of [[2,1,2],[NaN,3,2],[1,Infinity,2],[1.5,3,2],[1,3,4],[Number.MIN_SAFE_INTEGER,1,2],[1,Number.MAX_SAFE_INTEGER,3]])assert.throws(()=>integerPartitions(...args));
// Decision table fixture is written as an independent rule matrix.
const ruleFixture=['拒否','拒否','自動承認','不可能','拒否','拒否','自動承認','不可能','拒否','拒否','保留','不可能','拒否','拒否','承認','不可能'];
decisionRules.forEach((r,i)=>assert.equal(ruleExpected(r),ruleFixture[i]));
assert.deepEqual(checkRules(initialRules()),{total:12,missing:['R3'],wrong:['R7']});
const completed=Object.fromEntries(ruleFixture.flatMap((v,i)=>v==='不可能'?[]:[["R"+(i+1),v]]));assert.deepEqual(checkRules(completed),{total:12,missing:[],wrong:[]});
assert.equal(checkRules({}).missing.length,12);
// All 20 state/event intersections, including 13 forbidden transitions.
const stateFixture={下書き:['申請中',null,'取消済み',null],申請中:[null,'承認済み','取消済み','差戻し'],差戻し:['申請中',null,'取消済み',null],承認済み:[null,null,null,null],取消済み:[null,null,null,null]};
for(const state of states)events.forEach((event,i)=>{const before={...initialWorkflow(),state},copy=structuredClone(before),after=workflowEvent(before,event),expected=stateFixture[state][i];assert.equal(after.state,expected??state);assert.equal(after.valid.length,expected?1:0);assert.equal(after.invalid.length,expected?0:1);assert.deepEqual(before,copy,'Must not mutate previous state');});
let w=initialWorkflow();for(const e of ['申請','差戻し','申請','承認','取消'])w=workflowEvent(w,e);assert.equal(w.state,'承認済み');assert.equal(w.valid.length,4);assert.equal(w.invalid.length,1);assert.equal(w.visited.length,4);assert.equal(validTransitions.length,7);assert.deepEqual(initialWorkflow(),{state:'下書き',visited:['下書き'],valid:[],invalid:[],history:[]});assert.throws(()=>workflowEvent(w,'削除'));
assert.equal(codeCoverage([]).statements.length,0);let c=codeCoverage([{amount:1,approved:true}]);assert.equal(c.statements.length,3);assert.equal(c.branches.length,1);
c=codeCoverage([{amount:1,approved:true},{amount:0,approved:false}]);assert.equal(c.branches.length,2);assert.ok(c.rows.every(r=>r.match));
c=codeCoverage([{amount:1,approved:true},{amount:0,approved:false},{amount:1000001,approved:true},{amount:1.5,approved:true}]);assert.equal(c.branches.length,2);assert.deepEqual(c.rows.map(r=>r.match),[true,true,false,false]);assert.throws(()=>codeCoverage([{amount:NaN,approved:true}]));
assert.deepEqual(pairCoverage([0,3,5,6]),{covered:12,total:12,tripleDefect:false});assert.deepEqual(pairCoverage([0,3,5,6,7]),{covered:12,total:12,tripleDefect:true});assert.equal(pairCoverage([]).covered,0);assert.equal(pairCoverage([0,0]).covered,3);assert.throws(()=>pairCoverage([8]));
const paths=traceImpact('api');assert.deepEqual(paths.search,['api','dto','dao','search']);assert.deepEqual(paths.legacy,['api','dto','dao','db','migration','legacy']);assert.deepEqual(Object.keys(paths).sort(),Object.keys(impactNodes).sort());assert.throws(()=>traceImpact('unknown'));assert.throws(()=>traceImpact('__proto__'));
const todoFixtures=[['create','','保存：優先度2'],['create','1','保存：優先度1'],['create','3','保存：優先度3'],['create','0','入力エラー'],['create','4','入力エラー'],['create','1.5','入力エラー'],['create','01','入力エラー'],['update','','保存：優先度3'],['update','1','保存：優先度1'],['search','3','行：A'],['search','1','行：C'],['search','2','行：なし'],['search','','入力エラー'],['migrate','','A:3 / B:2 / C:1']];
for(const [operation,value,expected] of todoFixtures)assert.equal(expectedTodo({operation,value}),expected);
assert.equal(faultyTodo({operation:'update',value:''}),'保存：優先度2');assert.equal(faultyTodo({operation:'search',value:'3'}),'行：A,B,C');assert.equal(faultyTodo({operation:'migrate',value:''}),'A:3 / B:空欄 / C:1');
const todoCases=todoFixtures.map(([operation,value])=>({operation,value}));assert.ok(runTodo(todoCases,true).rows.every(r=>r.match));assert.equal(runTodo(todoCases).covered.length,9);assert.equal(runTodo([{operation:'create',value:'2'}]).rows[0].match,true);assert.equal(runTodo([{operation:'update',value:''}]).rows[0].match,false);
// Preserve the exact v1 schema and storage namespace. Cover pre-Security/pre-Git and mixed backups.
const allKeys=new Set(index.map(e=>e.key));
for(const old of [{...empty(),completed:{'network:routing':true,'java:console-input':true},answers:{'routing:0':1},recall:{'routing:why':'経路を選ぶ'},notes:{'java:console-input':'旧メモ'},last:'java:console-input'},{...empty(),completed:{'security:s01-01':true,'git:g01':true},answers:{'g01:0':0},last:'git:g01'}]){
 assert.deepEqual(validate(JSON.parse(JSON.stringify(old)),allKeys),old);
 const mixed=structuredClone(old);mixed.completed['test-design:td-t01']=true;mixed.answers['td-t01:0']=1;mixed.recall['td-m1:design']='上限値を確認';mixed.notes['test-design:td-t01']='未確認の条件';mixed.last='test-design:td-t01';assert.deepEqual(validate(JSON.parse(JSON.stringify(mixed)),allKeys),mixed);
}
assert.ok(read('src/lib/client.ts').includes('technical-notes:v1:${document.body.dataset.base}'));
assert.ok(!read('src/lib/test-design-spec.ts').includes('faulty'));
assert.ok(!/expectedAmount\(|expectedTodo\(/.test(read('src/lib/test-design-target.ts')));
for(const [query,key] of [['未入力エラー','test-design:td-t03'],['条件網羅','test-design:td-t10'],['回帰','test-design:td-t12'],['決定表','test-design:lab-decision'],['不具合報告','test-design:templates'],['DTO','java:console-dto'],['force-with-lease','git:g14'],['DNSSEC','security:s10-02'],['DORA','network:n12-dhcp']])assert.ok(searchIndex(index,query).some(e=>e.key===key),'Search '+query);
const templateFields={'viewpoints.csv':['対象機能','要求・仕様の参照','観点','対象条件','リスク','テスト技法','関連するテストケース'],'test-cases.csv':['テストID','対象機能','前提条件','操作・入力','期待結果','実施結果','証跡','備考'],'defect-report.csv':['不具合ID','概要','発生環境','再現手順','期待結果','実際結果','発生頻度','影響範囲','証跡','修正確認結果']};
for(const [file,fields] of Object.entries(templateFields)){const csv=read('dist/downloads/test-design/'+file).trimEnd().split(/\r?\n/);assert.deepEqual(csv[0].split(','),fields);for(const line of csv)assert.equal(line.split(',').length,fields.length);assert.equal(read('src/content/test-design/templates/'+file),read('dist/downloads/test-design/'+file));}
assert.ok(read('dist/downloads/test-design/templates.md').includes('特定企業の正式な業務標準'));
console.log(JSON.stringify({status:'PASS',lessons:15,missions:5,questions,answerBranches,labs:8,model:'independent fixtures: amount, partitions, 16 rules, 20 state/events, coverage, pairwise, impact, Todo',backup:'v1 legacy + mixed',base},null,2));
