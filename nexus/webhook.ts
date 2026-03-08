/**
 * nexus/webhook.ts
 *
 * Standalone Fastify HTTP server — port 3001.
 * Separate process from the MCP STDIO server (nexus/server.ts).
 * Shares nexus/nexus.db via SQLite WAL mode (configured in db.ts).
 *
 * Launch: pnpm --filter nexus start:webhook
 *    OR:  /path/to/node node_modules/tsx/dist/cli.mjs nexus/webhook.ts
 *
 * ONE Ontology coverage for POST /webhook/github:
 *
 *   Capability   ✅ Separate HTTP process — no MCP tool registration, no OCAP enforcement.
 *                   NAMED DEFERRAL: HMAC signature verification (X-Hub-Signature-256) omitted.
 *                   Rationale: for Phase 4 local experiment the ngrok URL is the only access
 *                   control. Production hardening: implement per
 *                   https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 *
 *   Accountability ✅ Every processed event writes to audit_log with actor='webhook:github'.
 *                   Both writes (audit_log + stream_events) are inside a single DB transaction.
 *
 *   Quality      ✅ Non-task branches silently ignored; missing/non-string X-GitHub-Event
 *                   returns ok:true without writing (prevents 'github:undefined' rows).
 *                   NAMED DEFERRAL: state gating (reject writes if task is not CLAIMED) is
 *                   out of scope for Phase 4 — webhook is a passive observable, not a gatekeeper.
 *
 *   Temporality  ✅ audit_log is an append-only ledger. No deduplication. Duplicate events from
 *                   GitHub (retries) produce multiple rows — this is correct and expected.
 *                   Timestamp comes from SQLite DEFAULT CURRENT_TIMESTAMP.
 *
 *   Context      ✅ Event content is the context — action JSON stored verbatim in
 *                   audit_log.action column. No MCP tool calls made from this process.
 *
 *   Artifact     ✅ Writes: audit_log + stream_events.
 *                   Never reads: documents, tool_registry, or task state.
 */

import Fastify from 'fastify';
import db from './db.js';
import { extractTaskId, formatStreamEvent, type GitHubPayload } from './webhook-parser.js';

const app = Fastify({ logger: false });

// ─── POST /webhook/github ─────────────────────────────────────────────────────

app.post<{ Body: GitHubPayload }>(
  '/webhook/github',
  async (request, reply) => {
    const event = request.headers['x-github-event'];

    // Quality guard: missing or multi-value event header → ok, nothing written.
    // Prevents 'github:undefined' or 'github:push,push' rows in audit_log.
    if (!event || typeof event !== 'string') {
      return reply.send({ ok: true });
    }

    const payload = request.body;
    const task_id = extractTaskId(payload);

    if (task_id) {
      const actionJson = JSON.stringify({
        action:  payload.action  ?? null,
        sha:     payload.after   ?? payload.pull_request?.head?.sha ?? null,
        title:   payload.pull_request?.title ?? null,
      });

      // Accountability: atomic — both writes succeed or both fail.
      db.transaction(() => {
        db.prepare(
          `INSERT INTO audit_log (task_id, tool_name, action, actor)
           VALUES (?, ?, ?, 'webhook:github')`
        ).run(task_id, `github:${event}`, actionJson);

        db.prepare(
          `INSERT INTO stream_events (task_id, description) VALUES (?, ?)`
        ).run(task_id, formatStreamEvent(event, payload));
      })();
    }

    return reply.send({ ok: true });
  }
);

// ─── Start server ─────────────────────────────────────────────────────────────
// host: '0.0.0.0' — required for ngrok tunnel to reach the process.

app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    process.stderr.write(`Webhook server error: ${err.message}\n`);
    process.exit(1);
  }
  process.stdout.write('Nexus webhook server listening on :3001\n');
});
