export interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Bir tańlawlı filtr túymeleri (aria-pressed) */
export const FilterChips = <T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
    {options.map((o) => {
      const on = o.value === value;
      return (
        <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(o.value)} className={on ? 'chip-on' : 'chip-off'}>
          {o.label}
          {o.count !== undefined && <span className={on ? 'text-white/70' : 'text-muted'}>{o.count}</span>}
        </button>
      );
    })}
  </div>
);
