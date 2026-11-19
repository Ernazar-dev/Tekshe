import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';
import { Logo } from './Logo';
import { NAV } from './nav';

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Bet almasqanda mobil menyu jabıladı
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-0 border-b border-solid transition-all duration-500 ease-premium ${
        scrolled || open ? 'border-line bg-canvas/85 shadow-[0_8px_30px_-20px_rgba(11, 21, 48,0.25)] backdrop-blur-xl' : 'border-transparent bg-canvas'
      }`}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-card"
      >
        Mazmunǵa ótiw
      </a>
      <div className="container-page flex h-[72px] items-center gap-6 xl:gap-8">
        <Logo />
        <nav aria-label="Tiykarǵı menyu" className="ml-auto hidden items-center gap-5 xl:gap-7 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `link-underline text-[14px] font-medium no-underline transition-colors ${isActive ? 'active text-midnight' : 'text-ink/75 hover:text-midnight'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Kirish / Kabinet tugmasi */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link to="/kabinet" className="btn-dark group !min-h-[42px] !px-5 !text-sm inline-flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-accent-light">
                <Icon name="user" size={13} />
              </span>
              <span>Kabinet</span>
              <Icon name="arrowRight" size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/dizimnen-otiw" className="link-underline hidden text-[13.5px] font-medium text-ink/75 no-underline hover:text-midnight xl:inline-block px-1">
                Dizimnen ótiw
              </Link>
              <Link to="/kirish" className="btn-dark group !min-h-[42px] !px-5 !text-sm inline-flex items-center gap-2">
                <span>Kirish</span>
                <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-solid border-line bg-white text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Menyunı jabıw' : 'Menyunı ashıw'}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobil menyu" className="animate-fade-in border-0 border-t border-solid border-line lg:hidden">
          <ul className="container-page m-0 grid list-none gap-1 py-4">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-xl px-3 py-3 no-underline transition-colors ${isActive ? 'bg-white text-midnight shadow-card' : 'text-ink hover:bg-white'}`
                  }
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-solid border-accent/40 text-accent-deep">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold">{item.label}</span>
                    <span className="block text-[12.5px] text-muted">{item.brief}</span>
                  </span>
                </NavLink>
              </li>
            ))}

            {/* Mobil menyuda Kirish / Kabinet */}
            {user ? (
              <li className="pt-3 mt-2 border-0 border-t border-solid border-line">
                <NavLink
                  to="/kabinet"
                  className="flex items-center gap-4 rounded-xl p-3 bg-midnight text-white no-underline shadow-card"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent-light">
                    <Icon name="user" size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold truncate">Kabinet ({user.name})</span>
                    <span className="block text-[12px] text-white/70">Jeke kabinetke ótiw</span>
                  </span>
                </NavLink>
              </li>
            ) : (
              <li className="grid grid-cols-2 gap-2 pt-3 mt-2 border-0 border-t border-solid border-line">
                <NavLink
                  to="/kirish"
                  className="btn-dark !min-h-[42px] !text-sm flex items-center justify-center gap-2 no-underline"
                >
                  <span>Kirish</span>
                  <Icon name="arrowRight" size={16} />
                </NavLink>
                <NavLink
                  to="/dizimnen-otiw"
                  className="btn-outline !min-h-[42px] !text-sm flex items-center justify-center no-underline"
                >
                  Dizimnen ótiw
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};
