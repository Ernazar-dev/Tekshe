import type { ReactNode } from 'react';

/** Ishki betlerdiń sarlawhası: altın sızıq + eyebrow + serif sarlawha */
export const PageHeader = ({ eyebrow, title, text, actions }: { eyebrow: string; title: string; text?: string; actions?: ReactNode }) => (
  <header className="flex flex-wrap items-end justify-between gap-6 pb-6 pt-8 md:pt-10">
    <div className="max-w-3xl">
      <div className="flex items-center gap-4">
        <span className="animate-line-grow h-px w-10 bg-accent" aria-hidden />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h1 className="font-serif-title m-0 mt-4 text-4xl font-semibold leading-[1.08] md:text-[48px]">{title}</h1>
      {text && <p className="mb-0 mt-4 max-w-prose text-[16px] leading-relaxed text-muted">{text}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </header>
);
