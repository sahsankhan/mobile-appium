import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadEnvFile(filePath) {
  return readFile(filePath, 'utf8')
    .then((text) => {
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq < 1) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
      }
    })
    .catch(() => {});
}

export async function loadNoahEnv() {
  await loadEnvFile(path.join(root, '.env'));
}

export function resolveApkPath() {
  return path.resolve(root, process.env.APK_PATH || 'mobile-app/noah-cares.apk');
}
