import { cloneElement, useId, type ReactElement } from 'react';

/** Label + maydan + qáte xabarı. Maydan aria atributların avtomat aladı. */
export const Field = ({
  label,
  error,
  hint,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactElement;
  className?: string;
}) => {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        // Ant Design maydanları uchın qızıl shegara (DOM elementke berilmeydi)
        ...(error && typeof children.type !== 'string' ? { status: 'error' } : {}),
        'aria-describedby': error || hint ? msgId : undefined,
      })}
      {(error || hint) && (
        <span id={msgId} className={`text-[12.5px] ${error ? 'text-red-700' : 'text-muted'}`} role={error ? 'alert' : undefined}>
          {error || hint}
        </span>
      )}
    </div>
  );
};
