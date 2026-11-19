import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterChips } from '@/components/ui/FilterChips';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { api } from '@/lib/api';
import type { Level } from '@/lib/types';

type LevelFilter = Level | 'all';

export default function Grants() {
  const [level, setLevel] = useState<LevelFilter>('all');
  const query = useQuery({
    queryKey: ['grants', level],
    queryFn: () => api.grants(level === 'all' ? undefined : level),
    placeholderData: keepPreviousData,
  });
  const levels = query.data?.levels ?? ['Bakalavr', 'Magistr', 'PhD'];

  return (
    <div className="container-page pb-24">
      <PageHeader
        eyebrow="Grantlar katalogı"
        title="Grantlar bir jerde"
        text="Mámleketlik hám shet el grantları. Shártler hám múddetler hár jılı ózgeredi — tapsırıwdan aldın rásmiy saytın tekseriń."
      />
      <div className="mb-8">
        <FilterChips<LevelFilter>
          label="Oqıw basqıshı boyınsha filtr"
          value={level}
          onChange={setLevel}
          options={[{ value: 'all', label: 'Barlıǵı' }, ...levels.map((l) => ({ value: l, label: l }))]}
        />
      </div>

      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={query.data?.data.length === 0} onRetry={() => query.refetch()} skeleton={6}>
        <div className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
          {query.data?.data.map((g) => (
            <article key={g.id} className="card lift flex flex-col p-7">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-deep">{g.country}</span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${g.kind === 'Mámleketlik' ? 'bg-accent-soft text-accent-deep' : 'bg-canvas text-muted'}`}
                >
                  {g.kind}
                </span>
              </div>
              <h2 className="font-serif-title m-0 mt-4 text-[22px] font-semibold leading-snug">{g.name}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.levels.map((l) => (
                  <span key={l} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    {l}
                  </span>
                ))}
              </div>
              <p className="mb-6 mt-4 text-[15px] leading-relaxed text-ink/80">
                <span className="font-semibold text-ink">Qaplaydı:</span> {g.covers}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 border-0 border-t border-solid border-line pt-5 text-sm">
                <span className="text-muted">Múddeti: rásmiy saytta</span>
                <a href={g.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 font-semibold text-primary no-underline hover:text-midnight">
                  {g.site}
                  <Icon name="arrowUpRight" size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <span className="sr-only">(jańa betde ashıladı)</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </QueryState>

      <div className="grain relative mt-14 overflow-hidden rounded-3xl bg-midnight px-8 py-10 text-white md:px-12">
        <div className="pattern-girih absolute inset-0 opacity-40" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-serif-title m-0 text-2xl font-semibold md:text-3xl">Grantqa tapsırıwda járdem kerek pe?</h2>
            <p className="mb-0 mt-2 text-white/65">Sol granttı alıp, oqıp qaytqan mentor menen baylanısıń.</p>
          </div>
          <Link to="/mentorlar" className="btn-gold">
            Mentor tabıw <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
