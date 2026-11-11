import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { method } from '../upstream/java/scripts/lib.mjs';
const root = path.resolve(import.meta.dirname, '..');
await import('./prepare-security.mjs');
const java = path.join(root, 'upstream/java');
fs.mkdirSync(path.join(root,'public/licenses'),{recursive:true});
fs.copyFileSync(path.join(root,'upstream/network/LICENSE'),path.join(root,'public/licenses/azure-network-basics.txt'));
for (const f of ['style.css', 'app.js']) { fs.mkdirSync(path.join(java, 'docs/assets'), { recursive: true }); fs.copyFileSync(path.join(java, 'site-assets', f), path.join(java, 'docs/assets', f)); }
// Keep the original publication and consistency checks, in the isolated copy.
for (const script of ['package.mjs', 'check.mjs']) {
  const r = spawnSync(process.execPath, [path.join(java, 'scripts', script)], { cwd: java, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
const base = process.env.BASE_PATH || '/';
const out = path.join(root, 'public/downloads/java');
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(path.join(java, 'docs/assets/downloads'))) fs.copyFileSync(path.join(java, 'docs/assets/downloads', f), path.join(out, f));
const rows = JSON.parse(fs.readFileSync(path.join(root, 'src/content/java-pages.json'), 'utf8'));
const routes = Object.fromEntries(rows.map(([id, , , section]) => [id, id === 'setup' ? 'java/setup/' : `java/${section}/${id}/`]));
const generated = path.join(root, 'src/generated/java');
fs.mkdirSync(generated, { recursive: true });
for (const [id] of rows) {
  let text = fs.readFileSync(path.join(root, 'src/content/java', id + '.md'), 'utf8');
  text = text.replace(/\{\{code:([^|}]+)\|([^}]+)\}\}/g, (_, p, n) => {
    const file = path.resolve(java, p);
    if (!file.startsWith(java + path.sep) || !file.endsWith('.java')) throw Error('Unsafe include: ' + p);
    return '```java\n' + method(fs.readFileSync(file, 'utf8'), n).text + '\n```';
  });
  const title = text.match(/^# (.+)/m)?.[1];
  if (!title) throw Error('Missing title: ' + id);
  text = text.replace(/^# .+\r?\n/, '');
  text = text.replace(/\]\(([^)]+)\)/g, (match, url) => {
    if (/^assets\/downloads\//.test(url)) return `](${base}downloads/java/${url.slice('assets/downloads/'.length)})`;
    const m = url.match(/^([\w-]+)\.md(#[^ ]*)?$/);
    if (!m) return match;
    if (!routes[m[1]]) throw Error('Unmapped Java link: ' + url);
    return `](${base}${routes[m[1]]}${m[2] || ''})`;
  });
  fs.writeFileSync(path.join(generated, id + '.md'), '---\ntitle: ' + JSON.stringify(title) + '\n---\n' + text);
}
fs.writeFileSync(path.join(root, 'public/.nojekyll'), '');
console.log('Prepared 18 Markdown pages and 11 verified learner ZIPs.');
