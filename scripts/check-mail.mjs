import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mailLessons} from '../src/content/mail/course.ts';
import {mailMissions} from '../src/content/mail/missions.ts';
import {mailCases} from '../src/content/mail/diagnosis.ts';
import {sources} from '../src/content/mail/sources.ts';
import {comparisons} from '../src/content/mail/comparisons.ts';
import {glossary} from '../src/content/mail/glossary.ts';
import {labs,labUI} from '../src/content/mail/labs.ts';
import {mailConnections} from '../src/lib/mail.ts';
import {defaultConfig,initialLab,labEvent,labRows,labLog,evaluateAuth,resolveMX} from '../src/lib/mail-model.ts';
import {empty,validate,grade} from '../src/lib/progress.ts';
import {searchIndex} from '../src/lib/search.ts';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),base=process.env.BASE_PATH||'/';
const oracle=JSON.parse(read('scripts/fixtures/mail-expectations.json')),index=JSON.parse(read('dist/search.json')),all=[...mailLessons,...mailMissions];
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
assert.equal(mailLessons.length,15);assert.equal(mailMissions.length,5);assert.equal(labs.length,8);assert.equal(mailCases.length,15);assert.equal(comparisons.length,16);
assert.deepEqual([1,2,3,4,5].map(u=>mailLessons.filter(l=>l.unit===u).length),[3,3,3,3,3]);
assert.equal(new Set(all.map(l=>l.id)).size,20);assert.equal(new Set(index.map(e=>e.key)).size,index.length);
const answerKey=[[1,2,0],[2,0,1],[1,2,0],[0,2,1],[2,1,0],[1,0,2],[0,2,1],[1,0,2],[0,2,1],[2,0,1],[1,2,0],[0,2,1],[2,1,0],[0,1,2],[2,0,1],[1,0,2],[2,1,0],[0,2,1],[1,0,2],[0,2,1]];
let questions=0,branches=0,states=0;const uniqueQuestions=new Set();
for(const [i,item] of all.entries()){
 assert.match(item.id,/^mail-(?:ml\d{2}|m\d)$/);assert.ok(item.quiz.length>=3);assert.ok(labUI[item.lab]);
 const doc=index.find(e=>e.key===`mail:${item.id}`);assert.ok(doc);const html=decode(read('dist/'+doc.url.slice(base.length)+'index.html'));
 const prose='unit' in item?[item.situation,...item.sections.flatMap(s=>[s.title,...s.paragraphs])]:[item.background,item.assumptions,...item.evidence,...item.targets,...item.explanation,...item.unknown];
 assert.ok(prose.join('').length>420,'Thin content '+item.id);for(const p of prose)assert.ok(html.includes(p),'Missing manuscript '+item.id);
 assert.ok(item.related.length);for(const id of item.related)assert.ok(all.some(x=>x.id===id));for(const key of item.sources)assert.ok(sources[key]);
 item.quiz.forEach((q,n)=>{questions++;assert.equal(q.correct,answerKey[i][n]);assert.equal(q.choices.length,4);assert.equal(q.explanations.length,4);assert.ok(!uniqueQuestions.has(q.question));uniqueQuestions.add(q.question);q.choices.forEach((choice,k)=>{branches++;assert.ok(q.explanations[k].length>8);assert.ok(html.includes(choice));assert.ok(html.includes(q.explanations[k]));assert.equal(grade(k,q.correct,4),k===answerKey[i][n]);});});
}
assert.equal(questions,60);assert.equal(branches,240);
for(const [kind] of labs){const html=read(`dist/mail/lab/${kind}/index.html`);assert.ok(html.includes(`data-mail-lab="${kind}"`));assert.ok(html.includes('aria-live="polite"'));assert.ok(html.includes('初期状態に戻す'));assert.ok(html.includes(labUI[kind].assumptions));assert.ok(html.includes(labUI[kind].unknown));for(const [event] of labUI[kind].actions)assert.ok(html.includes(`data-event="${event}"`));assert.ok(index.some(e=>e.key===`mail:lab-${kind}`));const s=initialLab(kind);assert.ok(Object.keys(labRows(s)).length);assert.ok(labLog(s).length);assert.throws(()=>labEvent(s,'undefined'));assert.throws(()=>initialLab(kind,{undefined:'x'}));assert.throws(()=>initialLab(kind,{[labUI[kind].fields[0].name]:'undefined'}));assert.deepEqual(initialLab(kind),s,'reset');}
for(const c of mailCases){assert.ok(c.first&&c.facts.length&&c.causes.length&&c.steps.length>=3&&c.log&&c.avoid&&c.unknown);assert.ok(labUI[c.lab]);assert.ok(index.some(e=>e.key===`mail:qa-${c.id}`));const html=decode(read('dist/mail/diagnosis/index.html'));for(const p of [c.title,c.first,c.log,c.avoid,c.unknown,...c.facts,...c.causes,...c.steps])assert.ok(html.includes(p));for(const id of c.related)assert.ok(mailLessons.some(l=>l.id===id));}
for(const c of comparisons){assert.ok(sources[c.source]);assert.ok(c.when.length>20);assert.ok(mailLessons.some(l=>l.id===c.lesson));assert.ok(index.some(e=>e.key===`mail:comparison-${c.id}`));}
for(const t of glossary){assert.ok(mailLessons.some(l=>l.id===t.lesson));assert.ok(index.some(e=>e.key===`mail:term-${t.id}`));}
for(const s of Object.values(sources)){assert.equal(s.checked,'2026-11-16');assert.ok(s.version&&s.scope);assert.equal(new URL(s.url).protocol,'https:');}
// An operation cannot mutate the state it was given, including rejected operations.
const apply=(s,event,c={})=>{const snapshot=structuredClone(s);let next;try{next=labEvent(s,event,c);}finally{assert.deepEqual(s,snapshot,'immutable '+s.kind+' '+event);}states++;return next;};
let s=initialLab('trace');assert.throws(()=>apply(s,'next'));
for(const [event,phase,step,sender,receiver,mailbox,imap] of oracle.trace){s=apply(s,event);assert.deepEqual([s.phase,s.step,s.rows.送信側キュー,s.rows.受信側キュー,s.rows.メールボックス,s.rows.IMAP],[phase,step,sender,receiver,mailbox,imap]);}
assert.throws(()=>apply(s,'next'));assert.deepEqual(initialLab('trace'),initialLab('trace'),'reset after complete');
for(const [fault,count,phase,step,sender,receiver,reason] of oracle.faults){let t=apply(initialLab('trace'),'compose');for(let i=0;i<count;i++)t=apply(t,'next',{fault});assert.deepEqual([t.phase,t.step,t.rows.送信側キュー,t.rows.受信側キュー],[phase,step,sender,receiver],fault);assert.ok(JSON.stringify(t).includes(reason),fault);if(phase==='deferred'||phase==='held'){let r=apply(t,'retry',{fault:'none'});assert.equal(r.hours,24);r=apply(r,'next',{fault:'none'});assert.equal(r.phase,'running');let expired=t;for(let i=0;i<3;i++){expired=apply(expired,'retry',{fault});if(expired.phase==='running')expired=apply(expired,'next',{fault});}assert.equal(expired.phase,'bounced');assert.ok(expired.rows.通知.includes(fault==='quota'?'受信側':'送信側'));}if(fault==='imap'){t=apply(t,'retry',{fault:'none'});t=apply(t,'next');assert.equal(t.rows.IMAP,'取得済み・未読');assert.equal(t.rows.送信側キュー,'sent / 除去');}}
// Inject a fault only after sender acceptance; earlier facts must remain true.
s=apply(initialLab('trace'),'compose');for(let i=0;i<7;i++)s=apply(s,'next');s=apply(s,'next',{fault:'4xx'});assert.equal(s.phase,'deferred');assert.equal(s.rows.送信側の観測,'250受付 / Queue S8A01');
s=initialLab('smtp');const bad=apply(s,'data');assert.equal(bad.phase,'connected');assert.equal(bad.rows.応答,'503 Bad sequence of commands');
for(const [event,phase,reply] of oracle.smtp){s=apply(s,event);assert.deepEqual([s.phase,s.rows.応答],[phase,reply]);}assert.throws(()=>apply(s,'ehlo'));
let transaction=apply(initialLab('smtp'),'ehlo');transaction=apply(transaction,'mail');transaction=apply(transaction,'rcpt');transaction=apply(transaction,'ehlo');assert.equal(transaction.phase,'greeted','EHLO resets transaction');transaction=apply(transaction,'data');assert.equal(transaction.rows.応答,'503 Bad sequence of commands');transaction=apply(transaction,'mail');transaction=apply(transaction,'rcpt');transaction=apply(transaction,'data');assert.throws(()=>apply(transaction,'quit'));assert.throws(()=>apply(transaction,'ehlo'));
for(const [response,phase,classification] of oracle.smtpReplies){let t=apply(initialLab('smtp'),'ehlo');t=apply(t,'mail');t=apply(t,'rcpt',{response});assert.deepEqual([t.phase,t.rows.応答,t.rows.分類],[phase,response,classification]);}
for(const [record,status,hosts] of oracle.dns){assert.deepEqual(resolveMX(record),{status,hosts});let t=apply(initialLab('dns'),'lookup',{record});assert.equal(t.rows.DNS結果,status);if(hosts.length){t=apply(t,'connect',{record});assert.equal(t.rows.接続候補,hosts[0]);assert.equal(t.phase,'connected');}else assert.throws(()=>apply(t,'connect',{record}));}assert.throws(()=>resolveMX('undefined'));
s=apply(initialLab('dns'),'lookup');s=apply(s,'connect',{reachable:'no'});assert.equal(s.phase,'resolved');s=apply(s,'connect',{reachable:'no'});assert.equal(s.phase,'failed');assert.equal(s.rows.接続候補,'mx2.receiver.test');
s=initialLab('queue');assert.throws(()=>apply(s,'deliver'));for(const [event,c,phase,hours,attempts,notice] of oracle.queue){s=apply(s,event,c);assert.deepEqual([s.phase,s.hours,s.attempts,s.rows.通知],[phase,hours,attempts,notice]);}assert.throws(()=>apply(s,'retry'));
for(const [response,phase,notice] of [['250','sent','未生成'],['550','bounced','DSN生成・配送未確認']]){let t=apply(initialLab('queue'),'enqueue');t=apply(t,'activate');t=apply(t,'deliver',{response});assert.deepEqual([t.phase,t.rows.通知],[phase,notice]);}
s=apply(initialLab('queue'),'enqueue');s=apply(s,'activate');s=apply(s,'deliver',{response:'451'});assert.throws(()=>apply(s,'retry'));s=apply(s,'tick');s=apply(s,'retry');s=apply(s,'deliver',{response:'250'});assert.equal(s.phase,'sent');
for(const [c,expected] of oracle.auth){const a=evaluateAuth(c);assert.deepEqual([a.spf,a.dkim,a.spfAligned,a.dkimAligned,a.dmarc,a.policy],expected,JSON.stringify(c));const t=apply(initialLab('auth'),'evaluate',c);assert.equal(t.rows.DMARC,expected[4]);assert.equal(t.rows.SPF,expected[0]);assert.equal(t.rows['DKIM検証結果（仮定）'],expected[1]);}
for(const [c,steps,phase,tls,identity,auth] of oracle.tls){let t=initialLab('tls',c);for(let i=0;i<steps;i++)t=apply(t,'next',c);assert.deepEqual([t.phase,t.rows.TLS,t.rows.相手検証??null,t.rows.AUTH??null],[phase,tls,identity,auth],JSON.stringify(c));assert.throws(()=>apply(t,'next',c));}
s=initialLab('imap');assert.throws(()=>apply(s,'sync'));assert.throws(()=>apply(s,'fetch'));assert.throws(()=>apply(s,'read'));assert.throws(()=>apply(s,'move'));
for(const [event,c,server,seen,logged,folder,cache,fetched] of oracle.imap){s=apply(s,event,c);assert.deepEqual([s.server,s.seen,s.logged,s.folder,s.cache,s.fetched],[server,seen,logged,folder,cache,fetched]);}
let marked=apply(initialLab('imap'),'deliver');marked=apply(marked,'login');marked=apply(marked,'sync');marked=apply(marked,'read');assert.equal(marked.seen,true);assert.equal(marked.fetched,false,'STORE does not fetch body');
s=apply(initialLab('imap'),'deliver');s=apply(s,'login',{auth:'fail'});assert.equal(s.server,true);assert.equal(s.logged,false);assert.throws(()=>apply(s,'sync'));
for(const [scenario,scope,log] of oracle.headers){let t=apply(initialLab('headers'),'headers',{scenario});assert.ok(t.rows.ヘッダー.includes('forged.invalid'));t=apply(t,'sender',{scenario});assert.equal(t.rows.確定範囲,'宛先MTAへの引渡し。最終保存・閲覧は未確認。');t=apply(t,'receiver',{scenario});assert.equal(t.rows.確定範囲,scope);assert.ok(t.rows.受信側.includes(log));}
// Every selectable value can initialize; unknown inputs cannot silently become a default.
for(const [kind] of labs)for(const f of labUI[kind].fields)for(const [v] of f.options){const c={...defaultConfig(kind),[f.name]:v};assert.doesNotThrow(()=>initialLab(kind,c));}
assert.throws(()=>initialLab('unknown'));assert.throws(()=>evaluateAuth({author:'bad.invalid'}));
const keys=new Set(index.map(e=>e.key));
const old={...empty(),completed:{'network:routing':true,'java:console-input':true,'security:s01-01':true,'git:g01':true,'test-design:td-t01':true,'web:web-h01':true,'spring:spring-s08':true},answers:{'routing:0':1,'spring-s08:0':1},notes:{'java:console-input':'旧メモ'},recall:{'web-h01:think':'旧自由記述'},last:'spring:spring-s08'};
assert.deepEqual(validate(JSON.parse(JSON.stringify(old)),keys),old);
const mixed=structuredClone(old);mixed.completed['mail:mail-ml08']=true;mixed.answers['mail-ml08:0']=1;mixed.notes['mail:mail-ml08']='passと整合';mixed.recall['mail-m5:investigation']='202は要求登録';mixed.last='mail:mail-ml08';assert.deepEqual(validate(JSON.parse(JSON.stringify(mixed)),keys),mixed);
assert.ok(read('src/lib/client.ts').includes('technical-notes:v1:${document.body.dataset.base}'));assert.ok(read('src/lib/client.ts').includes("'web','spring','mail'"),'Mail progress counters');
for(const [id,related] of Object.entries(mailConnections)){const old=index.find(e=>e.key.endsWith(':'+id)&&!e.key.startsWith('mail:'));assert.ok(old,'Connection missing '+id);const html=read('dist/'+old.url.slice(base.length)+'index.html');for(const target of related){assert.ok(mailLessons.some(l=>l.id===target));assert.ok(html.includes(target));}}
for(const [query,key] of [['DMARC','mail:mail-ml08'],['535','mail:qa-mail-case-auth'],['Null MX','mail:lab-dns'],['Message-ID','mail:comparison-ids'],['冪等性','spring:lab-idempotency'],['Servlet','java:web-flow']])assert.ok(searchIndex(index,query).some(e=>e.key===key),query);
for(const p of ['src/lib/mail-model.ts','src/lib/mail-client.ts','src/lib/mail-diagnosis-client.ts'])assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage\.setItem|https?:\/\//.test(read(p)),'No external traffic or independent storage '+p);
const result={status:'PASS',base,lessons:15,missions:5,questions,answerBranches:branches,labs:8,diagnosisCases:15,comparisons:16,glossary:glossary.length,fixedAuthCases:oracle.auth.length,fixedTLSCases:oracle.tls.length,fixedTraceStates:oracle.trace.length,faultCases:oracle.faults.length,checkedTransitions:states,progress:'v1 old + mixed JSON round trips',scope:'Synthetic browser models only; real mail servers and delivery NOT tested'};
fs.mkdirSync(new URL('../.local/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../.local/mail-check-result.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
