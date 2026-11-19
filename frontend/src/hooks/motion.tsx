import { Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType, type MouseEvent, type ReactNode } from 'react';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Element kóriniw maydanına kirgenin baqlaydı (bir ret) */
export const useInView = <T extends Element>(threshold = 0.15) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
};

/** Scroll etilgende áste payda bolatuǵın blok */
export const Reveal = ({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
};

/** Sarlawhanı sózbe-sóz kóteredi */
export const SplitWords = ({ text, delay = 0, step = 70 }: { text: string; delay?: number; step?: number }) => (
  <span aria-label={text}>
    {text.split(' ').map((w, i, all) => (
      <Fragment key={`${w}-${i}`}>
        <span className="word-reveal" aria-hidden>
          <span style={{ animationDelay: `${delay + i * step}ms` }}>{w}</span>
        </span>
        {i < all.length - 1 && ' '}
      </Fragment>
    ))}
  </span>
);

/** Sandı 0-den mánisine shekem sanap shıǵadı (kóringende) */
export const CountUp = ({ value, duration = 1400 }: { value: number; duration?: number }) => {
  const { ref, inView } = useInView<HTMLSpanElement>(0.3);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  return <span ref={ref}>{n}</span>;
};

/** Kursor ornın CSS ózgeriwshilerine jazadı (.spotlight effekti ushın) */
export const spotlightHandler = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

/** Mánisti keshigip jańalaydı (izlew maydanı ushın) */
export const useDebounced = <T,>(value: T, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};
