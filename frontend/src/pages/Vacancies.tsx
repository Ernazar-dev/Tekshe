import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RequestModal, type RequestTarget } from '@/components/RequestModal';
import { FilterChips } from '@/components/ui/FilterChips';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { api } from '@/lib/api';

const RULES = [
  'Kárxana STIR hám guwalıǵı arqalı tastıyıqlanadı',
  'Hár vakansiya moderator tárepinen tekseriledi',
  'Jalǵan yamasa shet elge «jumısqa» shaqırıw sıyaqlı usınıslar qabıl etilmeydi',
];

export default function Vacancies() {
  const [field, setField] = useState('all');
  const [target, setTarget] = useState<RequestTarget | null>(null);
  const query = useQuery({
    queryKey: ['vacancies', field],
    queryFn: () => api.vacancies(field === 'all' ? undefined : field),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="container-page pb-24">
      <PageHeader
        eyebrow="Elge qaytqanlar ushın"
        title="Vakansiyalar"
        text="Shet elde bilim alıp qaytqan qánigeler ushın Qaraqalpaqstan kárxanalarınıń jumıs orınları."
        actions={
          <a href="#karxanalar-ushin" className="btn-gold">
            Vakansiya jariyalaw
          </a>
        }
      />
      <div className="mb-8">
        <FilterChips
          label="Taraw boyınsha filtr"
          value={field}
          onChange={setField}
          options={[{ value: 'all', label: 'Barlıq tarawlar' }, ...(query.data?.fields ?? []).map((f) => ({ value: f, label: f }))]}
        />
      </div>

      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={query.data?.data.length === 0} onRetry={() => query.refetch()}>
        <div className={`grid gap-4 transition-opacity ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
          {query.data?.data.map((j) => (
            <article key={j.id} className="card lift flex flex-wrap items-center gap-x-8 gap-y-5 p-6 md:p-7">
              <span className="font-serif-title flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg font-semibold text-primary">
                {j.initials}
              </span>
              <div className="min-w-0 flex-[999_1_380px]">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="m-0 text-[19px] font-semibold">{j.title}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-deep">
                    <Icon name="verified" size={13} /> Tastıyıqlanǵan kárxana
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span>{j.company}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="pin" size={14} /> {j.city}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{j.type}</span>
                </div>
                <div className="mt-2 text-[15px]">
                  <span className="font-semibold">Talap:</span> {j.requirement}
                </div>
              </div>
              <div className="flex flex-[1_1_200px] flex-col items-start gap-3">
                <span className="text-[15px] font-semibold">Aylıq: kelisim boyınsha</span>
                <button type="button" className="btn-dark" onClick={() => setTarget({ type: 'vacancy', id: j.id, title: j.title })}>
                  Arza beriw
                </button>
              </div>
            </article>
          ))}
        </div>
      </QueryState>
      <p className="mt-6 text-sm text-muted">Kárxana atları hám lawazımlar — úlgi maǵlıwmat.</p>

      <section id="karxanalar-ushin" className="grain relative mt-14 grid gap-10 overflow-hidden rounded-3xl bg-midnight p-8 text-white md:grid-cols-2 md:p-12">
        <div className="pattern-girih absolute inset-0 opacity-40" aria-hidden />
        <div className="relative">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-light">Seriklik</span>
          <h2 className="font-serif-title m-0 mt-3 text-3xl font-semibold">Kárxanalar ushın</h2>
          <p className="mb-0 mt-4 leading-relaxed text-white/65">
            Shet elde bilim alǵan qánigelerdi izlep atırsız ba? Vakansiyańızdı jariyalań — ol sáykes tarawdaǵı «pitkerip qaytqan» profillerge usınıladı.
          </p>
        </div>
        <div className="relative">
          <h3 className="m-0 text-[15px] font-semibold uppercase tracking-[0.15em] text-accent-light">Jariyalaw tártibi</h3>
          <ul className="m-0 mt-5 list-none space-y-4 p-0">
            {RULES.map((r) => (
              <li key={r} className="flex gap-3 text-[15px] text-white/85">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-solid border-accent/50 text-accent-light">
                  <Icon name="check" size={14} strokeWidth={2.4} />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RequestModal target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
