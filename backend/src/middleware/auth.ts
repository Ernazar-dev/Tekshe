import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Store } from '../data/store.js';
import type { PublicUser, Role, User } from '../types.js';
import { HttpError } from '../utils/errors.js';
import { verifyToken } from '../utils/token.js';

export const toPublic = ({ passwordHash: _hash, ...user }: User): PublicUser => user;

/** Kirgen paydalanıwshı (requireAuth'tan keyin bar ekenligi kepillengen) */
export const currentUser = (res: Response) => res.locals.user as PublicUser;

export const createAuth = (store: Store, secret: string) => {
  const resolve = async (req: Request): Promise<PublicUser | null> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    const payload = verifyToken(header.slice(7), secret);
    if (!payload) return null;
    return store.read((db) => {
      const user = db.users.find((u) => u.id === payload.sub);
      // Bloklanǵan yamasa óshirilgen paydalanıwshınıń tokeni jaramsız
      return user && user.status !== 'blocked' ? toPublic(user) : null;
    });
  };

  /** Token bolsa — paydalanıwshını anıqlaydı, bolmasa jol beredi */
  const optionalAuth: RequestHandler = (req, res, next) => {
    resolve(req)
      .then((user) => {
        if (user) res.locals.user = user;
        next();
      })
      .catch(next);
  };

  const requireAuth: RequestHandler = (req, res, next) => {
    resolve(req)
      .then((user) => {
        if (!user) throw new HttpError(401, 'Sistemaǵa kiriń');
        res.locals.user = user;
        next();
      })
      .catch(next);
  };

  const requireRole =
    (...roles: Role[]): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
      requireAuth(req, res, (err?: unknown) => {
        if (err) return next(err);
        if (!roles.includes(currentUser(res).role)) return next(new HttpError(403, 'Bul bólimge ruqsatıńız joq'));
        next();
      });
    };

  return { optionalAuth, requireAuth, requireRole };
};

export type Auth = ReturnType<typeof createAuth>;
