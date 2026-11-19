import type { Config } from 'tailwindcss';
import { palette as p } from './src/lib/palette';

/**
 * Dizayn tokenlari: «sochniy akademiya» — tereń indigo + elektr indigo + shafran altın + lavanda fon.
 * Reńler TEKSHE logotipinen alınǵan.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: { DEFAULT: p.midnight, soft: p.midnightSoft },
        primary: { DEFAULT: p.primary, hover: p.primaryHover, soft: p.primarySoft },
        accent: { DEFAULT: p.accent, light: p.accentLight, soft: p.accentSoft, deep: p.accentDeep },
        mint: { DEFAULT: p.mint, soft: p.mintSoft },
        coral: { DEFAULT: p.coral, soft: p.coralSoft },
        sky: { DEFAULT: p.sky, soft: p.skySoft },
        ink: p.ink,
        muted: p.muted,
        line: p.line,
        canvas: p.canvas,
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,17,63,0.05), 0 10px 28px -14px rgba(91,61,245,0.22)',
        lift: '0 2px 4px rgba(20,17,63,0.06), 0 26px 50px -18px rgba(91,61,245,0.38)',
      },
      transitionTimingFunction: { premium: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      maxWidth: { prose: '68ch' },
    },
  },
  plugins: [],
} satisfies Config;
