import pg from 'pg';
import type { Database } from '../types.js';
import { migrate, seed, syncAccounts, type SeedOptions, type Store } from './store.js';

/** Pool'dıń bizge kerek bólegi (testlerde jasalma pool beriledi) */
export interface PoolLike {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  connect(): Promise<{
    query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
    release(err?: unknown): void;
  }>;
  end?(): Promise<void>;
}

/**
 * Postgres (Neon) arqalı saqlaw. Pútkil maǵlıwmat bir jazıwda (jsonb) turadı —
 * ózgerisler `SELECT … FOR UPDATE` penen qulıplanǵan tranzakciyada orınlanadı,
 * sonlıqtan bir neshe nusqa bir waqıtta islese de jazıwlar bir-birin óshirmeydi.
 */
export class PgStore implements Store {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly pool: PoolLike,
    private readonly seedOptions: SeedOptions = { accounts: {} },
  ) {}

  /** Qosılıw URL'inen jasaydı. Neon SSL talap etedi (URL de `sslmode=require` bar) */
  static fromUrl(url: string, seedOptions?: SeedOptions) {
    const pool = new pg.Pool({
      connectionString: url,
      max: 5,
      // Neon bos qosılıslardı jawıp qoyadı — pool bunı qáte emes dep qabıllawı kerek
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
    });
    pool.on('error', (err) => console.error('Postgres pool qátesi:', err.message));
    return new PgStore(pool as unknown as PoolLike, seedOptions);
  }

  /** Keste jaratadı, birinshi iske túskende úlgi maǵlıwmat hám .env akkauntların qosadı */
  async init() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `CREATE TABLE IF NOT EXISTS app_state (
           id smallint PRIMARY KEY CHECK (id = 1),
           data jsonb NOT NULL,
           updated_at timestamptz NOT NULL DEFAULT now()
         )`,
      );
      // Eki nusqa bir waqıtta iske tússe de tek biri jaratadı
      await client.query('INSERT INTO app_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [JSON.stringify(seed(this.seedOptions))]);
      const { rows } = await client.query('SELECT data FROM app_state WHERE id = 1 FOR UPDATE');
      const raw = rows[0]?.data as Partial<Record<keyof Database, unknown[]>>;
      const db = migrate(raw, () => seed(this.seedOptions));
      await syncAccounts(db, this.seedOptions);
      if (JSON.stringify(db) !== JSON.stringify(raw)) await client.query('UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1', [JSON.stringify(db)]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async read<T>(fn: (db: Readonly<Database>) => T): Promise<T> {
    const { rows } = await this.pool.query('SELECT data FROM app_state WHERE id = 1');
    if (!rows[0]) throw new Error('app_state bos: init() shaqırılmaǵan');
    return fn(rows[0].data as Database);
  }

  update<T>(fn: (db: Database) => T): Promise<T> {
    // Bir nusqa ishinde de navbet penen (kóp tranzakciya Neon qosılısların tolıtırmawı ushın)
    const run = this.queue.then(async () => {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query('SELECT data FROM app_state WHERE id = 1 FOR UPDATE');
        if (!rows[0]) throw new Error('app_state bos: init() shaqırılmaǵan');
        const draft = rows[0].data as Database;
        const result = fn(draft);
        await client.query('UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1', [JSON.stringify(draft)]);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw err;
      } finally {
        client.release();
      }
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  async close() {
    await this.pool.end?.();
  }
}
