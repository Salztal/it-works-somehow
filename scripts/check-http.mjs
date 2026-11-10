import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { walk } from '../upstream/java/scripts/lib.mjs';
process.env.PORT='0';
const { server } = await import('./serve.mjs');
if(!server.listening) await once(server,'listening');
const root=path.resolve(import.meta.dirname,'../dist'),base=process.env.BASE_PATH || '/',origin=`http://127.0.0.1:${server.address().port}`;
let count=0;
try {
  for(const file of walk(root)) {
    const rel=path.relative(root,file).replaceAll('\\','/');
    const url=origin+base+rel.replace(/(?:^|\/)index\.html$/,(s)=>s.startsWith('/')?'/':'');
    const response=await fetch(url);
    assert.equal(response.status,200,url);
    assert.ok(Buffer.from(await response.arrayBuffer()).equals(fs.readFileSync(file)),'HTTP bytes differ: '+url);
    count++;
  }
  const notFound=await fetch(origin+base+'missing-page/');assert.equal(notFound.status,404);
  if(base!=='/') assert.equal((await fetch(origin+'/network/')).status,404);
  console.log(`PASS HTTP: ${count} generated files byte-for-byte, 404, base=${base}`);
} finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
