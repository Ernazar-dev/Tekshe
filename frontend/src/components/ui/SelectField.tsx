import { Select } from 'antd';

export type SelectOption = string | { value: string; label: string };

/**
 * Ant Design Select. onChange eski «event» ko'rinisinde beredi ({ target: { value } }),
 * sonlıqtan useFormState().set(...) menen tuwrıdan-tuwrı isleydi.
 */
export const SelectField = ({
  value,
  onChange,
  options,
  id,
  searchable = false,
  'aria-invalid': ariaInvalid,
}: {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: SelectOption[];
  id?: string;
  searchable?: boolean;
  'aria-invalid'?: boolean;
}) => (
  <Select
    id={id}
    aria-invalid={ariaInvalid}
    size="large"
    className="w-full"
    value={value}
    showSearch={searchable ? { optionFilterProp: 'label' } : false}
    onChange={(v: string) => onChange({ target: { value: v } })}
    options={options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))}
  />
);
