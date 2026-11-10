import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,walk} from '../scripts/lib.mjs';
const base='http://127.0.0.1:4173/java-study-preview/';let count=0;
for(const file of walk(path.join(root,'docs')).filter(p=>p.endsWith('.html')||p.endsWith('.zip')||p.endsWith('.css')||p.endsWith('.js'))){
  const rel=path.relative(path.join(root,'docs'),file).replaceAll('\\','/');const r=await fetch(base+rel);
  assert.equal(r.status,200,rel);assert.ok(Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync(file)),rel);count++;
}
assert.equal((await fetch(base+'missing-page')).status,404);
console.log('PASS '+count+' prefixed HTTP files, including every HTML page and ZIP.');
