import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-serif-title text-gold-gradient text-[120px] font-semibold leading-none">404</span>
      <h1 className="font-serif-title m-0 mt-4 text-3xl font-semibold">Bet tabılmadı</h1>
      <p className="mb-8 mt-3 max-w-md text-muted">Siz izlegen bet joq yamasa basqa mánzilge kóshirilgen.</p>
      <Link to="/" className="btn-dark">
        Bas betke qaytıw <Icon name="arrowRight" size={16} />
      </Link>
    </div>
  );
}
