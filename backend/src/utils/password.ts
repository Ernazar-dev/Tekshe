import { randomBytes, scrypt, scryptSync, timingSafeEqual, type BinaryLike } from 'node:crypto';

const KEY_LEN = 64;

const scryptAsync = (password: BinaryLike, salt: BinaryLike) =>
  new Promise<Buffer>((resolve, reject) => scrypt(password, salt, KEY_LEN, (err, key) => (err ? reject(err) : resolve(key))));

/** Format: scrypt$<salt hex>$<hash hex> */
export const hashPassword = async (password: string) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${(await scryptAsync(password, salt)).toString('hex')}`;
};

/** Seed ushın sinxron variant */
export const hashPasswordSync = (password: string) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, KEY_LEN).toString('hex')}`;
};

export const verifyPassword = async (password: string, stored: string) => {
  const [algo, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
