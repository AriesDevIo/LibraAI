// AI model configuration.
//
// Libra's assistant runs on the Claude Agent SDK billed to the developer's
// Claude MAX subscription — NOT a pay-per-token API key. The route strips
// ANTHROPIC_API_KEY from the subprocess env so it can never bill credits;
// auth comes from CLAUDE_CODE_OAUTH_TOKEN (run `claude setup-token` signed in
// with the Max account) or the machine's local Claude Code login. Because it
// spawns the Claude Code subprocess, this path runs locally in dev only.

// Model alias resolved by the subscription to the latest Opus (currently
// Opus 4.8). Using the alias keeps it on whatever the Max plan serves as Opus.
export const CLAUDE_MODEL = "opus";

// Bound the agent loop (model ↔ image-search tool) so one message can't fan out
// into unbounded turns.
export const MAX_TURNS = 6;

// Env vars never forwarded to the Claude subprocess: the API key (so it can't
// bill credits — forcing subscription auth) and app secrets (defense in depth,
// so a prompt-injected agent can never read them out of the environment).
export const ENV_DENYLIST = new Set([
  "ANTHROPIC_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
]);

/** process.env minus the denylist — the env handed to the Claude subprocess. */
export function subscriptionEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (ENV_DENYLIST.has(k)) continue;
    if (typeof v === "string") out[k] = v;
  }
  return out;
}
