import { useQuery } from '@tanstack/react-query';
import { useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { api } from '@/lib/api';
import { useChecklist } from '@/lib/checklist';
import type { StageId } from '@/lib/types';

const WARNINGS = [
  'Pasportıńızdı hesh kimge «saqlawǵa» bermeń.',
  '«Jeńil hám joqarı aylıqlı jumıs» usınısı — kóbinese aldaw.',
  'Jumıs islew huqıqı viza túrine baylanıslı — aldın tekseriń.',
];

export default function Guides() {
  const query = useQuery({ queryKey: ['guides'], queryFn: api.guides });
  const [stage, setStage] = useState<StageId>('before');
  const { checked, toggle, synced, saveError } = useChecklist();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const stages = query.data?.checklists ?? [];
  const current = stages.find((s) => s.id === stage);
  const done = current?.items.filter((i) => checked[i.id]).length ?? 0;
  const total = current?.items.length ?? 0;

  // WAI-ARIA tablist: strelkalar, Home, End
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const keys: Record<string, number> = {
      ArrowRight: (i + 1) % stages.length,
      ArrowLeft: (i - 1 + stages.length) % stages.length,
      Home: 0,
      End: stages.length - 1,
    };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setStage(stages[next]!.id);
    tabsRef.current[next]?.focus();
  };

  return (
    <div className="container-page pb-24">
      <PageHeader
        eyebrow="Tayarlıq dizimi"
        title="Ketiwden aldınǵı keńesler"
        text="Shet elge oqıwǵa baratuǵınlar ushın tayarlıq dizimi hám oqıp qaytqanlardıń video-keńesleri."
      />

      <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()} skeleton={2}>
        <div role="tablist" aria-label="Basqıshlar" className="mb-8 flex flex-wrap gap-2">
          {stages.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                tabsRef.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${s.id}`}
              aria-selected={s.id === stage}
              aria-controls={`panel-${s.id}`}
              tabIndex={s.id === stage ? 0 : -1}
              onClick={() => setStage(s.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={s.id === stage ? 'chip-on' : 'chip-off'}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {current && (
            <section id={`panel-${current.id}`} role="tabpanel" aria-labelledby={`tab-${current.id}`} className="card p-7 md:p-9">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif-title m-0 text-2xl font-semibold">{current.title}</h2>
                  <p className="mb-0 mt-1.5 text-sm text-muted">
                    {synced ? 'Belgilep barıń — akkauntıńızda saqlanadı.' : 'Belgilep barıń — dizim usı brauzerde saqlanadı.'}
                  </p>
                  {saveError && (
                    <p className="mb-0 mt-1 text-xs text-red-600">Saqlawda qátelik boldı, qayta urınıp kóriń.</p>
                  )}
                </div>
                <div className="text-right" role="status">
                  <span className="font-serif-title text-3xl font-semibold text-midnight">{done}</span>
                  <span className="text-muted"> / {total} orınlandı</span>
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-premium"
                  style={{ width: `${total ? (done / total) * 100 : 0}%`, background: 'var(--gold-gradient)' }}
                />
              </div>
              <ul className="m-0 mt-6 flex list-none flex-col gap-1 p-0">
                {current.items.map((it) => {
                  const on = !!checked[it.id];
                  return (
                    <li key={it.id}>
                      <label className={`flex cursor-pointer items-start gap-4 rounded-xl p-3.5 transition-colors ${on ? 'bg-primary-soft/60' : 'hover:bg-canvas'}`}>
                        <input type="checkbox" checked={on} onChange={() => toggle(it.id)} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" />
                        <span>
                          <span className={`block text-[16px] font-semibold transition-colors ${on ? 'text-muted line-through decoration-accent/60' : ''}`}>{it.title}</span>
                          <span className="mt-0.5 block text-sm leading-relaxed text-muted">{it.description}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-solid border-amber-300/70 bg-amber-50 p-7">
              <h2 className="m-0 flex items-center gap-2 text-lg font-semibold text-amber-900">
                <Icon name="alert" /> Abaylań: aldaw usınısları
              </h2>
              <ul className="m-0 mt-4 space-y-2 pl-5 text-[15px] leading-relaxed text-amber-950/85">
                {WARNINGS.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div className="card p-7">
              <h2 className="font-serif-title m-0 text-xl font-semibold">Sorawıńız bar ma?</h2>
              <p className="mb-5 mt-2 text-[15px] leading-relaxed text-muted">Sol elde oqıp qaytqan mentordan soraǵan jaqsı.</p>
              <Link to="/mentorlar" className="btn-dark">
                Mentor tabıw <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif-title m-0 text-3xl font-semibold md:text-4xl">Video-keńesler</h2>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-deep">Tez arada</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {query.data?.videos.map((v) => (
              <article key={v.id} className="card overflow-hidden">
                <div className="grain relative flex aspect-video items-center justify-center bg-midnight">
                  <div className="pattern-girih absolute inset-0 opacity-40" aria-hidden />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-solid border-white/40 bg-white/10 text-white backdrop-blur">
                    <Icon name="play" size={20} weight="fill" />
                  </span>
                  <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-muted">Rejede</span>
                </div>
                <div className="p-5">
                  <h3 className="m-0 text-[16px] font-semibold leading-snug">{v.title}</h3>
                  <p className="m-0 mt-1.5 text-sm text-muted">{v.author}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </QueryState>
    </div>
  );
}
