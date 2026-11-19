import type { ReactNode } from 'react';
import { Icon } from './Icon';

/** Júkleniw / qáte / bos halatları — barlıq dizimler ushın birdey */
export const QueryState = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyText = 'Hesh nárse tabılmadı. Filtrdi ózgertip kóriń.',
  skeleton = 3,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyText?: string;
  skeleton?: number;
  children: ReactNode;
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Júklenip atır">
        {Array.from({ length: skeleton }, (_, i) => (
          <div key={i} className="card h-48 animate-pulse bg-gradient-to-br from-white to-canvas" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center" role="alert">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
          <Icon name="alert" />
        </span>
        <p className="m-0 max-w-md text-muted">{error instanceof Error ? error.message : 'Maǵlıwmattı júklewde qáte boldı.'}</p>
        {onRetry && (
          <button type="button" className="btn-outline" onClick={onRetry}>
            Qayta urınıw
          </button>
        )}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
          <Icon name="search" />
        </span>
        <p className="m-0 text-muted">{emptyText}</p>
      </div>
    );
  }
  return <>{children}</>;
};
