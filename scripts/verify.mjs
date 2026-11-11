import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
for(const args of [['scripts/prepare.mjs'],['scripts/astro.mjs','check'],['scripts/astro.mjs','build'],['scripts/check.mjs'],['scripts/check-content.mjs'],['scripts/check-security.mjs'],['scripts/check-network.mjs'],['scripts/check-git.mjs'],['scripts/check-git-real.mjs']]) {
  const r=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
