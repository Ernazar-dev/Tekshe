import { Button, Input } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge, EmptyHint, Loading, Notice, PageTitle, Panel, StatCard } from '@/components/dashboard/ui';
import { Field } from '@/components/ui/Field';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fieldErrorsFrom, formatDate, generalError, splitList, useFormState } from '@/lib/form';
import { USER_STATUS } from '@/lib/roles';

export function MentorOverview() {
  const { user } = useAuth();
  const profile = useQuery({ queryKey: ['mentor-profile'], queryFn: api.mentorProfile });
  const inbox = useQuery({ queryKey: ['inbox'], queryFn: api.inbox });

  if (profile.isLoading || inbox.isLoading) return <Loading />;
  const items = inbox.data?.data ?? [];
  const fresh = items.filter((r) => r.status === 'new');
  const active = user?.status === 'active';

  return (
    <>
      <PageTitle title={`Xosh kelipsiz, ${user?.name.split(' ')[0]}!`} text="Tájiriybeńiz — keyingi studentler ushın jol. Sorawlarǵa juwap beriń hám profilińizdi jańalap turıń." />

      {!profile.data?.profile && (
        <div className="mb-6">
          <Notice tone="info" icon="compass">
            Mentor profilińiz ele toltırılmaǵan.{' '}
            <Link to="/kabinet/profil" className="font-semibold">
              Profildi toltırıw →
            </Link>
          </Notice>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Jańa sorawlar" value={fresh.length} hint="juwap kútip atır" icon="inbox" tone="coral" />
        <StatCard label="Barlıq sorawlar" value={items.length} hint={`${items.filter((r) => r.status === 'answered').length} sorawǵa juwap berildi`} icon="mail" tone="sky" />
        <StatCard label="Profil" value={active ? 'Ashıq' : 'Tekseriwde'} hint={active ? 'ashıq dizimde kórinedi' : 'diplom tekserilip atır'} icon="verified" tone="mint" />
      </div>

      <Panel
        className="mt-8"
        title="Aqırǵı sorawlar"
        action={
          <Link to="/kabinet/sorawlar" className="text-sm font-semibold text-primary">
            Barlıǵı →
          </Link>
        }
      >
        {items.length === 0 ? (
          <EmptyHint icon="inbox">Házirshe sorawlar kelmegen. Profilińiz tastıyıqlanǵannan keyin studentler sizge jaza aladı.</EmptyHint>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {items.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 rounded-xl bg-canvas p-4">
                <div className="min-w-0">
                  <div className="font-semibold">{r.name}</div>
                  <p className="m-0 line-clamp-2 text-sm text-muted">{r.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">{formatDate(r.createdAt, false)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

const EMPTY = { job: '', university: '', country: '', year: '', topics: '', languages: '', bio: '' };

export function MentorProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['mentor-profile'], queryFn: api.mentorProfile });
  const { values, setValues, set, errors, setErrors } = useFormState<Record<keyof typeof EMPTY, string>>(EMPTY);
  const [saved, setSaved] = useState(false);

  const profile = query.data?.profile;
  useEffect(() => {
    if (!profile) return;
    setValues({
      job: profile.job,
      university: profile.university,
      country: profile.country,
      year: String(profile.year),
      topics: profile.topics.join(', '),
      languages: profile.languages.join(', '),
      bio: profile.bio,
    });
  }, [profile, setValues]);

  const mutation = useMutation({
    mutationFn: api.saveMentor,
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['mentor-profile'] });
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const errs: typeof errors = {};
    for (const [k, label] of [
      ['job', 'Kásip'],
      ['university', 'Universitet'],
      ['country', 'Mámleket'],
    ] as const) {
      if (values[k].trim().length < 2) errs[k] = `${label} — keminde 2 belgi`;
    }
    const year = Number(values.year);
    if (!Number.isInteger(year) || year < 1950 || year > 2100) errs.year = 'Pitkergen jılıńızdı kiritiń (mısalı 2021)';
    if (!splitList(values.topics).length) errs.topics = 'Keminde bir tema kiritiń (útir menen ajıratıń)';
    if (!splitList(values.languages).length) errs.languages = 'Keminde bir til kiritiń';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({
      job: values.job.trim(),
      university: values.university.trim(),
      country: values.country.trim(),
      year,
      topics: splitList(values.topics),
      languages: splitList(values.languages),
      bio: values.bio.trim(),
    });
  };

  if (query.isLoading) return <Loading />;
  const status = user ? USER_STATUS[user.status] : null;

  return (
    <>
      <PageTitle
        title="Mentor profili"
        text="Bul maǵlıwmat ashıq mentorlar dizimde kórinedi. Telefon hám login kórsetilmeydi — studentler sizge tek platforma arqalı jazadı."
        actions={status && <Badge tone={status.tone}>{status.label}</Badge>}
      />
      <Panel className="max-w-3xl">
        <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
          <Field label="Kásibińiz" error={errors.job}>
            <Input size="large" value={values.job} onChange={set('job')} maxLength={80} placeholder="Injener, shıpaker, programmist…" />
          </Field>
          <Field label="Pitkergen jılıńız" error={errors.year}>
            <Input size="large" value={values.year} onChange={set('year')} inputMode="numeric" maxLength={4} placeholder="2021" />
          </Field>
          <Field label="Pitkergen universitet" error={errors.university}>
            <Input size="large" value={values.university} onChange={set('university')} maxLength={100} />
          </Field>
          <Field label="Mámleket" error={errors.country}>
            <Input size="large" value={values.country} onChange={set('country')} maxLength={50} />
          </Field>
          <Field label="Qaysı temalarda járdem bere alasız" error={errors.topics} hint="Útir menen ajıratıń: DAAD, Hújjet tapsırıw, IT" className="sm:col-span-2">
            <Input size="large" value={values.topics} onChange={set('topics')} />
          </Field>
          <Field label="Tiller" error={errors.languages} hint="Mısalı: qaraqalpaq, ózbek, inglis" className="sm:col-span-2">
            <Input size="large" value={values.languages} onChange={set('languages')} />
          </Field>
          <Field label="Ózińiz haqqında" error={errors.bio} hint="Májbúriy emes, kóbi menen 500 belgi" className="sm:col-span-2">
            <Input.TextArea rows={4} showCount value={values.bio} onChange={set('bio')} maxLength={500} />
          </Field>
          {generalError(mutation.error) && (
            <div className="sm:col-span-2">
              <Notice tone="error">{generalError(mutation.error)}</Notice>
            </div>
          )}
          {saved && (
            <div className="sm:col-span-2">
              <Notice tone="success" icon="check">
                Profil saqlandı.{user?.status === 'pending' && ' Xızmetker diplomıńızdı tekserip, profilińizdi ashıq dizimge shıǵaradı.'}
              </Notice>
            </div>
          )}
          <Button type="primary" size="large" htmlType="submit" loading={mutation.isPending} className="!inline-flex !items-center !gap-2 sm:col-span-2 sm:justify-self-start">
            {mutation.isPending ? 'Saqlanıp atır…' : 'Saqlaw'}
          </Button>
        </form>
      </Panel>
    </>
  );
}
