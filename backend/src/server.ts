import { createApp } from './app.js';
import { env } from './config/env.js';
import { PgStore } from './data/pgStore.js';
import { JsonStore, type Store } from './data/store.js';

const pgStore = env.DATABASE_URL ? PgStore.fromUrl(env.DATABASE_URL, env.seed) : null;
const store: Store = pgStore ?? new JsonStore(env.dataFile, env.seed);

// Postgres: keste hám dáslepki maǵlıwmat server tińlawdan aldın tayarlanadı
await pgStore?.init();
const app = createApp({ store, corsOrigins: env.corsOrigins, jwtSecret: env.JWT_SECRET });

const server = app.listen(env.PORT, () => {
  console.log(`TEKSHE API: http://localhost:${env.PORT}/api  ·  baza: ${env.DATABASE_URL ? 'Postgres (Neon)' : env.dataFile}`);
  const roles = Object.entries(env.seed.accounts).map(([role, a]) => `${role}: ${a.login}`);
  if (roles.length) console.log(`Akkauntlar (parollar .env de): ${roles.join(' · ')}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} — server toqtatılıp atır…`);
  server.close(() => {
    void (pgStore?.close() ?? Promise.resolve()).finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
