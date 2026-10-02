import { mkdir, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runJourney } from '../tests/schedule-and-accept.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

let passed = false;
let detail = '';
try {
  if (!(await portOpen(Number(process.env.APPIUM_PORT || 4723)))) {
    throw new Error('Appium is not running on port 4723. In this folder run: npx appium');
  }
  await runJourney();
  passed = true;
  detail = 'Client scheduled a ride and the driver accepted it.';
} catch (error) {
  detail = error.stack || error.message;
  if (error.screenshot) {
    const shotDir = path.join(root, 'reports', 'screenshots');
    await mkdir(shotDir, { recursive: true });
    await writeFile(path.join(shotDir, 'failure.png'), Buffer.from(error.screenshot, 'base64'));
  }
  process.exitCode = 1;
}

const reportDir = path.join(root, 'reports');
await mkdir(reportDir, { recursive: true });
await writeFile(
  path.join(reportDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Appium report</title></head>
<body>
  <h1>Appium — Noah Cares schedule and accept</h1>
  <p>${passed ? 'Passed' : 'Failed'}</p>
  <pre>${detail.replace(/</g, '&lt;')}</pre>
</body></html>`,
  'utf8',
);
console.log(passed ? 'Passed' : 'Failed');
console.log(`HTML report: ${path.join(reportDir, 'index.html')}`);
