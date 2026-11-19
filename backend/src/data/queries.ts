import { randomUUID } from 'node:crypto';
import type { AuditEntry, ContactRequest, Database, PublicUser } from '../types.js';

/** «Azamat Tleuov» → «AT» */
export const initials = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase())
    .join('') || '?';

/** Ashıq dizimde kórinetuǵın mentorlar: úlgi profiller hám diplomı tastıyıqlanǵan mentorlar */
export const publicMentors = (db: Readonly<Database>) =>
  db.mentors.filter((m) => !m.userId || db.users.find((u) => u.id === m.userId)?.status === 'active');

/** Tek moderatordan ótken hám iyesi bloklanbaǵan vakansiyalar */
export const publicVacancies = (db: Readonly<Database>) =>
  db.vacancies.filter((v) => v.status === 'approved' && (!v.ownerId || db.users.find((u) => u.id === v.ownerId)?.status === 'active'));

/** Soraw qaysı mentor yamasa vakansiyaǵa jiberilgenin kórsetedi */
export const withTarget = (db: Readonly<Database>, r: ContactRequest) => ({
  ...r,
  targetTitle:
    r.type === 'mentor'
      ? (db.mentors.find((m) => m.id === r.targetId)?.name ?? 'Óshirilgen mentor')
      : (db.vacancies.find((v) => v.id === r.targetId)?.title ?? 'Óshirilgen vakansiya'),
});

export const newestFirst = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

/** Jurnalǵa jazıw — update() ishinde shaqırıladı, sonlıqtan ózgeris penen birge saqlanadı */
export const logAudit = (db: Database, actor: PublicUser, action: string, targetLabel: string) => {
  const entry: AuditEntry = { id: randomUUID(), actorId: actor.id, actorName: actor.name, action, targetLabel, createdAt: new Date().toISOString() };
  db.audit.push(entry);
  // Jurnal sheksiz ósip ketpewi ushın aqırǵı 2000 jazıw saqlanadı
  if (db.audit.length > 2000) db.audit.splice(0, db.audit.length - 2000);
};
