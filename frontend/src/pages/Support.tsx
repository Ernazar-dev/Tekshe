import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { QueryState } from '@/components/ui/QueryState';
import { Reveal } from '@/hooks/motion';
import { api } from '@/lib/api';

const RULES: ReactNode[] = [
  <>
    OneID hám dizimnen ótiw <strong className="text-white">kerek emes</strong>
  </>,
  <>
    Sáwbet studentler dizimi menen <strong className="text-white">baylanıspaydı</strong>
  </>,
  <>
    Grant beriwshi mákemeler sáwbetti <strong className="text-white">kórmeydi</strong>
  </>,
  <>Atıńızdı aytıw-aytpawdı ózińiz sheshesiz</>,
];

const HOW = [
  { title: 'Jazasız', text: 'Telegram-botqa yamasa saytdaǵı chatqa. Atıńız ornına kod beriledi.' },
  { title: 'Psixolog juwap beredi', text: 'Tayarlıqlı psixolog ana tilińizde tıńlaydı hám keńes beredi.' },
  { title: 'Kerek bolsa — video-seans', text: 'Turaqlı járdem kerek bolsa, psixolog penen video arqalı ushırasıw belgilenedi.' },
];

const SELF_HELP = [
  'Jańa elge beyimlesiw: birinshi 3 ay',
  'Imtixan aldındaǵı qorqınıshtı qalay basqarıw',
  'Uyqısızlıq hám sharshaw: ápiwayı usıllar',
  'Dostıńız qıynalıp atırǵanın qalay ańlaw',
];

export default function Support() {
  const topics = useQuery({ queryKey: ['support-topics'], queryFn: api.supportTopics });

  return (
    <>
      <section className="grain relative overflow-hidden bg-midnight text-white">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="pattern-girih absolute inset-0 opacity-40" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.5fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-solid border-accent/40 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-accent-light">
              <Icon name="lock" size={15} /> Anonim járdem xızmeti
            </span>
            <h1 className="font-serif-title m-0 mt-6 text-4xl font-semibold leading-[1.08] md:text-[56px]">
              Qıyın bolsa —<br />
              <span className="font-normal italic text-accent-light">jalǵız qalmań.</span>
            </h1>
            <p className="mb-0 mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Shet elde qıynalıp atırǵan bolsańız, atıńızdı aytpay-aq psixolog penen sóylesiń. Qaraqalpaq, ózbek hám rus tillerinde.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn-gold" disabled aria-describedby="support-soon">
                <Icon name="send" size={18} /> Telegram-botqa jazıw
              </button>
              <button type="button" className="btn-ghost-light" disabled aria-describedby="support-soon">
                <Icon name="chat" size={18} /> Saytta onlayn chat
              </button>
            </div>
            <p id="support-soon" className="mb-0 mt-4 text-sm text-white/55">
              Bot hám onlayn chat tez arada iske qosıladı.
            </p>
          </div>
          <div className="glass-dark rounded-2xl p-7">
            <h2 className="m-0 text-lg font-semibold">Xızmet qaǵıydaları</h2>
            <ul className="m-0 mt-5 list-none space-y-4 p-0">
              {RULES.map((r, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-white/75">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-solid border-accent/50 text-accent-light">
                    <Icon name="check" size={14} strokeWidth={2.4} />
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="container-page flex flex-col gap-20 py-16 pb-24">
        <div role="note" className="flex flex-wrap items-center gap-4 rounded-2xl border border-solid border-red-200 bg-red-50 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-red-700">
            <Icon name="alert" />
          </span>
          <p className="m-0 flex-[1_1_480px] leading-relaxed text-red-950">
            <strong>Ómirińizge yamasa densawlıǵıńızǵa qáwip tónse</strong> — dárhal turǵan elińizdiń tez járdem nomerine qońıraw etiń hám Ózbekstan elshixanası
            yamasa konsullıǵına xabarlasıń.
          </p>
        </div>

        <section>
          <h2 className="font-serif-title m-0 mb-8 text-3xl font-semibold md:text-4xl">Qalay isleydi?</h2>
          <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
            {HOW.map((h, i) => (
              <Reveal as="li" key={h.title} delay={i * 100} className="card p-7">
                <span className="font-serif-title flex h-11 w-11 items-center justify-center rounded-full bg-midnight text-lg font-semibold text-accent-light">{i + 1}</span>
                <h3 className="m-0 mt-5 text-lg font-semibold">{h.title}</h3>
                <p className="mb-0 mt-2 leading-relaxed text-muted">{h.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-serif-title m-0 text-3xl font-semibold md:text-4xl">Qaysı jaǵdaylarda jazıwǵa boladı?</h2>
          <p className="mb-8 mt-3 text-muted">Hesh bir másele «kishkene» emes. Mısalı:</p>
          <QueryState isLoading={topics.isLoading} error={topics.error} onRetry={() => topics.refetch()}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.data?.data.map((t) => (
                <div key={t.title} className="card lift p-6">
                  <div className="font-semibold">{t.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted">{t.description}</div>
                </div>
              ))}
            </div>
          </QueryState>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="card p-8">
            <h2 className="font-serif-title m-0 text-2xl font-semibold">Kim járdem beredi?</h2>
            <p className="mb-0 mt-3 leading-relaxed text-muted">
              Qaraqalpaq, ózbek hám rus tillerinde járdem beretuǵın psixologlar komandası. Qánigelerdi tańlaw hám seriklikler tastıyıqlanıw basqıshında.
            </p>
          </div>
          <div className="card p-8">
            <h2 className="font-serif-title m-0 text-2xl font-semibold">Óz-ózińizge járdem</h2>
            <ul className="m-0 mt-4 list-none space-y-3 p-0">
              {SELF_HELP.map((s) => (
                <li key={s} className="flex items-center gap-3 text-[15px]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
