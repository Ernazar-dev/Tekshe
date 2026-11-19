import { useState } from 'react';
import { ApiError } from './api';

/** Serverdiń maydan qáteleri ({ maydan: [xabar] }) → { maydan: xabar } */
export const fieldErrorsFrom = (err: unknown): Record<string, string> =>
  err instanceof ApiError ? Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0] ?? ''])) : {};

/** Maydanǵa baylanıspaǵan ulıwma qáte xabarı (tarmaq, 403, 429 h.t.b.); maydan qátesi bolsa — null */
export const generalError = (err: unknown): string | null => {
  if (!err) return null;
  if (err instanceof ApiError) return Object.keys(err.fieldErrors).length ? null : err.message;
  return err instanceof Error ? err.message : 'Kútilmegen qáte';
};

/** Forma mánisleri hám qátelerin saqlaydı; maydan ózgergende sol maydannıń qátesi óshiriledi */
export const useFormState = <T extends Record<string, string>>(initial: T) => {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const set = (k: keyof T) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((er) => (er[k] ? { ...er, [k]: undefined } : er));
  };
  return { values, setValues, errors, setErrors, set };
};

/** «a, b , c» → ['a','b','c'] */
export const splitList = (text: string) =>
  text
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** 2026-11-19T13:58:06Z → 19.11.2026 18:58 */
export const formatDate = (iso: string, withTime = true) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const p = (n: number) => String(n).padStart(2, '0');
  const date = `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
  return withTime ? `${date} ${p(d.getHours())}:${p(d.getMinutes())}` : date;
};
