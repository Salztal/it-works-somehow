import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {subnet,ipv4,dotted,vlan,routing,dhcp,pat,dns,diagnose,outageCases,tcpTrace,tcpScenarios} from '../src/lib/network-model.ts';
import {validate,grade} from '../src/lib/progress.ts';
import {searchIndex} from '../src/lib/search.ts';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const lessons=json('src/content/network/foundations.json'),missions=json('src/content/network/missions.json'),legacy=json('src/content/network/course.json');
const additions=[...lessons,...missions],index=json('dist/search.json'),base=process.env.BASE_PATH||'/';
const sourcesByUrl=new Map(Object.values(json('src/content/network/sources.json')).map(s=>[s.url,s]));
const keys=new Set(index.map(e=>e.key));
assert.equal(lessons.length,18);assert.equal(missions.length,4);
assert.equal(new Set([...legacy.lessons,...legacy.missions,...additions].map(e=>e.id)).size,31);
assert.deepEqual(lessons.map(l=>l.number),Array.from({length:18},(_,i)=>String(i+7).padStart(2,'0')));
assert.deepEqual(missions.map(m=>m.number),['M4','M5','M6','M7']);
for(const unit of 'ABCDEF')assert.equal(lessons.filter(l=>l.unit===unit).length,3);
const normalize=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
let questions=0,decisions=0;
for(const l of additions){
  assert.ok(l.goals.length>=2&&l.prerequisites.length&&l.pitfalls.length>=2);
  assert.ok(l.sections.some(s=>s.table||s.flow),'No diagram/table '+l.id);
  assert.ok(l.sections.flatMap(s=>s.paragraphs).join('').length>200,'Thin concept '+l.id);
  if(l.tasks)assert.ok(l.tasks.length>=3&&l.tasks.every(t=>t.length===2&&t.every(Boolean)));
  for(const k of l.related)assert.ok(keys.has(k),'Broken related '+k);
  for(const r of l.references){assert.ok(r.title&&r.publisher&&r.version);assert.equal(r.checked,'2026-11-11');assert.equal(new URL(r.url).protocol,'https:');assert.deepEqual(r,sourcesByUrl.get(r.url),'Reference registry drift '+l.id);}
  const entry=index.find(e=>e.key==='network:'+l.id);assert.ok(entry,'Search missing '+l.id);
  const html=normalize(read('dist/'+entry.url.slice(base.length)+'index.html'));
  for(const text of [...l.goals,...l.prerequisites,...l.sections.flatMap(s=>s.paragraphs),...l.example.paragraphs,...l.pitfalls,...(l.tasks||[]).flat()])assert.ok(html.includes(text),'Missing text '+l.id);
  for(const r of l.references)assert.ok(html.includes(r.url),'Missing reference '+l.id);
  assert.ok(l.quiz.length>=3);
  for(const q of l.quiz){
    assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.explanations.length,4);assert.ok(q.explanations.every(e=>e.length>=8));
    for(const text of [q.question,...q.choices,...q.explanations])assert.ok(html.includes(text),'Missing quiz '+l.id);
    for(let choice=0;choice<4;choice++){assert.equal(grade(choice,q.correct,4),choice===q.correct);decisions++;}questions++;
  }
}
assert.equal(lessons.reduce((n,l)=>n+l.quiz.length,0),54);assert.equal(questions,66);assert.equal(decisions,264);
assert.equal(new Set(additions.flatMap(l=>l.quiz.map(q=>q.question))).size,66);
// Independent numerical boundary expectations, including unsigned /0 and top IPv4.
const cases=[
 ['192.0.2.70/26','192.0.2.64','192.0.2.127','255.255.255.192',62,'192.0.2.65','192.0.2.126'],
 ['255.255.255.255/0','0.0.0.0','255.255.255.255','0.0.0.0',4294967294,'0.0.0.1','255.255.255.254'],
 ['0.0.0.0/32','0.0.0.0','0.0.0.0','255.255.255.255',1,'0.0.0.0','0.0.0.0'],
 ['255.255.255.255/32','255.255.255.255','255.255.255.255','255.255.255.255',1,'255.255.255.255','255.255.255.255'],
 ['192.0.2.1/31','192.0.2.0','192.0.2.1','255.255.255.254',2,'192.0.2.0','192.0.2.1'],
 ['192.0.2.3/30','192.0.2.0','192.0.2.3','255.255.255.252',2,'192.0.2.1','192.0.2.2'],
 ['128.0.0.1/1','128.0.0.0','255.255.255.255','128.0.0.0',2147483646,'128.0.0.1','255.255.255.254']
];
for(const [value,network,end,mask,hosts,hostFirst,hostLast] of cases){const s=subnet(value);assert.deepEqual([s.network,s.end,s.mask,s.hosts,s.hostFirst,s.hostLast],[network,end,mask,hosts,hostFirst,hostLast]);}
for(let prefix=0;prefix<=32;prefix++){const s=subnet('192.0.2.70/'+prefix);assert.ok(ipv4(s.network)<=ipv4('192.0.2.70')&&ipv4(s.end)>=ipv4('192.0.2.70'));assert.equal(ipv4(s.end)-ipv4(s.network)+1,2**(32-prefix));assert.equal(s.broadcast===null,prefix>=31);}
for(const bad of ['','1.2.3/24','256.0.0.1/24','01.2.3.4/24','1.2.3.4/-1','1.2.3.4/33','1.2.3.4/01','1.2.3.4/24x','1.2.3.4/2.5'])assert.throws(()=>subnet(bad));
assert.equal(dotted(4294967295),'255.255.255.255');assert.throws(()=>dotted(-1));
const routes=[{cidr:'0.0.0.0/0',next:'R0'},{cidr:'10.0.0.0/8',next:'R1'},{cidr:'10.20.0.0/16',next:'R2'},{cidr:'10.20.30.0/24',next:'R3'},{cidr:'10.20.30.9/32',next:'host'}];
for(const [dest,next] of [['10.20.30.9','host'],['10.20.30.10','R3'],['10.20.40.1','R2'],['10.1.1.1','R1'],['192.0.2.1','R0']])for(const rows of [routes,[...routes].reverse()])assert.equal(routing(dest,rows).selected.next,next);
assert.equal(routing('192.0.2.1',[routes[1]]).selected,null);
for(const rows of [[],[routes[0],routes[0]],[{cidr:'10.0.0.1/8',next:'R1'}],[{cidr:'10.0.0.0/8',next:''}],Array(33).fill(routes[0])])assert.throws(()=>routing('10.0.0.1',rows));
for(const a of [1,10,4094])for(const b of [1,20,4094])for(const routed of [false,true])assert.equal(vlan(a,b,routed).allow,a===b||routed);
for(const v of [0,4095,-1,1.5,NaN])assert.throws(()=>vlan(v,10,false));
for(let stage=0;stage<=3;stage++){assert.equal(dhcp(true,false,stage,3600,0).phase,'取得不可');assert.notEqual(dhcp(true,true,stage,3600,0).phase,'取得不可');assert.notEqual(dhcp(false,false,stage,3600,0).phase,'取得不可');}
for(const [elapsed,phase] of [[0,'BOUND'],[1799,'BOUND'],[1800,'RENEWING'],[3149,'RENEWING'],[3150,'REBINDING'],[3599,'REBINDING'],[3600,'期限切れ']])assert.equal(dhcp(false,false,3,3600,elapsed).phase,phase);
assert.throws(()=>dhcp(false,false,4,3600,0));assert.throws(()=>dhcp(false,false,3,7,0));assert.throws(()=>dhcp(false,false,3,3600,-1));
assert.match(pat('out','192.0.2.10',50000),/203\.0\.113\.5:40000/);assert.match(pat('out','192.0.2.11',50000),/203\.0\.113\.5:40001/);
assert.match(pat('in','198.51.100.20',40000),/192\.0\.2\.10:50000/);assert.match(pat('in','198.51.100.20',40001),/192\.0\.2\.11:50000/);
for(const [address,port] of [['198.51.100.21',40000],['198.51.100.20',40002]])assert.match(pat('in',address,port),/配送しません/);
assert.match(pat('out','192.0.2.12',50000),/対応表に内部/);for(const p of [0,65536,1.5,NaN])assert.throws(()=>pat('out','192.0.2.10',p));assert.throws(()=>pat('other','192.0.2.10',50000));
assert.deepEqual([dns(60,20,false,true).phase,dns(60,20,false,true).remaining],['キャッシュ利用',40]);
for(const elapsed of [60,61])for(const truncated of [false,true])for(const allowed of [false,true])assert.equal(dns(60,elapsed,truncated,allowed).phase,truncated&&!allowed?'TCP再試行失敗':'再問い合わせ');
assert.equal(dns(0,0,true,false).phase,'TCP再試行失敗');assert.equal(dns(60,59,true,false).phase,'キャッシュ利用');
for(const [ttl,elapsed] of [[-1,0],[86401,0],[60,-1],[1.5,0],[60,NaN]])assert.throws(()=>dns(ttl,elapsed,false,true));
for(const c of outageCases)for(const answer of outageCases.map(c=>c.id))assert.equal(diagnose(c.id,answer).correct,c.correct===answer);
assert.throws(()=>diagnose('unknown','filter'));assert.throws(()=>diagnose('filter','unknown'));
// Exact end-point behavior required by the lesson; flags/SEQ and timing are checked.
const normal=tcpTrace('normal');
assert.equal(normal[3].serverNext,9001,'Server reserves its SYN during SYN receive processing');
assert.deepEqual(normal.map(s=>[s.client,s.server]),[
 ['CLOSED','CLOSED'],['CLOSED','LISTEN'],['SYN-SENT','LISTEN'],['SYN-SENT','SYN-RECEIVED'],['SYN-SENT','SYN-RECEIVED'],['ESTABLISHED','SYN-RECEIVED'],['ESTABLISHED','SYN-RECEIVED'],['ESTABLISHED','ESTABLISHED'],['FIN-WAIT-1','ESTABLISHED'],['FIN-WAIT-1','CLOSE-WAIT'],['FIN-WAIT-1','CLOSE-WAIT'],['FIN-WAIT-2','CLOSE-WAIT'],['FIN-WAIT-2','LAST-ACK'],['TIME-WAIT','LAST-ACK'],['TIME-WAIT','LAST-ACK'],['TIME-WAIT','CLOSED'],['CLOSED','CLOSED']]);
assert.deepEqual(normal.filter(s=>s.event==='send').map(s=>[s.packet.flags,s.packet.seq,s.packet.ack]),[['SYN',1000,null],['SYN,ACK',9000,1001],['ACK',1001,9001],['FIN,ACK',1001,9001],['ACK',9001,1002],['FIN,ACK',9001,1002],['ACK',1002,9002]]);
for(const [scenario,count] of Object.entries({normal:17,'synack-loss':20,'ack-loss':22,timeout:12,reset:10,'finack-loss':22})){
 const trace=tcpTrace(scenario);assert.equal(trace.length,count);assert.equal(trace.at(-1).client,'CLOSED');
 assert.equal(trace.at(-1).server,scenario==='timeout'?'LISTEN':'CLOSED');
 for(const s of trace)if(s.packet){assert.equal(s.packet.length,0);assert.ok([1000,1001,1002,9000,9001].includes(s.packet.seq));}
 if(scenario==='timeout'){assert.ok(!trace.some(s=>s.client==='ESTABLISHED'));assert.equal(trace.filter(s=>s.event==='send').length,3);assert.ok(trace.filter(s=>s.event==='send').every(s=>s.packet.seq===1000));}
 if(scenario==='reset'){assert.ok(!trace.some(s=>s.client==='TIME-WAIT'));assert.equal(trace.at(-1).packet.flags,'RST');}
}
const lost=tcpTrace('ack-loss'),loss=lost.find(s=>s.label==='最終ACK損失');assert.deepEqual([loss.client,loss.server],['ESTABLISHED','SYN-RECEIVED']);
assert.ok(lost.filter(s=>s.label==='SYN/ACK再送').every(s=>s.packet.seq===9000&&s.packet.ack===1001));
const finlost=tcpTrace('finack-loss');assert.equal(finlost.find(s=>s.label==='Clientが重複FIN受信').client,'TIME-WAIT');assert.match(finlost.find(s=>s.label==='Clientが重複FIN受信').text,/再開始/);
assert.throws(()=>tcpTrace('unknown'));
assert.equal(Object.keys(tcpScenarios).length,6);
// v1 legacy and mixed records round-trip unchanged, no migration or new schema.
const old={version:1,completed:{'network:routing':true,'network:web-db':true,'java:console-input':true,'security:s07-01':true},answers:{'routing:0':2},recall:{DNS:'既存の復習'},notes:{'web-db:0':'前からの設計'},last:'network:routing'};
assert.deepEqual(validate(JSON.parse(JSON.stringify(old)),keys),old);
const mixed=structuredClone(old);mixed.completed['network:n17-tcp-handshake']=true;mixed.completed['network:nm4-subnet']=true;mixed.answers['n17-tcp-handshake:1']=2;mixed.notes['nm4-subnet:0']='新規設計';mixed.last='network:nm4-subnet';
assert.deepEqual(validate(JSON.parse(JSON.stringify(validate(mixed,keys))),keys),mixed);
for(const [query,key] of [['SYN-RECEIVED','network:n17-tcp-handshake'],['DORA','network:n12-dhcp'],['最長','network:n13-routing'],['ＳＬＡＡＣ','network:n11-ipv6'],['PAT','network:n15-nat'],['hostname','network:n24-troubleshooting'],['DTO','java:console-dto'],['PKI','security:s07-03']])assert.ok(searchIndex(index,query).some(e=>e.key===key),'Search failed '+query);
console.log(`PASS Network: 18 new lessons / 54 lesson quizzes / 4 new missions / 12 mission decisions / ${decisions} grading branches; rendered text, sources, related keys, v1 backup and search.`);
console.log('PASS Network models: all 33 CIDR lengths and boundaries; LPM/default/no-route; VLAN; DHCP DORA/relay/T1/T2/expiry; PAT forward/reverse/unknown; DNS TTL/TC/TCP; 25 diagnostic decisions; TCP 6 scenarios / flags / SEQ / ACK / end-point states / loss / FIN / RST / timeout.');
