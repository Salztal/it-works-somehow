// One-time, read-only import from the two sibling workspaces. Never run on build.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const manifest = [];
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
function copy(source, target, origin) {
  const bytes = fs.readFileSync(source);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  manifest.push({ source: origin, target: path.relative(root, target).replaceAll('\\', '/'), sha256: hash(bytes), bytes: bytes.length });
}
const network = path.resolve(root, '../azure-network-basics');
for (const f of ['js/lessons.js', 'js/v02.js', 'LICENSE', 'README.md']) copy(path.join(network, f), path.join(root, 'upstream/network', f), 'azure-network-basics/' + f);
const lessons = vm.runInNewContext(fs.readFileSync(path.join(network, 'js/lessons.js'), 'utf8') + '\n;lessons');
const extension = fs.readFileSync(path.join(network, 'js/v02.js'), 'utf8');
const data = vm.runInNewContext('const ' + extension.slice(extension.indexOf('T=['), extension.indexOf(';let S;')) + ';({recall:T,missions:M})');
if (lessons.length !== 6 || data.missions.length !== 3) throw Error('Unexpected Network source structure');
fs.writeFileSync(path.join(root, 'src/content/network/course.json'), JSON.stringify({ lessons, ...data }, null, 2) + '\n');
const java = path.resolve(root, '../JavaStudy');
const allowedRoots = ['Todo', 'TodoJSP', 'sql', 'scripts', 'verification', 'course'];
const safe = rel => !rel.split('/').some(p => ['bin', 'build', 'classes', '.local', '.tools', 'instructor-private', 'lib'].includes(p)) &&
  !/(^|\/)db\.properties$|\.local\.|\.(?:jar|class|war|zip)$/.test(rel) &&
  (/\.(?:java|jsp|xml|css|mjs|ps1|md|sql|template|prefs)$/.test(rel) || /(?:\.project|\.classpath|\.properties\.example)$/.test(rel) || /\/.settings\/(?:\.jsdtscope|org\.eclipse\.wst\.common\.component|org\.eclipse\.wst\.jsdt\.ui\.superType\.(?:container|name))$/.test(rel) || rel === 'TodoJSP/src/main/webapp/META-INF/MANIFEST.MF');
for (const dir of allowedRoots) for (const f of walk(path.join(java, dir))) {
  const rel = path.relative(java, f).replaceAll('\\', '/');
  if (safe(rel)) copy(f, path.join(root, 'upstream/java', rel), 'JavaStudy/' + rel);
  if (dir === 'course' && rel.endsWith('.md')) copy(f, path.join(root, 'src/content/java', path.basename(f)), 'JavaStudy/' + rel);
}
for (const f of ['README.md', 'DEPENDENCIES.md', 'PUBLISHING.md', 'VALIDATION.md', 'package.json', '.gitignore']) copy(path.join(java, f), path.join(root, 'upstream/java', f), 'JavaStudy/' + f);
// Preserve only the two public UI assets needed by the original check procedure.
for (const f of ['style.css', 'app.js']) copy(path.join(java, 'docs/assets', f), path.join(root, 'upstream/java/site-assets', f), 'JavaStudy/docs/assets/' + f);
copy(path.join(java,'docs/assets/downloads/manifest.json'),path.join(root,'upstream/java/original-downloads.json'),'JavaStudy/docs/assets/downloads/manifest.json');
fs.writeFileSync(path.join(root, 'migration-manifest.json'), JSON.stringify({ importedAt: '2026-11-10', networkCommit: '2299cccbf7535b71c67007a3e92d7c6fa546d332', networkDirty: true, files: manifest }, null, 2) + '\n');
console.log(`Imported ${manifest.length} allowlisted source files; 6 lessons, 3 missions, 18 Java manuscripts.`);
