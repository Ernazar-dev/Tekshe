import jwt from 'jsonwebtoken';
import type { Role } from '../types.js';

export interface TokenPayload {
  sub: string;
  role: Role;
}

const TTL = '7d';

export const signToken = (payload: TokenPayload, secret: string) => jwt.sign(payload, secret, { expiresIn: TTL });

export const verifyToken = (token: string, secret: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== 'object' || typeof decoded.sub !== 'string') return null;
    return { sub: decoded.sub, role: decoded.role as Role };
  } catch {
    return null;
  }
};
