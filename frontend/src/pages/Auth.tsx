import { Button, Input } from 'antd';
import { LOGIN_HINT, LOGIN_RE } from '@/lib/login';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';
import { fieldErrorsFrom, generalError, useFormState } from '@/lib/form';
import { ROLES, SIGNUP_ROLES } from '@/lib/roles';
import type { RegisterInput } from '@/lib/types';

/** Kiriw hám dizimnen ótiw betleri ushın ulıwma qabıq: shepte — súwret, ońda — forma */
const AuthShell = ({ title, text, children }: { title: string; text: string; children: ReactNode }) => (
  <div className="grid min-h-[calc(100dvh-72px)] lg:grid-cols-[1fr_1.1fr]">
    <aside className="grain relative hidden overflow-hidden bg-midnight lg:block">
      <img src="/hero-1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-midnight/30" aria-hidden />
      <div className="pattern-girih absolute inset-0 opacity-40" aria-hidden />
      <div className="relative flex h-full flex-col justify-end p-12 text-white">
        <span className="h-px w-12 bg-accent" aria-hidden />
        <h2 className="font-serif-title m-0 mt-6 max-w-md text-4xl font-semibold leading-tight">
          Bilim menen <span className="font-normal italic text-accent-light">baylanǵan jámáát.</span>
        </h2>
        <p className="mb-0 mt-4 max-w-md leading-relaxed text-white/70">Grant, mentor, jumıs hám qollaw — Qaraqalpaqstan jasları ushın bir platformada.</p>
      </div>
    </aside>
    <section className="flex items-center justify-center px-4 py-10 md:px-10">
      <div className="w-full max-w-[460px]">
        <h1 className="font-serif-title m-0 text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="mb-8 mt-2 leading-relaxed text-muted">{text}</p>
        {children}
      </div>
    </section>
  </div>
);

const useReturnTo = () => {
  const location = useLocation();
  return (location.state as { from?: string } | null)?.from ?? '/kabinet';
};

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const returnTo = useReturnTo();
  const { values, set, errors, setErrors } = useFormState({ login: '', password: '' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to={returnTo} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const errs: typeof errors = {};
    if (!values.login.trim()) errs.login = 'Login kiritiń';
    if (!values.password) errs.password = 'Parol kiritiń';
    setErrors(errs);
    setError(null);
    if (Object.keys(errs).length) return;
    setPending(true);
    try {
      await login(values.login.trim(), values.password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      setError(generalError(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell title="Sistemaǵa kiriw" text="Login hám parolıńız menen kiriń.">
      <form onSubmit={submit} noValidate className="grid gap-5">
        <Field label="Login" error={errors.login}>
          <Input size="large" autoComplete="username" autoCapitalize="none" spellCheck={false} value={values.login} onChange={set('login')} maxLength={32} />
        </Field>
        <Field label="Parol" error={errors.password}>
          <Input.Password size="large" autoComplete="current-password" value={values.password} onChange={set('password')} />
        </Field>
        {error && (
          <p className="m-0 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <Button type="primary" size="large" htmlType="submit" loading={pending} className="!inline-flex !items-center !gap-2">
          {pending ? 'Tekserilip atır…' : 'Kiriw'}
          {!pending && <Icon name="arrowRight" size={17} />}
        </Button>
        <p className="m-0 text-center text-sm text-muted">
          Akkauntıńız joq pa?{' '}
          <Link to="/dizimnen-otiw" className="font-semibold text-primary">
            Dizimnen ótiw
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = SIGNUP_ROLES.find((r) => r === params.get('rol')) ?? 'student';
  const [role, setRole] = useState<RegisterInput['role']>(initialRole);
  const { values, set, errors, setErrors } = useFormState({ name: '', login: '', phone: '', password: '' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/kabinet" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const errs: typeof errors = {};
    if (values.name.trim().length < 2) errs.name = 'Atıńız — keminde 2 belgi';
    if (!LOGIN_RE.test(values.login.trim().toLowerCase())) errs.login = LOGIN_HINT;
    if (values.password.length < 8) errs.password = 'Parol keminde 8 belgi';
    setErrors(errs);
    setError(null);
    if (Object.keys(errs).length) return;
    setPending(true);
    try {
      await register({ name: values.name.trim(), login: values.login.trim(), phone: values.phone.trim(), password: values.password, role });
      navigate('/kabinet', { replace: true });
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      setError(generalError(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell title="Dizimnen ótiw" text="Ózińizge sáykes rolni tańlań — hár rol ushın óz paneli bar.">
      <form onSubmit={submit} noValidate className="grid gap-5">
        <fieldset className="m-0 grid gap-2 border-0 p-0">
          <legend className="mb-2 p-0 text-[13px] font-medium">Men kimmen?</legend>
          {SIGNUP_ROLES.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border border-solid p-4 transition-all duration-300 ease-premium focus-within:ring-2 focus-within:ring-accent ${
                role === r ? 'border-midnight bg-white shadow-card' : 'border-line bg-white/60 hover:border-accent/60'
              }`}
            >
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-solid ${
                  role === r ? 'border-midnight bg-midnight text-accent-light' : 'border-accent/40 text-accent-deep'
                }`}
              >
                <Icon name={ROLES[r].icon} size={20} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold">{ROLES[r].label}</span>
                <span className="block text-[13px] leading-snug text-muted">{ROLES[r].brief}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Field label={role === 'employer' ? 'Juwapkershi shaxstıń atı-familiyası' : 'Atı-familiyańız'} error={errors.name}>
          <Input size="large" autoComplete="name" value={values.name} onChange={set('name')} maxLength={80} />
        </Field>
        <Field label="Login" error={errors.login}>
          <Input size="large" autoComplete="username" autoCapitalize="none" spellCheck={false} value={values.login} onChange={set('login')} maxLength={32} />
        </Field>
        <Field label="Telefon" error={errors.phone} hint="Májbúriy emes. Ashıq kórsetilmeydi.">
          <Input size="large" type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} maxLength={20} />
        </Field>
        <Field label="Parol" error={errors.password} hint="Keminde 8 belgi">
          <Input.Password size="large" autoComplete="new-password" value={values.password} onChange={set('password')} maxLength={100} />
        </Field>

        {role !== 'student' && (
          <p className="m-0 rounded-xl bg-accent-soft px-4 py-3 text-[13px] leading-relaxed text-accent-deep">
            {role === 'mentor'
              ? 'Mentordıń diplomın xızmetker tekseredi. Tastıyıqlanǵansha profilińiz ashıq dizimde kórinbeydi.'
              : 'Kárxana STIR boyınsha tekseriledi. Hár vakansiya jariyalanıwdan aldın moderatordan ótedi.'}
          </p>
        )}
        {error && (
          <p className="m-0 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <Button type="primary" size="large" htmlType="submit" loading={pending} className="!inline-flex !items-center !gap-2">
          {pending ? 'Jaratılıp atır…' : 'Akkaunt jaratıw'}
          {!pending && <Icon name="arrowRight" size={17} />}
        </Button>
        <p className="m-0 text-center text-sm text-muted">
          Akkauntıńız bar ma?{' '}
          <Link to="/kirish" className="font-semibold text-primary">
            Kiriw
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
