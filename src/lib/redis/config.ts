/**
 * Redis is optional in exactly the way MySQL/Supabase were before it: with no
 * REDIS_URL the site builds, runs and deploys on the bundled seed. Adding the
 * variable turns on the admin and makes the same site editable.
 */
export const REDIS_URL = process.env.REDIS_URL ?? "";

export const isRedisConfigured = Boolean(REDIS_URL);

/** A portfolio must not go down because its database does. */
export const REDIS_TIMEOUT_MS = Number(process.env.REDIS_TIMEOUT_MS ?? 2000);

