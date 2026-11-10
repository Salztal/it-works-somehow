import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
for(const base of ['/','/phase1-path-check/']) {
  for(const script of ['prepare.mjs','astro.mjs','check.mjs','check-content.mjs','check-http.mjs']) {
    const r=spawnSync(process.execPath,[path.join(root,'scripts',script),...(script==='astro.mjs'?['build']:[])],{cwd:root,stdio:'inherit',env:{...process.env,BASE_PATH:base}});
    if(r.status!==0)process.exit(r.status||1);
  }
}
console.log('PASS: root and repository-subpath builds, links, anchors, assets, ZIPs and content.');
