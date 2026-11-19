import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';
import { NAV } from './nav';

const linkCls = 'text-white/60 no-underline transition-colors duration-200 hover:text-accent-light';

const COLUMNS = [
  { title: 'Platforma', links: NAV.slice(0, 3) },
  { title: 'Jámáát', links: NAV.slice(3) },
];

export const Footer = () => (
  <footer className="relative overflow-hidden bg-midnight text-white">
    <div className="gold-rule" aria-hidden />
    <div className="pattern-girih pointer-events-none absolute inset-0 opacity-40" aria-hidden />
    <div className="container-page relative pb-8 pt-14">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mb-0 mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            Qaraqalpaqstan jasları ushın grantlar, mentorlar hám shet elde oqıw boyınsha birlesken platforma. Bilim menen baylanǵan jámáát.
          </p>
          <Link
            to="/mentorlar#mentor-boliw"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent no-underline hover:text-accent-light"
          >
            Mentor bolıw <Icon name="arrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{col.title}</div>
            <ul className="m-0 list-none space-y-3 p-0 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mt-12 flex flex-col gap-2 border-0 border-t border-solid border-white/10 pt-6 text-xs text-white/45 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} TEKSHE · Shet eldegi studentler</span>
        <span>Mentor, student hám kárxana atları — úlgi maǵlıwmat.</span>
      </div>
    </div>
  </footer>
);
