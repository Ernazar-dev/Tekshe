import { Button, Input } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Badge, Notice, PageTitle, Panel } from '@/components/dashboard/ui';
import { Field } from '@/components/ui/Field';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fieldErrorsFrom, generalError, useFormState } from '@/lib/form';
import { ROLES, USER_STATUS } from '@/lib/roles';

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const { values, set, errors, setErrors } = useFormState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [saved, setSaved] = useState(false);
  const mutation = useMutation({
    mutationFn: api.updateMe,
    onSuccess: (u) => {
      setUser(u);
      setSaved(true);
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const errs: typeof errors = {};
    if (values.name.trim().length < 2) errs.name = 'Atıńız — keminde 2 belgi';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({ name: values.name.trim(), phone: values.phone.trim() });
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <Field label="Atı-familiyası" error={errors.name}>
        <Input size="large" value={values.name} onChange={set('name')} maxLength={80} />
      </Field>
      <Field label="Login" hint="Login ózgertilmeydi">
        <Input size="large" value={user?.login ?? ''} disabled readOnly />
      </Field>
      <Field label="Telefon" error={errors.phone} hint="Ashıq kórsetilmeydi">
        <Input size="large" type="tel" value={values.phone} onChange={set('phone')} maxLength={20} />
      </Field>
      {generalError(mutation.error) && <Notice tone="error">{generalError(mutation.error)}</Notice>}
      {saved && (
        <Notice tone="success" icon="check">
          Maǵlıwmatlar saqlandı.
        </Notice>
      )}
      <Button type="primary" size="large" htmlType="submit" loading={mutation.isPending} className="!inline-flex !items-center !gap-2 justify-self-start">
        {mutation.isPending ? 'Saqlanıp atır…' : 'Saqlaw'}
      </Button>
    </form>
  );
};

const PasswordForm = () => {
  const { values, setValues, set, errors, setErrors } = useFormState({ current: '', next: '' });
  const [saved, setSaved] = useState(false);
  const mutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      setSaved(true);
      setValues({ current: '', next: '' });
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const errs: typeof errors = {};
    if (!values.current) errs.current = 'Házirgi paroldı kiritiń';
    if (values.next.length < 8) errs.next = 'Jańa parol keminde 8 belgi';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate(values);
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <Field label="Házirgi parol" error={errors.current}>
        <Input.Password size="large" autoComplete="current-password" value={values.current} onChange={set('current')} />
      </Field>
      <Field label="Jańa parol" error={errors.next} hint="Keminde 8 belgi">
        <Input.Password size="large" autoComplete="new-password" value={values.next} onChange={set('next')} maxLength={100} />
      </Field>
      {generalError(mutation.error) && <Notice tone="error">{generalError(mutation.error)}</Notice>}
      {saved && (
        <Notice tone="success" icon="check">
          Parol ózgertildi.
        </Notice>
      )}
      <Button size="large" htmlType="submit" loading={mutation.isPending} className="!inline-flex !items-center !gap-2 justify-self-start">
        {mutation.isPending ? 'Saqlanıp atır…' : 'Paroldı ózgertiw'}
      </Button>
    </form>
  );
};

export function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <PageTitle
        title="Akkaunt"
        text="Jeke maǵlıwmatlarıńız hám parol."
        actions={
          <>
            <Badge tone="info">{ROLES[user.role].label}</Badge>
            <Badge tone={USER_STATUS[user.status].tone}>{USER_STATUS[user.status].label}</Badge>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Jeke maǵlıwmatlar">
          <ProfileForm />
        </Panel>
        <Panel title="Parol">
          <PasswordForm />
        </Panel>
      </div>
    </>
  );
}
