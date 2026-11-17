import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
for(const args of [['scripts/prepare.mjs'],['scripts/astro.mjs','check'],['scripts/astro.mjs','build'],['scripts/check.mjs'],['scripts/check-content.mjs'],['scripts/check-security.mjs'],['scripts/check-network.mjs'],['scripts/check-git.mjs'],['scripts/check-test-design.mjs'],['scripts/check-web.mjs'],['scripts/check-spring.mjs'],['scripts/check-mail.mjs'],['scripts/check-ui.mjs'],['scripts/check-git-real.mjs']]) {
  if(args[0]==='scripts/check-git-real.mjs'&&process.argv.includes('--skip-real-git')){console.log('SKIP: isolated real-Git fixtures (create commits). Git content and model regression still run.');continue;}
  const r=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
