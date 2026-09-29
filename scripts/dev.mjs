import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync('.env.server') && !process.env.NOVI_ADMIN_PASSWORD) {
  console.error('Maak eerst .env.server aan op basis van .env.server.example.');
  process.exit(1);
}

const children = [
  spawn(process.execPath, ['server/index.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort'], { stdio: 'inherit' })
];

let stopping = false;
const stop = (code = 0) => {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => { if (!child.killed) child.kill(); });
  process.exitCode = code;
};

children.forEach((child) => {
  child.on('error', () => stop(1));
  child.on('exit', (code) => { if (!stopping) stop(code || 0); });
});
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
