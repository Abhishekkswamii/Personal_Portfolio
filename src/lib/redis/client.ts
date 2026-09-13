import "server-only";

import { createClient, type RedisClientType } from "redis";
import { REDIS_TIMEOUT_MS, REDIS_URL, isRedisConfigured } from "./config";

/**
 * One connection for the process, reused across requests and surviving hot
 * reloads in dev (without the global, every edit would leak a socket).
 *
 * Render's web service and Redis Cloud talk over the public internet rather
 * than a local socket, so every operation below is wrapped in a deadline —
 * the pattern that kept the site up through a MySQL outage carries over
 * unchanged: on timeout or connection failure, callers get `null` back and
 * decide for themselves whether that means "serve the seed" (public site) or
 * "show an error" (admin).
 */

declare global {
  var __portfolioRedis: RedisClientType | undefined;
  var __portfolioRedisConnecting: Promise<RedisClientType> | undefined;
  /** Circuit breaker: while set to a future time, connection attempts are
   *  skipped outright rather than retried. */
  var __portfolioRedisDownUntil: number | undefined;
}

/**
 * How long a failed connection attempt is remembered before another one is
 * tried. Without this, a single request that fans out into several Redis
 * calls — the root layout's metadata plus a page's own reads — pays the full
 * connection timeout once PER CALL, because each one has no memory of the
 * others' failure. One request can end up waiting out the timeout three or
 * four times in a row, turning a 2s bound into a 10s one. The breaker makes
 * only the first call in a bad window pay that cost; everything after it
 * fails instantly until the cooldown elapses.
 */
const CIRCUIT_COOLDOWN_MS = 5000;

async function connect(): Promise<RedisClientType> {
  const client: RedisClientType = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: REDIS_TIMEOUT_MS,
      reconnectStrategy: (retries) => Math.min(retries * 200, 3000),
    },
  });
  client.on("error", () => {
    // Swallowed deliberately: every call site has its own timeout and its own
    // fallback. An unhandled 'error' event would otherwise crash the process.
  });
  await client.connect();
  return client;
}

async function getClient(): Promise<RedisClientType | null> {
  if (!isRedisConfigured) return null;

  if (globalThis.__portfolioRedis?.isReady) return globalThis.__portfolioRedis;

  if (globalThis.__portfolioRedisDownUntil && Date.now() < globalThis.__portfolioRedisDownUntil) {
    return null;
  }

  if (!globalThis.__portfolioRedisConnecting) {
    globalThis.__portfolioRedisConnecting = connect().catch((e) => {
      globalThis.__portfolioRedisConnecting = undefined;
      throw e;
    });
  }
  const connecting = globalThis.__portfolioRedisConnecting;

  // node-redis's own `socket.connectTimeout` only bounds a socket that
  // actively fails (a refused connection, a reset). A host that is merely
  // unreachable — no route, a security group silently dropping the packet,
  // the case a Redis Cloud outage most plausibly looks like — leaves the
  // TCP handshake retrying for the OS's own timeout, commonly 60–130s, and
  // .connect() simply never settles inside that window. Racing it here is
  // what keeps that failure mode from being any different than a fast one:
  // every caller is bounded by REDIS_TIMEOUT_MS no matter how the socket
  // actually behaves. The connection attempt itself is left running in the
  // background — if it eventually succeeds, the next request benefits.
  try {
    const client = await Promise.race([
      connecting,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), REDIS_TIMEOUT_MS)),
    ]);
    if (!client) {
      globalThis.__portfolioRedisDownUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
      return null;
    }
    globalThis.__portfolioRedis = client;
    globalThis.__portfolioRedisDownUntil = undefined;
    return client;
  } catch {
    globalThis.__portfolioRedisConnecting = undefined;
    globalThis.__portfolioRedisDownUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    return null;
  }
}

export class RedisUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("The database is unavailable.");
    this.name = "RedisUnavailableError";
    this.cause = cause;
  }
}

async function withDeadline<T>(work: Promise<T>, ms = REDIS_TIMEOUT_MS): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Reads one JSON document. Returns null on a miss, a timeout, or a bad connection. */
export async function getJSON<T>(key: string): Promise<T | null> {
  const client = await getClient();
  if (!client) return null;
  const raw = await withDeadline(client.get(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Reads several JSON documents in one round trip. Missing keys come back as null. */
export async function getManyJSON<T>(keys: string[]): Promise<(T | null)[]> {
  if (!keys.length) return [];
  const client = await getClient();
  if (!client) return keys.map(() => null);
  const raw = await withDeadline(client.mGet(keys));
  if (!raw) return keys.map(() => null);
  return raw.map((v) => {
    if (!v) return null;
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  });
}

/** Writes one JSON document. Throws so admin callers can report a real failure. */
export async function setJSON(key: string, value: unknown): Promise<void> {
  const client = await getClient();
  if (!client) throw new RedisUnavailableError();
  const result = await withDeadline(client.set(key, JSON.stringify(value)));
  if (result === null) throw new RedisUnavailableError();
}

export async function del(...keys: string[]): Promise<void> {
  const client = await getClient();
  if (!client) throw new RedisUnavailableError();
  const result = await withDeadline(client.del(keys));
  if (result === null) throw new RedisUnavailableError();
}

/* -- Ordered collections ---------------------------------------------------
   Each collection is a sorted set of ids (the score is sort order) plus one
   JSON document per id. This is the "portfolio:projects" / "portfolio:project:
   {id}" split from the brief: the sorted set is purely an index, so listing
   or reordering a collection never touches the documents themselves. */

export async function zAddOrUpdate(indexKey: string, id: string, score: number): Promise<void> {
  const client = await getClient();
  if (!client) throw new RedisUnavailableError();
  const result = await withDeadline(client.zAdd(indexKey, { score, value: id }));
  if (result === null) throw new RedisUnavailableError();
}

export async function zRem(indexKey: string, id: string): Promise<void> {
  const client = await getClient();
  if (!client) throw new RedisUnavailableError();
  const result = await withDeadline(client.zRem(indexKey, id));
  if (result === null) throw new RedisUnavailableError();
}

/** Ordered ids for a collection. Empty (not null) when Redis is unreachable. */
export async function zRange(indexKey: string): Promise<string[]> {
  const client = await getClient();
  if (!client) return [];
  const result = await withDeadline(client.zRange(indexKey, 0, -1));
  return result ?? [];
}

export async function zCard(indexKey: string): Promise<number> {
  const client = await getClient();
  if (!client) return 0;
  const result = await withDeadline(client.zCard(indexKey));
  return result ?? 0;
}

/** The current sort position of one id, or null if it isn't in the set. */
export async function zScore(indexKey: string, id: string): Promise<number | null> {
  const client = await getClient();
  if (!client) return null;
  const result = await withDeadline(client.zScore(indexKey, id));
  return result ?? null;
}

/** Rewrites an entire collection's ordering in one round trip. */
export async function zReplaceAll(
  indexKey: string,
  orderedIds: string[],
): Promise<void> {
  const client = await getClient();
  if (!client) throw new RedisUnavailableError();
  const multi = client.multi();
  multi.del(indexKey);
  orderedIds.forEach((id, i) => multi.zAdd(indexKey, { score: i + 1, value: id }));
  const result = await withDeadline(multi.exec());
  if (result === null) throw new RedisUnavailableError();
}

/**
 * Runs several writes atomically. Used for multi-key operations (saving a
 * document and updating its index entry, or the whole first-run seed) so a
 * timeout can never leave the collection half-written.
 */
export async function transaction(
  build: (multi: ReturnType<RedisClientType["multi"]>) => void,
): Promise<void> {
  const client = await getClient();
  if (!client) throw new RedisUnavailableError();
  const multi = client.multi();
  build(multi);
  const result = await withDeadline(multi.exec(), REDIS_TIMEOUT_MS * 3);
  if (result === null) throw new RedisUnavailableError();
}

/** True when Redis answers. Used by the admin to report connection status. */
export async function ping(): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;
  const result = await withDeadline(client.ping(), 1200);
  return result === "PONG";
}

/** Key builders — the one place the naming scheme is defined. */
export const keys = {
  profile: "portfolio:profile",
  settings: "portfolio:settings",
  socialsIndex: "portfolio:socials",
  social: (id: string) => `portfolio:social:${id}`,
  projectsIndex: "portfolio:projects",
  project: (id: string) => `portfolio:project:${id}`,
  experiencesIndex: "portfolio:experiences",
  experience: (id: string) => `portfolio:experience:${id}`,
  servicesIndex: "portfolio:services",
  service: (id: string) => `portfolio:service:${id}`,
  skillCategoriesIndex: "portfolio:skill-categories",
  skillCategory: (id: string) => `portfolio:skill-category:${id}`,
  educationIndex: "portfolio:education",
  education: (id: string) => `portfolio:education:${id}`,
  patentsIndex: "portfolio:patents",
  patent: (id: string) => `portfolio:patent:${id}`,
  mediaIndex: "portfolio:media",
  media: (id: string) => `portfolio:media:${id}`,
  adminUsersIndex: "portfolio:admin:users",
  adminUser: (email: string) => `portfolio:admin:user:${email.toLowerCase()}`,
};
