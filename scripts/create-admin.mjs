#!/usr/bin/env node
/**
 * Creates or updates an admin login.
 *
 *   npm run admin:create
 *
 * Reads REDIS_URL from the environment (.env.local is loaded if present),
 * prompts for an email and password, and stores a scrypt hash under
 * portfolio:admin:user:{email}. No plaintext password is written anywhere,
 * and this is the only way an account is made — there is no public sign-up.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit } from "node:process";
import { readFileSync, existsSync } from "node:fs";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { createClient } from "redis";

const scryptAsync = promisify(scrypt);

// Minimal .env loader — avoids a dependency for a script run a handful of times.
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
}

const url = process.env.REDIS_URL;
if (!url) {
  console.error("REDIS_URL is not set. Add it to .env.local first.");
  exit(1);
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password.normalize("NFKC"), salt, 64, {
    N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$16384$8$1$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/**
 * Flags let this run unattended over SSH / a Render shell during a deploy:
 *   node scripts/create-admin.mjs --email you@example.com --password '...' --name 'You'
 * Without them it prompts interactively.
 */
function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const interactive = stdin.isTTY && !flag("email");
const rl = interactive ? createInterface({ input: stdin, output: stdout }) : null;
const ask = async (prompt, fallback) => (rl ? await rl.question(prompt) : (fallback ?? ""));

try {
  const email = (flag("email") ?? (await ask("Admin email: "))).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("That doesn't look like an email address.");
    exit(1);
  }

  const password = flag("password") ?? (await ask("Password (min 12 characters): "));
  if (password.length < 12) {
    console.error("Use at least 12 characters.");
    exit(1);
  }
  if (rl) {
    const confirm = await ask("Confirm password: ");
    if (password !== confirm) {
      console.error("Those didn't match.");
      exit(1);
    }
  }

  const name = (flag("name") ?? (rl ? await ask("Display name (optional): ") : "")).trim() || null;
  rl?.close();

  const client = createClient({ url });
  client.on("error", () => {});
  await client.connect();

  const passwordHash = await hashPassword(password);
  const key = `portfolio:admin:user:${email}`;
  const existing = await client.get(key);
  const previous = existing ? JSON.parse(existing) : null;

  await client.set(
    key,
    JSON.stringify({ email, name: name ?? previous?.name ?? null, passwordHash }),
  );
  await client.quit();

  console.log(`\n✓ Admin login ready for ${email}. Sign in at /admin/login`);
} catch (error) {
  console.error("\nFailed:", error?.message ?? error);
  exit(1);
}
