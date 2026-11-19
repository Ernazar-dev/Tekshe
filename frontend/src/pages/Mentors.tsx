import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RequestModal, type RequestTarget } from '@/components/RequestModal';
import { FilterChips } from '@/components/ui/FilterChips';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { api } from '@/lib/api';

const REQUIREMENTS = [
  'Shet el universitetin pitkergen (diplom tastıyıqlanadı)',
  'OneID arqalı tastıyıqlanǵan profil',
  'Qısqa onlayn trening hám etika qaǵıydalarına qol qoyıw',
];

export default function Mentors() {
  const [country, setCountry] = useState('all');
  const [target, setTarget] = useState<RequestTarget | null>(null);
  const query = useQuery({
    queryKey: ['mentors', country],
    queryFn: () => api.mentors(country === 'all' ? undefined : country),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="container-page pb-24">
      <PageHeader
        eyebrow="Tájiriybe — nátiyjege"
        title="Mentorlar"
        text="Shet elde oqıp, elge qaytqan qánigeler. Olar hújjet tapsırıw, grant, beyimlesiw hám kásip tańlawda jol kórsetedi."
        actions={
          <a href="#mentor-boliw" className="btn-gold">
            Mentor bolıw
          </a>
        }
      />
      <div className="mb-8">
        <FilterChips
          label="Mámleket boyınsha filtr"
          value={country}
          onChange={setCountry}
          options={[{ value: 'all', label: 'Barlıq mámleketler' }, ...(query.data?.countries ?? []).map((c) => ({ value: c, label: c }))]}
        />
      </div>

      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={query.data?.data.length === 0} onRetry={() => query.refetch()} skeleton={6}>
        <div className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
          {query.data?.data.map((m) => (
            <article key={m.id} className="card lift flex flex-col gap-5 p-7">
              <div className="flex items-center gap-4">
                <span className="font-serif-title flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-midnight text-lg font-semibold text-accent-light ring-4 ring-accent-soft">
                  {m.initials}
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 text-[18px] font-semibold">{m.name}</h2>
                  <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                    {m.job}
                    <span className="inline-flex items-center text-primary" title="Tastıyıqlanǵan">
                      <Icon name="verified" size={15} />
                      <span className="sr-only">Tastıyıqlanǵan</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[14.5px] leading-relaxed">
                <span className="font-semibold">Pitkergen:</span> {m.university}, {m.country} · {m.year}
              </div>
              <div className="flex flex-wrap gap-2">
                {m.topics.map((t) => (
                  <span key={t} className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink/75">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Icon name="language" size={16} /> {m.languages.join(', ')}
              </div>
              <button type="button" className="btn-outline mt-auto" onClick={() => setTarget({ type: 'mentor', id: m.id, title: m.name })}>
                Keńes soraw
              </button>
            </article>
          ))}
        </div>
      </QueryState>
      <p className="mt-6 text-sm text-muted">Mentor atları — úlgi maǵlıwmat.</p>

      <section id="mentor-boliw" className="card mt-14 grid gap-10 p-8 md:grid-cols-2 md:p-12">
        <div>
          <span className="eyebrow !text-accent-deep">Úles qosıń</span>
          <h2 className="font-serif-title m-0 mt-3 text-3xl font-semibold">Mentor bolıw</h2>
          <p className="mb-0 mt-4 leading-relaxed text-muted">
            Shet elde oqıwın pitkerip qaytqan bolsańız, óz tájiriybeńiz benen jaslarǵa járdem beriń. Ayına bir-eki saat jetkilikli.
          </p>
        </div>
        <div>
          <h3 className="m-0 text-[15px] font-semibold uppercase tracking-[0.15em] text-primary">Talaplar</h3>
          <ul className="m-0 mt-5 list-none space-y-4 p-0">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="flex gap-3 text-[15px]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
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
