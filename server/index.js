import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNoviAccount, RegistrationError, validateRegistration } from './registration.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env.server'))) loadEnvFile(join(root, '.env.server'));

const config = {
  projectId: process.env.NOVI_PROJECT_ID,
  adminEmail: process.env.NOVI_ADMIN_EMAIL,
  adminPassword: process.env.NOVI_ADMIN_PASSWORD
};
if (Object.values(config).some((value) => !value || value.includes('your_'))) {
  console.error('NOVI-beheerdersgegevens ontbreken. Maak .env.server aan op basis van .env.server.example.');
  process.exit(1);
}

const assetRoot = join(root, 'dist');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};
const attempts = new Map();
const pendingEmails = new Set();
const sendJson = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
};

const readJson = async (req) => {
  if (!req.headers['content-type']?.startsWith('application/json')) {
    throw new RegistrationError(415, 'Verstuur JSON om je te registreren.');
  }
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 4096) throw new RegistrationError(413, 'Het formulier is te groot.');
  }
  try { return JSON.parse(text); } catch { throw new RegistrationError(400, 'Het formulier bevat ongeldige JSON.'); }
};

const serveFile = (pathname, res) => {
  if (!existsSync(assetRoot)) return sendJson(res, 404, { error: 'Start de frontend via npm start of bouw eerst met npm run build.' });
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return sendJson(res, 400, { error: 'Ongeldig pad.' }); }
  const requested = resolve(assetRoot, `.${decoded}`);
  if (requested !== assetRoot && !requested.startsWith(assetRoot + sep)) return sendJson(res, 403, { error: 'Geen toegang.' });
  const file = existsSync(requested) && statSync(requested).isFile() ? requested : join(assetRoot, 'index.html');
  res.writeHead(200, { 'Content-Type': mimeTypes[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  createReadStream(file).pipe(res);
};

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname !== '/registration') {
    if (req.method === 'GET' || req.method === 'HEAD') return serveFile(pathname, res);
    return sendJson(res, 404, { error: 'Niet gevonden.' });
  }
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Alleen POST is toegestaan.' });

  const address = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (attempts.get(address) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 5) return sendJson(res, 429, { error: 'Te veel pogingen. Probeer het over 15 minuten opnieuw.' });
  attempts.set(address, [...recent, now]);

  try {
    const input = validateRegistration(await readJson(req));
    if (pendingEmails.has(input.email)) return sendJson(res, 409, { error: 'Registratie voor dit e-mailadres is al bezig.' });
    pendingEmails.add(input.email);
    try {
      const account = await createNoviAccount(input, config);
      return sendJson(res, 201, account);
    } finally {
      pendingEmails.delete(input.email);
    }
  } catch (error) {
    if (error instanceof RegistrationError) return sendJson(res, error.status, { error: error.message });
    console.error('Registratieverzoek is mislukt:', error.name);
    return sendJson(res, 502, { error: 'Registratie is tijdelijk niet beschikbaar.' });
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => console.log(`Registratieserver bereikbaar op poort ${port}.`));
