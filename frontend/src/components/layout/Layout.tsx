import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true" aria-label="Júklenip atır">
    <span className="h-10 w-10 animate-spin rounded-full border-2 border-solid border-accent/25 border-t-accent" />
  </div>
);

export const Layout = () => {
  const { pathname, hash } = useLocation();

  // Jańa bet joqarıdan ashıladı; #anchor bolsa — sol bólimge
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }));
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />
      <main id="content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageLoader />}>
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};
