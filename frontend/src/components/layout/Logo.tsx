import { Link } from 'react-router-dom';
import mark from '@/assets/tekshe-mark.png';

/**
 * TEKSHE logotipi: belgisi (shapka + basqıshlar) logotip faylınan, jazıwı serif shriftte.
 * Ashıq fondaǵı súwret `mix-blend-multiply` arqalı fonǵa sińedi; qarańǵı fonda pil súyegi plitkada turadı.
 */
export const Logo = ({ dark = false }: { dark?: boolean }) => (
  <Link to="/" className="group flex shrink-0 items-center gap-3 no-underline" aria-label="TEKSHE — bas bet">
    <span className={`flex h-11 w-14 items-center justify-center overflow-hidden ${dark ? 'rounded-lg bg-[#fcfcf4] px-1' : ''}`}>
      <img
        src={mark}
        alt=""
        width={56}
        height={33}
        className={`h-auto w-full transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 ${dark ? '' : 'mix-blend-multiply'}`}
      />
    </span>
    <span className="leading-none">
      <span className={`font-serif-title block text-[22px] font-bold tracking-[0.12em] ${dark ? 'text-white' : 'text-midnight'}`}>TEKSHE</span>
      <span className={`mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-accent-light' : 'text-accent-deep'}`}>
        Shet eldegi studentler
      </span>
    </span>
  </Link>
);
