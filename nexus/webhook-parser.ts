/**
 * nexus/webhook-parser.ts
 *
 * Pure functions for GitHub webhook payload parsing and plain-English event formatting.
 * Extracted from webhook.ts to keep the HTTP server thin and these functions testable
 * in isolation.
 *
 * Supported event types: push, pull_request, pull_request_review
 * Branch naming convention: refs/heads/task/task-07 → task_id: task-07
 */

// ─── Typed GitHub payload shapes ─────────────────────────────────────────────
// Covers the fields we read across push, pull_request, and pull_request_review.
// All fields are optional — GitHub payloads are large and only partially typed here.

export interface GitHubPayload {
  /** present on push events — e.g. "refs/heads/task/task-07" */
  ref?: string;
  /** SHA after the push — present on push events */
  after?: string;
  /** event-level action — e.g. "opened", "submitted", "synchronize" */
  action?: string | null;
  /** present on pull_request and pull_request_review events */
  pull_request?: {
    head?: {
      /** branch name WITHOUT refs/heads/ prefix — e.g. "task/task-07" */
      ref?: string;
      sha?: string;
    };
    title?: string;
  } | null;
}

// ─── Branch → task_id extraction ─────────────────────────────────────────────

/**
 * extractTaskId
 *
 * Derives the Nexus task_id from a GitHub webhook payload.
 *
 * Push events:        payload.ref = "refs/heads/task/task-07"
 *                     → strip "refs/heads/" → "task/task-07"
 *                     → strip "task/" → "task-07"
 *
 * PR / PR review:     payload.pull_request.head.ref = "task/task-07" (no refs/heads/ prefix)
 *                     → strip "task/" → "task-07"
 *
 * Non-task branches:  Returns null — caller must ignore these events.
 */
export function extractTaskId(payload: GitHubPayload): string | null {
  const branch =
    payload.ref?.replace('refs/heads/', '') ??
    payload.pull_request?.head?.ref ??
    '';

  return branch.startsWith('task/') ? branch.replace('task/', '') : null;
}

// ─── Plain-English stream event formatter ─────────────────────────────────────

/**
 * formatStreamEvent
 *
 * Produces a one-line, human-readable description of a GitHub event for
 * stream_events.description. Visible to Pete in the Nexus stream view.
 *
 * SHA is truncated to 7 characters (standard git short ref length).
 * Title is included for PR events where it exists.
 * Unknown event types fall through to a generic line — server never crashes on new events.
 */
export function formatStreamEvent(event: string, payload: GitHubPayload): string {
  const sha = (payload.after ?? payload.pull_request?.head?.sha ?? '').slice(0, 7);
  const title = payload.pull_request?.title ?? '';
  const action = payload.action ?? '';

  switch (event) {
    case 'push':
      return sha
        ? `🔀 Push to task branch — sha: ${sha}`
        : '🔀 Push to task branch';

    case 'pull_request':
      return title
        ? `📬 PR ${action || 'updated'}: "${title}"${sha ? ` — sha: ${sha}` : ''}`
        : `📬 PR ${action || 'updated'}${sha ? ` — sha: ${sha}` : ''}`;

    case 'pull_request_review':
      return title
        ? `👁 PR review ${action || 'submitted'}: "${title}"`
        : `👁 PR review ${action || 'submitted'}`;

    default:
      return `⚡ GitHub event: ${event}${action ? ` (${action})` : ''}`;
  }
}
