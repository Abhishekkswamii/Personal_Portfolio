import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// promisify resolves to the 3-argument overload, which drops the options
// object we need for the cost parameters. Type it explicitly instead.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

/**
 * Password hashing with scrypt from Node's own crypto.
 *
 * scrypt is memory-hard and built in, so there's no native bcrypt/argon2
 * addon to compile — which matters on shared hosting where the build
 * toolchain is not yours to control.
 *
 * Format: scrypt$N$r$p$<salt-hex>$<hash-hex>
 * The parameters travel with the hash, so they can be raised later without
 * invalidating existing passwords.
 */

const N = 16384; // CPU/memory cost
const R = 8;
const P = 1;
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password.normalize("NFKC"), salt, KEYLEN, {
    N,
    r: R,
    p: P,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (!salt.length || !expected.length) return false;

  try {
    const derived = await scryptAsync(password.normalize("NFKC"), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: 64 * 1024 * 1024,
    });
    // Constant-time: a length check first, because timingSafeEqual throws on
    // mismatched lengths and that throw would itself be a timing signal.
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
