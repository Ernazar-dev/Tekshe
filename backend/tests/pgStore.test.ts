import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { PgStore, type PoolLike } from '../src/data/pgStore.js';
import type { SeedOptions } from '../src/data/store.js';

/** Postgres'ti jasalma etedi: bir qatarlı app_state keste + BEGIN/ROLLBACK qollaw */
const fakePool = () => {
  const state: { data: unknown | null; snapshot: unknown | null } = { data: null, snapshot: null };
  const run = async (sql: string, params: unknown[] = []) => {
    const q = sql.trim();
    if (q === 'BEGIN') {
      state.snapshot = state.data;
      return { rows: [] };
    }
    if (q === 'COMMIT') return { rows: [] };
    if (q === 'ROLLBACK') {
      state.data = state.snapshot;
      return { rows: [] };
    }
    if (q.startsWith('CREATE TABLE')) return { rows: [] };
    if (q.startsWith('INSERT INTO app_state')) {
      if (state.data === null) state.data = JSON.parse(params[0] as string);
      return { rows: [] };
    }
    if (q.startsWith('SELECT data')) return { rows: state.data === null ? [] : [{ data: structuredClone(state.data) }] };
    if (q.startsWith('UPDATE app_state')) {
      state.data = JSON.parse(params[0] as string);
      return { rows: [] };
    }
    throw new Error(`Kútilmegen SQL: ${q}`);
  };
  const pool: PoolLike = { query: run, connect: async () => ({ query: run, release: () => undefined }) };
  return { pool, state };
};

const ACCOUNTS = { admin: { login: 'pg-admin', password: 'pg-admin-pass' }, mentor: { login: 'pg-mentor', password: 'pg-mentor-pass' } };
const SEED: SeedOptions = { accounts: ACCOUNTS };

const login = (app: ReturnType<typeof createApp>, loginName: string, password: string) => request(app).post('/api/auth/login').send({ login: loginName, password });

describe('PgStore', () => {
  it('birinshi iske túskende keste hám akkauntlardı jaratadı, API menen islesedi', async () => {
    const { pool } = fakePool();
    const store = new PgStore(pool, SEED);
    await store.init();
    const app = createApp({ store, corsOrigins: [], jwtSecret: 'test-secret-test-secret', writeLimit: 1000, authLimit: 1000 });
    expect((await login(app, 'pg-admin', 'pg-admin-pass')).status).toBe(200);
    expect((await login(app, 'pg-mentor', 'pg-mentor-pass')).status).toBe(200);
    expect((await login(app, 'pg-admin', 'qate')).status).toBe(401);
    expect((await request(app).get('/api/grants')).status).toBe(200);
  });

  it('qayta iske túsiw maǵlıwmatlardı óshirmeydi, .env degi parol ózgerse jańalaydı', async () => {
    const { pool } = fakePool();
    const first = new PgStore(pool, SEED);
    await first.init();
    await first.update((db) => {
      db.audit.push({ id: 'a1', actorId: 'x', actorName: 'Test', action: 'test', targetLabel: 'bar', createdAt: new Date().toISOString() });
    });
    const second = new PgStore(pool, { accounts: { admin: { login: 'pg-admin', password: 'rotated-pass-1' } } });
    await second.init();
    expect(await second.read((db) => db.audit.length)).toBe(1);
    const app = createApp({ store: second, corsOrigins: [], jwtSecret: 'test-secret-test-secret', writeLimit: 1000, authLimit: 1000 });
    expect((await login(app, 'pg-admin', 'pg-admin-pass')).status).toBe(401);
    expect((await login(app, 'pg-admin', 'rotated-pass-1')).status).toBe(200);
  });

  it('bir waqıttaǵı jazıwlar bir-birin óshirmeydi', async () => {
    const { pool } = fakePool();
    const store = new PgStore(pool, SEED);
    await store.init();
    const before = await store.read((db) => db.audit.length);
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        store.update((db) => {
          db.audit.push({ id: `p${i}`, actorId: 'x', actorName: 'Test', action: 'bir waqıtta', targetLabel: String(i), createdAt: new Date().toISOString() });
        }),
      ),
    );
    expect(await store.read((db) => db.audit.length)).toBe(before + 20);
  });

  it('update ishinde qáte shıqsa — ózgeris saqlanbaydı, keyingi jazıwlar isleydi', async () => {
    const { pool } = fakePool();
    const store = new PgStore(pool, SEED);
    await store.init();
    const before = await store.read((db) => db.users.length);
    await expect(
      store.update(() => {
        throw new Error('jarqın');
      }),
    ).rejects.toThrow('jarqın');
    expect(await store.read((db) => db.users.length)).toBe(before);
    await store.update((db) => {
      db.audit.push({ id: 'ok', actorId: 'x', actorName: 'Test', action: 'keyin', targetLabel: '', createdAt: new Date().toISOString() });
    });
    expect(await store.read((db) => db.audit.some((a) => a.id === 'ok'))).toBe(true);
  });
});
