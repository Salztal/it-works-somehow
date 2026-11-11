import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { validate, empty, grade } from '../src/lib/progress.ts';
import { firewall, mail, chain } from '../src/lib/security-model.ts';
import { encryptText, decryptText, hashText, signText, verifyText } from '../src/lib/security-crypto.ts';
import { searchIndex } from '../src/lib/search.ts';
const root=path.resolve(import.meta.dirname,'..'), read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lessons=['basic-01-03','basic-04-06','advanced','lunatic'].flatMap(f=>JSON.parse(read(`src/content/security/${f}.json`)));
assert.equal(lessons.length,30); assert.equal(new Set(lessons.map(l=>l.id)).size,30);
assert.deepEqual(['BASIC','ADVANCED','LUNATIC'].map(level=>lessons.filter(l=>l.level===level).length),[18,9,3]);
const units=new Map();for(const l of lessons)units.set(l.unit,(units.get(l.unit)||0)+1);
assert.equal(units.size,10);assert.ok([...units.values()].every(n=>n===3));
const network=JSON.parse(read('src/content/network/course.json')), java=JSON.parse(read('src/content/java-pages.json'));
const keys=new Set([...network.lessons,...network.missions].map(l=>'network:'+l.id).concat(java.map(l=>'java:'+l[0]),lessons.map(l=>'security:'+l.id)));
const normalize=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
const index=JSON.parse(read('dist/search.json'));const base=process.env.BASE_PATH||'/';let questions=0, decisions=0;
for(const l of lessons) {
  assert.equal(l.id,'s'+l.number);assert.ok(l.goals.length>=2 && l.prerequisites.length>=1);
  assert.ok(l.sections.length>=2 && l.sections.some(s=>s.flow || s.table),'Missing explanation/diagram '+l.id);
  const prose=l.sections.flatMap(s=>s.paragraphs).concat(l.example.paragraphs).join('');assert.ok(prose.length>=800,'Thin lesson '+l.id);
  assert.equal(new Set(l.sections.map(s=>s.id)).size,l.sections.length);
  assert.ok(l.pitfalls.length>=2 && l.quiz.length>=3 && l.references.length>=1);
  for(const r of l.references) { assert.equal(new URL(r.url).protocol,'https:');for(const k of ['title','publisher','version'])assert.ok(r[k]);assert.equal(r.checked,'2026-11-11'); }
  for(const k of l.related)assert.ok(keys.has(k),'Unresolved related key '+k);
  const entry=index.find(e=>e.key==='security:'+l.id);assert.ok(entry,'Not searchable '+l.id);
  const html=normalize(read('dist/'+entry.url.slice(base.length)+'index.html'));
  for(const p of l.sections.flatMap(s=>s.paragraphs))assert.ok(html.includes(p),'Missing prose '+l.id);
  for(const r of l.references)assert.ok(html.includes(r.url));
  for(const q of l.quiz) {
    assert.equal(q.choices.length,4);assert.equal(q.explanations.length,4);assert.equal(new Set(q.choices).size,4);
    assert.ok(q.explanations.every(x=>typeof x==='string'&&x.length>=8));assert.ok(html.includes(q.question));
    for(const text of [...q.choices,...q.explanations])assert.ok(html.includes(text),'Missing quiz text '+l.id);
    for(let i=0;i<4;i++) {assert.equal(grade(i,q.correct,4),i===q.correct);decisions++;}questions++;
  }
}
assert.ok(questions>=90);assert.throws(()=>grade(-1,0,4));assert.throws(()=>grade(0,4,4));
assert.equal(new Set(lessons.flatMap(l=>l.quiz.map(q=>q.question))).size,questions);
for(const [query,key] of [['DNSSEC','security:s10-02'],['ＯＡｕｔｈ','security:s08-01'],['DTO','java:console-dto'],['DNS','network:dns-port-http'],['鍵交換 Forward','security:s07-02']])assert.ok(searchIndex(index,query).some(e=>e.key===key),'Search mismatch '+query);
assert.equal(searchIndex(index,'__unmatched_7429__').length,0);assert.equal(searchIndex(index,' ').length,0);
// A Phase 1 backup survives validation/export/import without schema changes.
const legacy={version:1,completed:{'network:dns-port-http':true,'java:console-input':true},answers:{'dns-port-http:0':2},recall:{DNS:'名前からIPを調べる'},notes:{'web-db:0':'設計メモ'},last:'java:console-input'};
assert.deepEqual(validate(JSON.parse(JSON.stringify(legacy)),keys),legacy);
const mixed=structuredClone(legacy);mixed.completed['security:s01-01']=true;mixed.answers['s01-01:0']=1;mixed.notes['security:s01-01']='新しいメモ';mixed.last='security:s01-01';
assert.deepEqual(validate(JSON.parse(JSON.stringify(validate(mixed,keys))),keys),mixed);
assert.deepEqual(validate(empty(),keys),empty());assert.throws(()=>validate({...legacy,version:2},keys));assert.throws(()=>validate({...legacy,notes:[]},keys));
const malicious=JSON.parse('{"version":1,"completed":{"__proto__":true,"unknown:x":true},"answers":{"x:0":99},"recall":{},"notes":{"__proto__":"bad"},"last":"unknown:x"}');
assert.deepEqual(validate(malicious,keys),empty());assert.equal({}.bad,undefined);
for(const zone of ['internet','admin'])for(const port of [22,80,443,65535]) {
  assert.equal(firewall(zone,port,false).allow,port===443||(zone==='admin'&&port===22));
  assert.equal(firewall(zone,port,true).allow,false);
}
for(const p of [0,-1,1.5,65536,NaN])assert.throws(()=>firewall('internet',p,false));
for(const s of [false,true])for(const d of [false,true])for(const sa of [false,true])for(const da of [false,true]) {
  const r=mail('author.example',sa?'author.example':'other.example',s,da?'author.example':'other.example',d);
  assert.equal(r.pass,(s&&sa)||(d&&da));
}
assert.equal(mail(' AUTHOR.EXAMPLE ','author.example',true,'other.example',false).pass,true);
for(const bad of ['', 'a..example','-a.example','a.example.','<script>'])assert.throws(()=>mail(bad,'a.example',true,'a.example',true));
assert.match(chain('dnssec',[true,true,false,true]),/DSと子DNSKEY/);assert.match(chain('certificate',[true,false,true,true]),/接続先名/);
// Validate fixture framing and IP/TCP checksums, and prove no real-key files are emitted.
const pcap=fs.readFileSync(path.join(root,'dist/samples/security/tls13-synthetic.pcap'));
assert.equal(pcap.readUInt32LE(0),0xa1b2c3d4);let offset=24,frames=0;
const checksum=b=>{let n=0;for(let i=0;i<b.length;i+=2)n+=(b[i]<<8)+(b[i+1]||0);while(n>>>16)n=(n&65535)+(n>>>16);return n;};
while(offset<pcap.length) {
  const len=pcap.readUInt32LE(offset+8);assert.equal(len,pcap.readUInt32LE(offset+12));offset+=16;
  const frame=pcap.subarray(offset,offset+len);assert.equal(frame.length,len);const ip=frame.subarray(14,34),tcp=frame.subarray(34);
  assert.equal(ip.readUInt16BE(2),len-14);assert.equal(checksum(ip),65535);
  const pseudo=Buffer.concat([ip.subarray(12,20),Buffer.from([0,6,(tcp.length>>8)&255,tcp.length&255]),tcp]);assert.equal(checksum(pseudo),65535);
  assert.equal(tcp.readUInt16BE(23),tcp.length-25);
  if(frames<2) {
    const record=tcp.subarray(20),body=record.subarray(9);assert.equal(record[0],22);assert.equal(record[5],frames===0?1:2);assert.equal(record.readUIntBE(6,3),body.length);
    let cursor=34;const sid=body[cursor++];cursor+=sid;
    if(frames===0) {const suites=body.readUInt16BE(cursor);cursor+=2;assert.equal(body.readUInt16BE(cursor),0x1301);cursor+=suites;const compression=body[cursor++];cursor+=compression;}
    else {assert.equal(body.readUInt16BE(cursor),0x1301);cursor+=3;}
    const extLength=body.readUInt16BE(cursor);cursor+=2;assert.equal(body.length-cursor,extLength);const extensions=new Map();
    while(cursor<body.length){const kind=body.readUInt16BE(cursor),length=body.readUInt16BE(cursor+2);cursor+=4;extensions.set(kind,body.subarray(cursor,cursor+length));cursor+=length;}
    assert.equal(cursor,body.length);assert.equal(extensions.get(43).readUInt16BE(frames===0?1:0),0x0304);assert.equal(extensions.get(51).readUInt16BE(frames===0?2:0),29);
  }
  offset+=len;frames++;
}
assert.equal(frames,4);assert.equal(offset,pcap.length);
// Exercise exactly the async functions used by the browser, including failures.
assert.equal(await hashText('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
for(const text of ['','日本語の暗号実験 🔐','a'.repeat(4096)]) {
  const a=await encryptText(text),b=await encryptText(text,a.key);
  assert.equal(a.key.extractable,false);assert.equal(await decryptText(a.key,a.iv,a.data),text);
  assert.notDeepEqual(a.iv,b.iv);assert.notDeepEqual(a.data,b.data);
  const changed=new Uint8Array(a.data);changed[0]^=1;await assert.rejects(()=>decryptText(a.key,a.iv,changed));
}
const signed=await signText('署名対象');assert.equal(signed.key.privateKey.extractable,false);
assert.equal(await verifyText(signed.key.publicKey,'署名対象',signed.data),true);
assert.equal(await verifyText(signed.key.publicKey,'変更した文',signed.data),false);
signed.data[0]^=1;assert.equal(await verifyText(signed.key.publicKey,'署名対象',signed.data),false);
await assert.rejects(()=>hashText('a'.repeat(4097)));await assert.rejects(()=>encryptText('a'.repeat(4097)));
console.log(`PASS Security: 10 units / 30 lessons / ${questions} quizzes / ${decisions} answer decisions; v1 backup roundtrip; 16 DMARC cases; FW/chain/invalid-input; 4 PCAP frames/checksums.`);
console.log('PASS Web Crypto shared functions: AES-GCM empty/Unicode/max length/tamper; SHA-256 known vector; ECDSA valid/changed message/changed signature; non-extractable private keys; input limit.');
console.log('PASS shared search: Security/Network/Java, NFKC, AND terms, empty and unmatched queries.');
