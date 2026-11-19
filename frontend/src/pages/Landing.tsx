import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV } from '@/components/layout/nav';
import { Icon, type IconName } from '@/components/ui/Icon';
import { CountUp, Reveal, SplitWords, spotlightHandler, useInView } from '@/hooks/motion';
import { api } from '@/lib/api';

const SectionTitle = ({ eyebrow, title, text, link }: { eyebrow: string; title: string; text?: string; link?: { to: string; label: string } }) => (
  <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
    <div className="max-w-2xl">
      <div className="flex items-center gap-4">
        <span className="h-px w-10 bg-accent" aria-hidden />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="font-serif-title m-0 mt-5 text-3xl font-semibold leading-tight md:text-[46px]">{title}</h2>
      {text && <p className="mb-0 mt-4 max-w-prose leading-relaxed text-muted">{text}</p>}
    </div>
    {link && (
      <Link to={link.to} className="group inline-flex items-center gap-2 font-medium text-primary no-underline hover:text-midnight">
        {link.label} <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    )}
  </Reveal>
);

/* ───────────────────────── HERO ───────────────────────── */

/** Súwret ústindegi aylanıwshı basqısh — platformadaǵı jol: tayarlanıw → oqıw → qaytıw */
const STAGES = ['Tayarlanıw', 'Oqıw', 'Qaytıw'];
const pad2 = (n: number) => String(n).padStart(2, '0');
const onPhoto = { textShadow: '0 1px 10px rgba(11, 21, 48, 0.55)' };
const FADE = 'linear-gradient(to right, transparent 0, #000 22%), linear-gradient(to bottom, #000 86%, transparent)';
const fadeMask = { maskImage: FADE, WebkitMaskImage: FADE, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' } as const;

/** Súwret ústindegi kóleńkeler — aq jazıwlar ashıq aspanda da oqılsın */
const PHOTO_SHADE =
  'radial-gradient(ellipse 38% 42% at 90% 14%, rgba(11, 21, 48,0.55), transparent 70%), linear-gradient(to top, rgba(11, 21, 48,0.55), transparent 32%), linear-gradient(to right, transparent 55%, rgba(11, 21, 48,0.18))';

/** 4 ta suratning almashib turishi (hero-1..4.jpg) */
const HERO_PHOTOS = [
  { src: '/hero-1.jpg', alt: 'Shet elde bilim alıp atırǵan jaslar auditoriyada' },
  { src: '/hero-2.jpg', alt: 'Xalıqaralıq universitet imaratı hám studentler' },
  { src: '/hero-3.jpg', alt: 'Qánigelik boyınsha ámeliy tájiriybe hám izertlew' },
  { src: '/hero-4.jpg', alt: 'Shet el universitetin tamamlaǵan bitiriwshiler' },
];

/**
 * Hero súwretleri (hero-1..4.jpg). Ólshemler keńlikke baylanıslı (container query — cqw).
 * Súwretler áste almashıp turadı, shegarası boylap altın nur júredi.
 */
const HeroImage = ({ grants }: { grants?: number }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const photoTimer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % HERO_PHOTOS.length);
    }, 4500);
    const stageTimer = setInterval(() => {
      setStage((prev) => (prev + 1) % STAGES.length);
    }, 3500);
    return () => {
      clearInterval(photoTimer);
      clearInterval(stageTimer);
    };
  }, []);

  return (
    <div className="relative w-full" style={{ aspectRatio: '900 / 560', containerType: 'inline-size' }}>
      <div className="animate-hero-wipe absolute inset-0 z-0 overflow-hidden" style={fadeMask}>
        {HERO_PHOTOS.map((photo, i) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={1800}
            height={1120}
            {...({ fetchpriority: i === 0 ? 'high' : 'low' } as object)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
              i === photoIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
            }`}
          />
        ))}
        <div className="absolute inset-0 z-[2]" style={{ background: PHOTO_SHADE }} aria-hidden />
      </div>

      {/* Ashılıw shegarasındaǵı altın nur */}
      <span
        className="animate-hero-sweep pointer-events-none absolute inset-y-0 z-20 w-[2px] bg-gradient-to-b from-transparent via-accent-light to-transparent"
        style={{ boxShadow: '0 0 18px 4px rgba(230,199,124,0.55)' }}
        aria-hidden
      />

      {/* Súwretler indikatorı */}
      <div className="absolute bottom-5 left-6 z-20 flex items-center gap-2" aria-label="Súwretlerdi almastırıw">
        {HERO_PHOTOS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPhotoIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === photoIndex ? 'w-6 bg-accent-light shadow-[0_0_8px_rgba(230,199,124,0.8)]' : 'w-2 bg-white/40 hover:bg-white/80'
            }`}
            aria-label={`${i + 1}-súwret`}
          />
        ))}
      </div>

      {/* Basqısh esaplaǵıshı */}
      <div className="animate-fade-in absolute z-10 flex flex-col items-center text-center text-white" style={{ left: '80%', top: '9%', width: '17%', animationDelay: '1.5s', ...onPhoto }} aria-live="polite">
        <div className="font-serif-title leading-none" style={{ fontSize: 'clamp(18px, 3.4cqw, 42px)' }}>
          <span key={stage} className="animate-fade-up inline-block">
            {pad2(stage + 1)}
          </span>
          <span className="text-white/60" style={{ fontSize: '0.45em' }}>
            /{pad2(STAGES.length)}
          </span>
        </div>
        <div key={`l${stage}`} className="animate-fade-in mt-2 font-medium uppercase tracking-[0.25em] text-white/90" style={{ fontSize: 'clamp(8px, 1cqw, 11px)' }}>
          {STAGES[stage]}
        </div>
        <span key={`ln${stage}`} className="animate-draw-line mt-3 block w-px bg-gradient-to-b from-accent-light to-transparent" style={{ height: '13cqw' }} aria-hidden />
      </div>

      {/* Grantlar katalogına silteme */}
      <Link
        to="/grantlar"
        className="animate-fade-in group absolute z-10 flex flex-col items-center gap-2 text-center no-underline"
        style={{ left: '80%', width: '17%', bottom: '11%', animationDelay: '1.6s' }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-solid border-accent-light/80 text-accent-light transition-colors group-hover:bg-accent group-hover:text-midnight">
          <Icon name="arrowRight" size={14} />
        </span>
        <span className="leading-snug" style={onPhoto}>
          <span className="block text-white" style={{ fontSize: 'clamp(10px, 1.3cqw, 13px)' }}>
            Grantlar katalogı
          </span>
          <span className="block text-white/70" style={{ fontSize: 'clamp(9px, 1.1cqw, 11px)' }}>
            {grants ? `${grants} programma` : 'Mámleketlik hám shet el'}
          </span>
        </span>
      </Link>
    </div>
  );
};

const Hero = () => {
  const stats = useQuery({ queryKey: ['stats'], queryFn: api.stats });
  return (
    <section className="relative flex bg-canvas lg:min-h-[calc(100dvh-72px)] lg:items-center">
      <div className="container-page grid items-center gap-8 py-10 lg:grid-cols-[1.08fr_1.22fr] lg:gap-0 lg:py-6">
        <div className="relative z-[1] lg:py-10">
          <div className="flex items-center gap-4">
            <span className="animate-line-grow h-px w-12 bg-accent" aria-hidden />
            <span className="animate-fade-up eyebrow" style={{ animationDelay: '250ms' }}>
              Bilim · Tájiriybe · Baylanıs
            </span>
          </div>
          <h1 className="font-serif-title m-0 mt-7 text-[42px] font-semibold leading-[1.04] text-ink sm:text-6xl lg:text-[54px] xl:text-[64px]">
            <SplitWords text="Dúnyaǵa jol ash," delay={80} />
            <br />
            <span className="font-normal italic text-accent-deep">
              <SplitWords text="tájiriybeńdi eliń menen bólis." delay={300} />
            </span>
          </h1>
          <p className="animate-fade-up mb-0 mt-7 max-w-[42ch] text-[17px] leading-[1.75] text-muted" style={{ animationDelay: '500ms' }}>
            Shet elde oqıwǵa birinshi qádemnen — elge qaytıp, kásip baslawǵa shekem. Grantlar, mentorlar hám bir-birin qollaytuǵın jámáát.
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: '620ms' }}>
            <Link to="/grantlar" className="btn-dark group !h-12 !px-7">
              Grantlardı izlew
              <Icon name="arrowRight" size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/dizimnen-otiw" className="btn-outline !h-12 !px-6">
              Dizimnen ótiw
            </Link>
            <Link to="/kirish" className="group inline-flex items-center gap-2 font-medium text-ink no-underline hover:text-primary">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-solid border-line text-ink transition-colors group-hover:border-primary group-hover:text-primary">
                <Icon name="user" size={14} />
              </span>
              Kirish
            </Link>
          </div>
          {stats.data && (
            <p className="animate-fade-up mb-0 mt-10 text-[13px] text-muted" style={{ animationDelay: '760ms' }}>
              <strong className="text-ink">{stats.data.students} student</strong> · {stats.data.countries} mámleket · {stats.data.mentors} mentor
            </p>
          )}
        </div>
        {/* Súwret ońda ekran shetine shekem sozıladı, shepte tekst astına sińip ketedi */}
        <div className="relative lg:-ml-24 lg:-mr-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          <HeroImage grants={stats.data?.grants} />
        </div>
      </div>
    </section>
  );
};

/* ───────────────────────── MODULLAR ───────────────────────── */

const ModuleStrip = () => (
  <section className="border-0 border-y border-solid border-line bg-white/70">
    <div className="container-page flex items-stretch gap-6 py-8">
      <div className="hidden shrink-0 flex-col justify-between lg:flex">
        <span className="text-[11px] font-semibold uppercase leading-relaxed tracking-[0.25em] text-ink">
          {NAV.length} bólim
          <br />
          bir platforma
        </span>
        <span className="h-10 w-px bg-accent" aria-hidden />
      </div>
      <ol className="m-0 flex flex-1 snap-x list-none overflow-x-auto overflow-y-hidden p-0 pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
        {NAV.map((m, i) => (
          <Reveal as="li" key={m.to} delay={i * 70} className="min-w-[190px] snap-start border-0 border-l border-solid border-line px-5 first:border-l-0 lg:min-w-0 lg:first:border-l">
            <Link to={m.to} className="group block no-underline">
              <span className="text-ink/70 transition-colors duration-300 group-hover:text-accent">
                <Icon name={m.icon} size={26} strokeWidth={1.4} />
              </span>
              <div className="font-serif-title mt-3 text-[16px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary">{m.label}</div>
              <div className="mt-1.5 text-[12px] leading-relaxed text-muted">{m.brief}</div>
            </Link>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

/* ───────────────────────── AFZALLIQLAR ───────────────────────── */

const ADVANTAGES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'language', title: 'Ana tilińizde', text: 'Qaraqalpaq, ózbek hám rus tillerinde keńes' },
  { icon: 'verified', title: 'Tastıyıqlanǵan mentorlar', text: 'Shet elde oqıp, elge qaytqan qánigeler' },
  { icon: 'shield', title: 'Anonim járdem', text: 'Psixologiyalıq qollaw — atıńızdı aytpay-aq' },
];

const AdvantagesBand = () => {
  const stats = useQuery({ queryKey: ['stats'], queryFn: api.stats });
  const items = [
    { value: stats.data?.students, label: 'student profili' },
    { value: stats.data?.grants, label: 'grant programması' },
    { value: stats.data?.mentors, label: 'mentor' },
    { value: stats.data?.countries, label: 'mámleket' },
  ];
  return (
    <section className="grain relative overflow-hidden bg-midnight">
      <div className="pattern-girih absolute inset-0 opacity-40" aria-hidden />
      <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr_1fr] lg:py-20">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-accent" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">Platformada</span>
          </div>
          <h2 className="font-serif-title m-0 mt-5 text-3xl font-semibold leading-tight text-white md:text-[42px]">
            Baylanıs usı jerden
            <br />
            <span className="font-normal italic text-accent-light">baslanadı.</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
            {items.map((it) => (
              <div key={it.label} className="bg-midnight/90 p-6">
                <dt className="sr-only">{it.label}</dt>
                <dd className="m-0">
                  <span className="font-serif-title text-gold-gradient block text-[44px] font-semibold leading-none">
                    {it.value === undefined ? '—' : <CountUp value={it.value} />}
                  </span>
                  <span className="mt-2 block text-[13px] text-white/60">{it.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={240}>
          <ul className="m-0 list-none space-y-6 border-0 p-0 lg:border-l lg:border-solid lg:border-white/10 lg:pl-10">
            {ADVANTAGES.map((a) => (
              <li key={a.title} className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-solid border-accent/50 bg-white/[0.04] text-accent-light">
                  <Icon name={a.icon} />
                </span>
                <div>
                  <div className="text-[15px] font-medium text-white">{a.title}</div>
                  <div className="mt-0.5 text-[13px] text-white/60">{a.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
};

/* ───────────────────────── ROLLAR BO'LIMI ───────────────────────── */

const ROLES_INFO = [
  {
    role: 'student',
    icon: 'cap' as const,
    title: 'Studentler ushın',
    tag: 'Tälim & Grant',
    badge: 'Student',
    text: 'Shet el universitetlerine qosılıw, grantlar katalogın salıstırıw, tájiriybeli mentorlardan jeke baǵdar alıw hám ketiwden aldınǵı tayarlıq dizimin toltırıw.',
    perks: ['Mámleketlik hám shet el grantları', 'Tastıyıqlanǵan mentorlardan keńes', 'Bos vakansiyalarǵa tikkeley arza', 'Tayarlıq dizimin saqlaw'],
    cta: 'Student retinde qosılıw',
    to: '/dizimnen-otiw?rol=student',
  },
  {
    role: 'mentor',
    icon: 'compass' as const,
    title: 'Mentorlar ushın',
    tag: 'Tájiriybe & Úles',
    badge: 'Mentor',
    text: 'Shet elde oqıp qaytqan qánige retinde óz tájiriybeńiz benen jaslarǵa jol kórsetiń. Kelgen sorawlarǵa jeke kabinet arqalı juwap beriń hám keleshekke úles qosıń.',
    perks: ['Rásmiy tastıyıqlanǵan mentor profili', 'Studentlerden kelgen sorawlar kabineti', 'Diplom hám qánigelikti kórsetiw', 'Jámáátke járdem beriw'],
    cta: 'Mentor retinde qosılıw',
    to: '/dizimnen-otiw?rol=mentor',
  },
  {
    role: 'employer',
    icon: 'briefcase' as const,
    title: 'Kárxanalar ushın',
    tag: 'Kásip & Qánige',
    badge: 'Tadbirkor',
    text: 'Dúnyanıń aldıńǵı joqarı oqıw orınların tamamlaǵan joqarı kadrlar menen kárxanańızdı bekkemleń. Vakansiyalardı jariyalań hám talabanlardı qabıllap alıń.',
    perks: ['Vakansiyalardı moderaciyaǵa jiberiw', 'Kelgen talabanlar arzasın kórip shıǵıw', 'Kárxana profili hám STIR tastıyıǵı', 'Elge qaytqan qánigeler bazası'],
    cta: 'Kárxana retinde qosılıw',
    to: '/dizimnen-otiw?rol=employer',
  },
];

const RolesSection = () => (
  <section className="container-page py-24">
    <SectionTitle
      eyebrow="Platforma rolları"
      title="Kimler ushın jaratılǵan?"
      text="Platformada hár qatnasıwshı óz ornın hám kerekli quralın tabadı. Ózińizge sáykes roldi tańlań hám jámáátke qosılıń."
    />

    <div className="grid gap-6 md:grid-cols-3">
      {ROLES_INFO.map((r, i) => (
        <Reveal key={r.role} delay={i * 120}>
          <article className="card lift flex h-full flex-col p-8">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon name={r.icon} size={24} />
              </span>
              <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-muted">
                {r.tag}
              </span>
            </div>

            <h3 className="font-serif-title m-0 mt-6 text-2xl font-semibold">{r.title}</h3>
            <p className="mb-6 mt-3 text-[14.5px] leading-relaxed text-muted">{r.text}</p>

            <ul className="m-0 mb-8 list-none space-y-2.5 p-0 border-0 border-t border-solid border-line pt-6 text-[13.5px]">
              {r.perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-ink/85">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                    <Icon name="check" size={12} strokeWidth={2.4} />
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <Link to={r.to} className="btn-dark group mt-auto flex items-center justify-center gap-2">
              <span>{r.cta}</span>
              <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </article>
        </Reveal>
      ))}
    </div>

    {/* Kirish / Ro'yxatdan o'tish strip */}
    <Reveal delay={200} className="mt-10 rounded-2xl border border-solid border-line bg-canvas p-6 md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-serif-title m-0 text-xl font-semibold">Aldın dizimnen ótkenbisiz?</h4>
          <p className="mb-0 mt-1.5 text-sm text-muted">
            Jeke kabinetińizge kiriw ushın login hám parolıńızdı paydalanıń.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/kirish" className="btn-dark">
            Sistemaǵa kiriw <Icon name="arrowRight" size={16} />
          </Link>
          <Link to="/dizimnen-otiw" className="btn-outline">
            Dizimnen ótiw
          </Link>
        </div>
      </div>
    </Reveal>
  </section>
);

/* ───────────────────────── JOL ───────────────────────── */

const JOURNEYS: { n: string; tag: string; title: string; text: string; to: string; cta: string; icon: IconName }[] = [
  { n: '01', tag: 'Tayarlanıw', title: 'Shet elde oqımaqshıman', text: 'Grantlardı salıstırıń, hújjetlerdi tayarlań hám óz jolıńızdı tańlań.', to: '/grantlar', cta: 'Grantlardı kóriw', icon: 'cap' },
  { n: '02', tag: 'Ósiw', title: 'Shet elde oqıp atırman', text: 'Tájiriybeli mentor tabıń, keńes alıń hám jańa ortalıqqa beyimlesiń.', to: '/mentorlar', cta: 'Mentor tabıw', icon: 'compass' },
  { n: '03', tag: 'Úles qosıw', title: 'Tájiriybemdi bólisemen', text: 'Mentor bolıń yamasa elge qaytıp, bilimińizge sáykes jumıs tabıń.', to: '/vakansiyalar', cta: 'Múmkinshilikler', icon: 'briefcase' },
];

const JourneySection = () => (
  <section className="container-page pb-24 pt-6">
    <SectionTitle eyebrow="Sizdiń jolıńız — sizdiń tańlawıńız" title="Qaysı qádemdesiz?" text="Hár basqıshta kerekli maǵlıwmat hám durıs baǵdar." />
    <div className="grid gap-6 md:grid-cols-3">
      {JOURNEYS.map((j, i) => {
        const dark = i === 2;
        return (
          <Reveal key={j.n} delay={i * 110}>
            <Link
              to={j.to}
              onMouseMove={spotlightHandler}
              className={`spotlight lift group flex h-full min-h-[300px] flex-col rounded-2xl border border-solid p-8 no-underline ${
                dark ? 'border-midnight bg-midnight text-white' : 'border-line bg-white text-ink shadow-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full border border-solid ${dark ? 'border-accent/50 text-accent-light' : 'border-accent/40 text-accent-deep'}`}>
                  <Icon name={j.icon} />
                </span>
                <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${dark ? 'text-white/50' : 'text-muted'}`}>
                  {j.n} / {j.tag}
                </span>
              </div>
              <h3 className="font-serif-title m-0 mt-10 text-2xl font-semibold">{j.title}</h3>
              <p className={`mb-8 mt-3 text-[15px] leading-relaxed ${dark ? 'text-white/65' : 'text-muted'}`}>{j.text}</p>
              <span className={`mt-auto inline-flex items-center gap-2 text-sm font-semibold ${dark ? 'text-accent-light' : 'text-primary'}`}>
                {j.cta} <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  </section>
);

/* ───────────────────────── GRANTLAR ───────────────────────── */

const FeaturedGrants = () => {
  const grants = useQuery({ queryKey: ['grants', 'all'], queryFn: () => api.grants() });
  const items = grants.data?.data.slice(0, 3) ?? [];
  if (!items.length) return null;
  return (
    <section className="container-page pb-24">
      <SectionTitle
        eyebrow="Grantlar katalogı"
        title="Dúnyanıń jetekshi grantları"
        text="Mámleketlik hám shet el grantları bir jerde — shártler, qaplaw hám rásmiy siltemeler menen."
        link={{ to: '/grantlar', label: `Barlıq ${grants.data?.data.length ?? ''} grant` }}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((g, i) => (
          <Reveal key={g.id} delay={i * 100}>
            <article className="card lift flex h-full flex-col p-7">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-deep">{g.country}</span>
                <span className="rounded-full bg-canvas px-3 py-1 text-[11px] font-medium text-muted">{g.kind}</span>
              </div>
              <h3 className="font-serif-title m-0 mt-4 text-[22px] font-semibold leading-snug">{g.name}</h3>
              <p className="mb-6 mt-3 text-sm leading-relaxed text-muted">{g.covers}</p>
              <div className="mt-auto flex flex-wrap gap-2 border-0 border-t border-solid border-line pt-5">
                {g.levels.map((l) => (
                  <span key={l} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    {l}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ───────────────────────── QÁDEMLER ───────────────────────── */

const STEPS = [
  { title: 'Baǵdarıńızdı tańlań', text: 'Grant, mentor yamasa kásip — házir sizge ne kerek?' },
  { title: 'Múmkinshiliklerdi salıstırıń', text: 'Basqısh, mámleket hám taraw boyınsha izlep kóriń.' },
  { title: 'Tayarlıq dizimin toltırıń', text: 'Hújjetler, viza, saqlandırıw — hesh nárse umıtılmaydı.' },
  { title: 'Keyingi qádemdi basıń', text: 'Rásmiy grant saytına ótiń yamasa mentorǵa soraw jiberiń.' },
];

/** Bólim ekranǵa kirgende qádemlerdi birme-bir jaǵadı (bir ret) */
const useStepper = (count: number, step = 450) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (!inView) return;
    let i = -1;
    const t = setInterval(() => {
      i += 1;
      setActive(i);
      if (i >= count - 1) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [inView, count, step]);
  return { ref, active };
};

const StepsSection = () => {
  const { ref, active } = useStepper(STEPS.length);
  const progress = active < 0 ? 0 : ((active + 1) / STEPS.length) * 100;
  return (
    <section className="border-0 border-y border-solid border-line bg-white">
      <div ref={ref} className="container-page py-24">
        <div className="mb-10 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-accent" aria-hidden />
              <span className="eyebrow">Ápiwayı {STEPS.length} qádem</span>
            </div>
            <h2 className="font-serif-title m-0 mt-5 text-3xl font-semibold md:text-[46px]">Qalay baslawǵa boladı?</h2>
          </div>
          <div className="font-serif-title text-muted" aria-hidden>
            <span className="text-5xl font-semibold text-midnight">{pad2(Math.max(active + 1, 1))}</span>
            <span className="text-xl"> / {pad2(STEPS.length)}</span>
          </div>
        </div>
        <div className="mb-6 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full transition-[width] duration-500 ease-premium" style={{ width: `${progress}%`, background: 'var(--gold-gradient)' }} />
        </div>
        <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const on = i <= active;
            return (
              <li
                key={s.title}
                className={`flex min-h-[170px] flex-col rounded-2xl border border-solid p-6 transition-all duration-500 ${on ? 'border-primary/25 bg-primary-soft' : 'border-line bg-canvas'}`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500 ${on ? 'bg-midnight text-accent-light' : 'bg-white text-muted'}`}
                >
                  {i + 1}
                </span>
                <span className={`mt-5 text-[17px] font-semibold leading-snug transition-colors duration-500 ${on ? 'text-ink' : 'text-ink/45'}`}>{s.title}</span>
                <span className={`mt-2 text-sm leading-relaxed transition-colors duration-500 ${on ? 'text-muted' : 'text-muted/60'}`}>{s.text}</span>
              </li>
            );
          })}
        </ol>
        <Link to="/kenesler" className="group mt-10 inline-flex items-center gap-2 font-medium text-primary no-underline hover:text-midnight">
          Tayarlıq dizimin ashıw <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

/* ───────────────────────── QOLLAW ───────────────────────── */

const SupportBand = () => (
  <section className="container-page py-24">
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border border-solid border-accent/30 bg-accent-soft/60 px-8 py-12 md:px-14">
        <div className="pattern-girih absolute inset-0 opacity-70" aria-hidden />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-6">
            <span className="animate-float hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-accent-deep shadow-card md:flex">
              <Icon name="heart" size={28} strokeWidth={1.5} />
            </span>
            <div>
              <span className="eyebrow !text-accent-deep">Qollaw hár qashan áhmiyetli</span>
              <h2 className="font-serif-title m-0 mt-3 text-3xl font-semibold md:text-4xl">Jańa elde jalǵız emessiz.</h2>
              <p className="mb-0 mt-3 max-w-xl leading-relaxed text-muted">Beyimlesiw, oqıw basımı hám jalǵızlıq boyınsha anonim járdem alıw jolları.</p>
            </div>
          </div>
          <Link to="/jardem" className="btn-dark group shrink-0">
            Járdem haqqında <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Reveal>
  </section>
);

export default function Landing() {
  return (
    <>
      <Hero />
      <ModuleStrip />
      <AdvantagesBand />
      <RolesSection />
      <JourneySection />
      <FeaturedGrants />
      <StepsSection />
      <SupportBand />
    </>
  );
}
