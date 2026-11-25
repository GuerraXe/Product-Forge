// Starts the Python backend (back-end/main.py) and the Vite dev server together.
// Used by `npm run dev`. Ctrl+C stops both. `npm run dev:frontend` starts Vite alone.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(frontendDir, '..', 'back-end');
const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

// Windows uses the "py" launcher; macOS/Linux use "python3". Fall back to "python".
const pythonCommands = process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python'];

let backend = null;
let shuttingDown = false;

function startBackend(index = 0) {
  const command = pythonCommands[index];
  if (!command) {
    console.error('[backend] Python not found. Install Python 3 to get results in the app.');
    return;
  }

  const child = spawn(command, ['main.py'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  child.on('error', error => {
    // command doesn't exist on this machine: try the next one
    if (error.code === 'ENOENT') {
      startBackend(index + 1);
    } else {
      console.error(`[backend] Could not start: ${error.message}`);
    }
  });

  child.on('exit', code => {
    if (backend === child) backend = null;
    if (!shuttingDown && code !== 0) {
      console.error(`[backend] Stopped (exit code ${code}). The results panel won't work until it's running.`);
    }
  });

  backend = child;
}

function stopBackend() {
  shuttingDown = true;
  if (backend && backend.exitCode === null) backend.kill();
}

startBackend();

const vite = spawn(process.execPath, [viteBin, ...process.argv.slice(2)], {
  cwd: frontendDir,
  stdio: 'inherit',
});

vite.on('exit', code => {
  stopBackend();
  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopBackend();
    vite.kill(signal);
  });
}
