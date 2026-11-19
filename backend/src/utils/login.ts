import { z } from 'zod';

/** Login: 3–32 belgi, kishi háripler, sanlar hám . _ - (birinshi belgi — háripte yamasa sanda) */
export const LOGIN_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;

export const loginField = z
  .string({ required_error: 'Login kiritiń' })
  .trim()
  .toLowerCase()
  .regex(LOGIN_RE, 'Login 3–32 belgi: háripler, sanlar, . _ - (@ bolmasın)');

/** Eski email'nen login payda etedi (@ ge shekemgi bólim), bántlikte san qosıladı */
export const loginFromEmail = (email: string, taken: Set<string>) => {
  const base = (email.split('@')[0] ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/^[^a-z0-9]+/, '')
    .slice(0, 28)
    .padEnd(3, '0');
  let candidate = base;
  for (let i = 2; taken.has(candidate); i++) candidate = `${base}${i}`;
  return candidate;
};
