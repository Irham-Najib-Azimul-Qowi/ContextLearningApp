import crypto from "crypto";

const MASTER_ENCRYPTION_FALLBACK = "pahami_v2_master_secret_key_32b_2026_hackathon";

function getMasterKey(): Buffer {
  const rawKey = process.env.ADMIN_ENCRYPTION_KEY || MASTER_ENCRYPTION_FALLBACK;
  return crypto.createHash("sha256").update(rawKey).digest();
}

/**
 * Hash a password using memory-hard scrypt with a cryptographically secure random salt.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        hash: derivedKey.toString("hex"),
        salt,
      });
    });
  });
}

/**
 * Synchronous password hashing for CLI bootstrap scripts and fast operations.
 */
export function hashPasswordSync(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

/**
 * Verify a password against a stored scrypt hash in constant time (timing-attack resistant).
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  return new Promise((resolve) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const keyBuffer = derivedKey;
        const storedBuffer = Buffer.from(storedHash, "hex");
        if (keyBuffer.length !== storedBuffer.length) {
          return resolve(false);
        }
        resolve(crypto.timingSafeEqual(keyBuffer, storedBuffer));
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Encrypt a secret (e.g. Gemini API Key) using authenticated AES-256-GCM.
 * Generates a unique 12-byte initialization vector (IV) and a 16-byte authentication tag.
 */
export function encryptSecret(plaintext: string): { ciphertext: string; iv: string; tag: string } {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    ciphertext,
    iv: iv.toString("hex"),
    tag,
  };
}

/**
 * Decrypt an AES-256-GCM encrypted secret and verify its authentication tag.
 */
export function decryptSecret(ciphertext: string, ivHex: string, tagHex: string): string {
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

/**
 * Generate a visual masked key for display in Admin tables without exposing the plaintext key.
 * e.g. "AIzaSy...4x9Q"
 */
export function maskApiKey(key: string): string {
  if (!key) return "••••••••••••••••";
  const trimmed = key.trim();
  if (trimmed.length <= 10) return "••••••••";
  return `${trimmed.substring(0, 6)}••••••••${trimmed.substring(trimmed.length - 4)}`;
}

/**
 * Generate a 32-byte cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Compute SHA-256 hash of a session token for database lookup.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
