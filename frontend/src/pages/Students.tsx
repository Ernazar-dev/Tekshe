import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { CountUp, Reveal } from '@/hooks/motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const PRIVACY = [
  'Studentlerdiń atı, turǵan jeri hám kontaktı ashıq kórsetilmeydi — bul olardıń qáwipsizligi ushın.',
  'Tolıq dizim tek ruxsatı bar xızmetkerlerge kórinedi.',
  'Kontakt kórilgende, kim hám qashan kórgeni jurnalǵa jazıladı.',
  'Ne kórinetuǵının student ózi basqaradı.',
];

const Bars = ({ items, total }: { items: { name: string; count: number }[]; total: number }) => (
  <ul className="m-0 grid list-none gap-4 p-0">
    {items.map((i) => (
      <li key={i.name}>
        <div className="mb-1.5 flex justify-between text-[15px]">
          <span className="font-medium">{i.name}</span>
          <span className="tabular-nums text-muted">{i.count}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full" style={{ width: `${total ? (i.count / total) * 100 : 0}%`, background: 'var(--gold-gradient)' }} />
        </div>
      </li>
    ))}
  </ul>
);

/** Ashıq «Jámáát» beti: tek ulıwma sanlar. Studentlerdiń tolıq dizimi — tek xızmetkerler ushın (panelde). */
export default function Students() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ['community'], queryFn: api.community });
  const d = query.data;
  const total = d ? d.students + d.graduates : 0;

  return (
    <div className="container-page pb-24">
      <PageHeader
        eyebrow="Jámáát"
        title="Shet eldegi studentlerimiz"
        text="Shet elde oqıp atırǵan hám oqıwın pitkerip qaytqan Qaraqalpaqstan jasları. Mınaw — ulıwma sanlar, jeke maǵlıwmat joq."
        actions={
          user ? (
            <Link to="/kabinet" className="btn-dark">
              Panelge ótiw <Icon name="arrowRight" size={16} />
            </Link>
          ) : (
            <Link to="/dizimnen-otiw?rol=student" className="btn-gold">
              Jámáátke qosılıw
            </Link>
          )
        }
      />

      <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()} skeleton={4}>
        {d && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'shet elde oqıp atır', value: d.students },
                { label: 'oqıwın pitkerip qaytqan', value: d.graduates },
                { label: 'mámleket', value: d.countries },
                { label: 'belsendi mentor', value: d.mentors },
              ].map((s, i) => (
                <Reveal key={s.label} delay={i * 80} className="card p-6">
                  <div className="font-serif-title text-[44px] font-semibold leading-none text-midnight">
                    <CountUp value={s.value} />
                  </div>
                  <div className="mt-2 text-sm text-muted">{s.label}</div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Reveal className="card p-7">
                <h2 className="font-serif-title m-0 mb-6 text-2xl font-semibold">Mámleketler boyınsha</h2>
                <Bars items={d.byCountry} total={total} />
              </Reveal>
              <Reveal delay={100} className="card p-7">
                <h2 className="font-serif-title m-0 mb-6 text-2xl font-semibold">Tarawlar boyınsha</h2>
                <Bars items={d.byField} total={total} />
              </Reveal>
            </div>
          </>
        )}
      </QueryState>

      <section className="grain relative mt-14 overflow-hidden rounded-3xl bg-midnight p-8 text-white md:p-12">
        <div className="pattern-girih absolute inset-0 opacity-40" aria-hidden />
        <div className="relative grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-light">
              <Icon name="lock" size={14} /> Maǵlıwmatlarıńız qorǵalǵan
            </span>
            <h2 className="font-serif-title m-0 mt-3 text-3xl font-semibold">Qáwipsizlik — birinshi orında</h2>
          </div>
          <ul className="m-0 grid list-none gap-3 p-0">
            {PRIVACY.map((p) => (
              <li key={p} className="flex gap-3 text-[15px] text-white/80">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-solid border-accent/50 text-accent-light">
                  <Icon name="check" size={14} strokeWidth={2.4} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
