import { spawnSync } from 'node:child_process';
import path from 'node:path';
// Avoid global telemetry configuration and all telemetry network requests.
const r = spawnSync(process.execPath, [path.resolve(import.meta.dirname, '../node_modules/astro/bin/astro.mjs'), ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
process.exit(r.status || (r.error ? 1 : 0));
