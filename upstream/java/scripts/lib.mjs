import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function write(file, value) { fs.mkdirSync(path.dirname(file), { recursive:true }); fs.writeFileSync(file, value); }
export function walk(dir) { return fs.existsSync(dir) ? fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]) : []; }
export function method(source, name) {
  const lines=source.split('\n');
  const start=lines.findIndex(l=>new RegExp('^    (public|private|protected).*\\b'+name+'\\(').test(l));
  if(start<0) throw Error('Method not found: '+name);
  const end=lines.findIndex((l,i)=>i>start && /^    }\s*$/.test(l));
  if(end<0) throw Error('Method end not found: '+name);
  return { start, end, text:lines.slice(start,end+1).join('\n'), lines };
}
export function stub(source,name,chapter) {
  const m=method(source,name);
  const open=m.lines.findIndex((l,i)=>i>=m.start && l.includes('{'));
  const body=name==='doPost' ? [
    '        request.setCharacterEncoding("UTF-8");',
    '        request.setAttribute("csrf", WebSupport.token(request));',
    `        request.setAttribute("error", "第${chapter}章：${name}を実装してください。");`,
    '        request.getRequestDispatcher("/WEB-INF/views/register.jsp").forward(request, response);'
  ] : [`        throw new UnsupportedOperationException("第${chapter}章：${name}を実装してください。");`];
  m.lines.splice(open+1,m.end-open-1,...body);
  return m.lines.join('\n');
}
// ZIP STORE writer: UTF-8 paths, deterministic timestamps, no third-party dependency.
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(buffer){let c=0xffffffff;for(const b of buffer)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
export function zip(entries) {
  const locals=[], central=[];let offset=0;
  for(const [name,value] of [...entries].sort(([a],[b])=>a.localeCompare(b))){
    const filename=Buffer.from(name.replaceAll('\\','/'));const data=Buffer.isBuffer(value)?value:Buffer.from(value);const crc=crc32(data);
    const local=Buffer.alloc(30); local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(0x5d53,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(filename.length,26);
    locals.push(local,filename,data);
    const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(0x5d53,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(filename.length,28);c.writeUInt32LE(offset,42);central.push(c,filename);offset+=local.length+filename.length+data.length;
  }
  const cb=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.size,8);end.writeUInt16LE(entries.size,10);end.writeUInt32LE(cb.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,cb,end]);
}
export function unzipStore(buffer) {
  const entries=new Map();let pos=0;
  while(buffer.readUInt32LE(pos)===0x04034b50){
    if(buffer.readUInt16LE(pos+8)!==0)throw Error('Only STORE supported');
    const size=buffer.readUInt32LE(pos+18),n=buffer.readUInt16LE(pos+26),extra=buffer.readUInt16LE(pos+28);
    const name=buffer.subarray(pos+30,pos+30+n).toString('utf8');pos+=30+n+extra;
    const data=buffer.subarray(pos,pos+size);if(crc32(data)!==buffer.readUInt32LE(pos-16-n-extra))throw Error('CRC mismatch: '+name);
    entries.set(name,data);pos+=size;
  }
  return entries;
}
