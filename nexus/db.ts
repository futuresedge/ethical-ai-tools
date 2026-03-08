import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Open (or create) the Nexus database next to this file.
// Path is resolved relative to server location — CWD-independent.
const db = new Database(join(__dirname, 'nexus.db'));

// WAL mode: safe for concurrent reads from the webhook server process.
db.pragma('journal_mode = WAL');

// Apply schema on every startup — IF NOT EXISTS guards make this idempotent.
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

export default db;
