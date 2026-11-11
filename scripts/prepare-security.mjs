// Deterministic, synthetic TLS record envelope fixture. Never a real capture.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const out=path.resolve(import.meta.dirname,'../public/samples/security');
fs.mkdirSync(out,{recursive:true});
const manuscripts=['basic-01-03','basic-04-06','advanced','lunatic'].flatMap(f=>JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,`../src/content/security/${f}.json`),'utf8')));
const generated=path.resolve(import.meta.dirname,'../src/generated');fs.mkdirSync(generated,{recursive:true});
fs.writeFileSync(path.join(generated,'security-catalog.json'),JSON.stringify(manuscripts.map(({id,number,title,description,level})=>({id,number,title,description,level})))+'\n');
const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16BE(n);return b;};
const ext=(n,b)=>Buffer.concat([u16(n),u16(b.length),b]);
const hs=(n,b)=>{const size=Buffer.alloc(3);size.writeUIntBE(b.length,0,3);return Buffer.concat([Buffer.from([n]),size,b]);};
const record=(n,b)=>Buffer.concat([Buffer.from([n,3,3]),u16(b.length),b]);
// RFC 7748 example public coordinates; no corresponding secrets are shipped.
const ck=Buffer.from('8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a','hex');
const sk=Buffer.from('de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f','hex');
const ce=Buffer.concat([ext(43,Buffer.from([2,3,4])),ext(10,Buffer.from([0,2,0,29])),ext(13,Buffer.from([0,2,4,3])),ext(51,Buffer.concat([u16(36),u16(29),u16(32),ck]))]);
const se=Buffer.concat([ext(43,Buffer.from([3,4])),ext(51,Buffer.concat([u16(29),u16(32),sk]))]);
const client=record(22,hs(1,Buffer.concat([Buffer.from([3,3]),Buffer.alloc(32,0x11),Buffer.from([0,0,2,0x13,1,1,0]),u16(ce.length),ce])));
const server=record(22,hs(2,Buffer.concat([Buffer.from([3,3]),Buffer.alloc(32,0x22),Buffer.from([0,0x13,1,0]),u16(se.length),se])));
const opaque=record(23,Buffer.alloc(48,0xa5));
const checksum=b=>{let sum=0;for(let i=0;i<b.length;i+=2)sum+=(b[i]<<8)+(b[i+1]||0);while(sum>>>16)sum=(sum&65535)+(sum>>>16);return (~sum)&65535;};
const ethernet=Buffer.from('0200000000020200000000010800','hex');
let cs=1001,ss=2001;
function packet(payload,fromClient,id,flags=0x18){
  const src=Buffer.from(fromClient?[192,0,2,10]:[198,51,100,20]);const dst=Buffer.from(fromClient?[198,51,100,20]:[192,0,2,10]);
  const tcp=Buffer.alloc(20);tcp.writeUInt16BE(fromClient?50000:443);tcp.writeUInt16BE(fromClient?443:50000,2);tcp.writeUInt32BE(fromClient?cs:ss,4);tcp.writeUInt32BE(fromClient?ss:cs,8);tcp[12]=0x50;tcp[13]=flags;tcp.writeUInt16BE(65535,14);
  const pseudo=Buffer.concat([src,dst,Buffer.from([0,6]),u16(tcp.length+payload.length),tcp,payload]);tcp.writeUInt16BE(checksum(pseudo),16);
  const ip=Buffer.alloc(20);ip[0]=0x45;ip.writeUInt16BE(40+payload.length,2);ip.writeUInt16BE(id,4);ip[8]=64;ip[9]=6;src.copy(ip,12);dst.copy(ip,16);ip.writeUInt16BE(checksum(ip),10);
  if(fromClient)cs+=payload.length;else ss+=payload.length;
  return Buffer.concat([ethernet,ip,tcp,payload]);
}
const fixtures=[[client,true,'ClientHello: TLS 1.3 / X25519'],[server,false,'ServerHello: TLS 1.3 / AES_128_GCM_SHA256'],[opaque,false,'type=23 opaque dummy (not valid AEAD)'],[opaque,true,'type=23 opaque dummy (not valid AEAD)']];
const global=Buffer.alloc(24);global.writeUInt32LE(0xa1b2c3d4);global.writeUInt16LE(2,4);global.writeUInt16LE(4,6);global.writeUInt32LE(65535,16);global.writeUInt32LE(1,20);
const chunks=[global], rows=[];
fixtures.forEach(([payload,c,description],i)=>{const frame=packet(payload,c,i+1);const h=Buffer.alloc(16);h.writeUInt32LE(1793494800+i,0);h.writeUInt32LE(frame.length,8);h.writeUInt32LE(frame.length,12);chunks.push(h,frame);rows.push({frame:i+1,source:c?'192.0.2.10':'198.51.100.20',destination:c?'198.51.100.20':'192.0.2.10',tlsRecordType:payload[0],legacyRecordVersion:'0x0303',recordBytes:payload.length,description});});
const bytes=Buffer.concat(chunks);
fs.writeFileSync(path.join(out,'tls13-synthetic.pcap'),bytes);
fs.writeFileSync(path.join(out,'tls13-synthetic.json'),JSON.stringify({synthetic:true,limitations:'Handmade record-envelope exercise; no SYN exchange; dummy encrypted payloads are not valid AEAD; no secrets or decryption; not a successful TLS session.',sha256:crypto.createHash('sha256').update(bytes).digest('hex'),records:rows},null,2)+'\n');
console.log('Prepared synthetic TLS envelope PCAP (4 frames; no secrets).');
