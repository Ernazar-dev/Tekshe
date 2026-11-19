import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Store } from './data/store.js';
import { createAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createAdminRouter } from './modules/admin/admin.routes.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createCatalogRouter } from './modules/catalog/catalog.routes.js';
import { createMeRouter } from './modules/me/me.routes.js';
import { createRequestsRouter } from './modules/requests/requests.routes.js';

interface AppOptions {
  store: Store;
  corsOrigins: string[];
  jwtSecret: string;
  /** Bir IP ushın 15 minuttaǵı jazıw sorawları sanı */
  writeLimit?: number;
  /** Kiriw/dizimnen ótiw urınısları sanı (parol tańlawǵa qarsı) */
  authLimit?: number;
}

export const createApp = ({ store, corsOrigins, jwtSecret, writeLimit = 120, authLimit = 20 }: AppOptions) => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: '20kb' }));

  const limiter = (limit: number, message: string, skipReads = false) =>
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: skipReads ? (req) => req.method === 'GET' : undefined,
      message: { message },
    });

  const auth = createAuth(store, jwtSecret);

  const api = express.Router();
  api.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  // Parol tańlawǵa qarsı: kiriw hám dizimnen ótiw qatań sheklengen
  api.use('/auth/login', limiter(authLimit, 'Kiriw urınısları júdá kóp. 15 minuttan keyin qayta urınıń.'));
  api.use('/auth/register', limiter(authLimit, 'Dizimnen ótiw urınısları júdá kóp. Keyinirek urınıp kóriń.'));
  api.use('/auth', createAuthRouter(store, auth, jwtSecret));
  api.use(createCatalogRouter(store));
  api.use('/requests', limiter(writeLimit, 'Sorawlar júdá kóp. Birazdan qayta urınıp kóriń.', true), createRequestsRouter(store, auth));
  api.use('/me', limiter(writeLimit, 'Sorawlar júdá kóp. Birazdan qayta urınıp kóriń.', true), createMeRouter(store, auth));
  api.use('/admin', createAdminRouter(store, auth));

  app.use('/api', api);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
