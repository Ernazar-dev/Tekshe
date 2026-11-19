import { SelectField } from '@/components/ui/SelectField';
import { Button, Input, Progress } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge, EmptyHint, Loading, Notice, PageTitle, Panel, StatCard } from '@/components/dashboard/ui';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useChecklist } from '@/lib/checklist';
import { fieldErrorsFrom, formatDate, generalError, useFormState } from '@/lib/form';
import { REQUEST_STATUS } from '@/lib/roles';
import type { StudentStatus } from '@/lib/types';

export function StudentOverview() {
  const { user } = useAuth();
  const panel = useQuery({ queryKey: ['student-panel'], queryFn: api.studentPanel });
  const guides = useQuery({ queryKey: ['guides'], queryFn: api.guides });
  const requests = useQuery({ queryKey: ['my-requests'], queryFn: api.myRequests });

  if (panel.isLoading || guides.isLoading) return <Loading />;
  const total = guides.data?.checklists.reduce((n, s) => n + s.items.length, 0) ?? 0;
  const done = panel.data?.checklist.length ?? 0;
  const mine = requests.data?.data ?? [];
  const answered = mine.filter((r) => r.status === 'answered').length;
  const profile = panel.data?.profile;

  return (
    <>
      <PageTitle title={`Quwanıshlı, ${user?.name.split(' ')[0]}!`} text="Shet elge oqıwǵa tayarlıq, mentorlar hám grantlar — barlıǵı bir jerde." />

      {!profile && (
        <div className="mb-6">
          <Notice tone="info" icon="cap">
            Profilińizdi toltırsańız, sizge <strong>sáykes mentorlar</strong> usınıladı.{' '}
            <Link to="/kabinet/profil" className="font-semibold">
              Profilge ótiw →
            </Link>
          </Notice>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Tayarlıq dizimi" value={`${done}/${total}`} hint="orınlanǵan bántler" icon="checklist" tone="sun" />
        <StatCard label="Sorawlarım" value={mine.length} hint={answered ? `${answered} sorawǵa juwap keldi` : 'mentor hám vakansiyalarǵa'} icon="mail" tone="sky" />
        <StatCard
          label="Profil"
          value={profile ? (profile.status === 'now' ? 'Oqıp atır' : 'Pitkergen') : '—'}
          hint={profile ? `${profile.country}, ${profile.university}` : 'ele toltırılmaǵan'}
          icon="cap"
        />
      </div>

      <div className="mt-6">
        <Progress percent={total ? Math.round((done / total) * 100) : 0} strokeColor={{ '0%': '#1b3768', '100%': '#c29a45' }} size={{ height: 10 }} aria-label="Tayarlıq dizimi" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Sizge sáykes mentorlar"
          action={
            <Link to="/mentorlar" className="text-sm font-semibold text-primary">
              Barlıq mentorlar →
            </Link>
          }
        >
          {panel.data?.recommended.length ? (
            <ul className="m-0 grid list-none gap-4 p-0">
              {panel.data.recommended.map((m) => (
                <li key={m.id} className="flex items-center gap-4 rounded-xl bg-canvas p-4">
                  <span className="font-serif-title flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-midnight font-semibold text-accent-light">{m.initials}</span>
                  <div className="min-w-0">
                    <div className="font-semibold">{m.name}</div>
                    <div className="truncate text-sm text-muted">
                      {m.job} · {m.university}, {m.country}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint icon="compass">
              {profile ? 'Házirshe sizdiń mámleket hám tarawıńız boyınsha mentor tabılmadı.' : 'Profilińizdi toltırıń — mámleket hám taraw boyınsha mentor usınamız.'}
            </EmptyHint>
          )}
        </Panel>

        <Panel title="Tez ótiw">
          <ul className="m-0 grid list-none gap-2 p-0">
            {[
              { to: '/grantlar', label: 'Grantlardı izlew', icon: 'cap' as const },
              { to: '/kabinet/tayarliq', label: 'Tayarlıq dizimin dawam ettiriw', icon: 'checklist' as const },
              { to: '/vakansiyalar', label: 'Vakansiyalardı kóriw', icon: 'briefcase' as const },
              { to: '/jardem', label: 'Psixologiyalıq járdem (anonim)', icon: 'heart' as const },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="group flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-ink no-underline transition-colors hover:bg-canvas">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                    <Icon name={l.icon} size={17} />
                  </span>
                  {l.label}
                  <Icon name="arrowRight" size={15} className="ml-auto text-muted transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

const EMPTY = { status: 'now', country: '', university: '', field: '', grant: '', years: '' };

export function StudentProfile() {
  const queryClient = useQueryClient();
  const panel = useQuery({ queryKey: ['student-panel'], queryFn: api.studentPanel });
  const { values, setValues, set, errors, setErrors } = useFormState<Record<keyof typeof EMPTY, string>>(EMPTY);
  const [saved, setSaved] = useState(false);

  const profile = panel.data?.profile;
  useEffect(() => {
    if (!profile) return;
    setValues({
      status: profile.status,
      country: profile.country,
      university: profile.university,
      field: profile.field,
      grant: profile.grant === 'Kórsetilmegen' ? '' : profile.grant,
      years: profile.years === '—' ? '' : profile.years,
    });
  }, [profile, setValues]);

  const mutation = useMutation({
    mutationFn: api.saveStudent,
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['student-panel'] });
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const errs: typeof errors = {};
    for (const [k, label] of [
      ['country', 'Mámleket'],
      ['university', 'Universitet'],
      ['field', 'Tarawı'],
    ] as const) {
      if (values[k].trim().length < 2) errs[k] = `${label} — keminde 2 belgi`;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({
      status: values.status as StudentStatus,
      country: values.country.trim(),
      university: values.university.trim(),
      field: values.field.trim(),
      grant: values.grant.trim(),
      years: values.years.trim(),
    });
  };

  if (panel.isLoading) return <Loading />;

  return (
    <>
      <PageTitle title="Profilim" text="Oqıw maǵlıwmatlarıńız. Kontaktıńız ashıq kórsetilmeydi — tek ruxsatı bar xızmetker, jurnalǵa jazılıp, kóre aladı." />
      <Panel className="max-w-3xl">
        <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
          <Field label="Status" error={errors.status}>
            <SelectField value={values.status} onChange={set('status')} options={[{ value: 'now', label: 'Oqıp atırman' }, { value: 'back', label: 'Oqıwdı pitkerip qaytqanman' }]} />
          </Field>
          <Field label="Mámleket" error={errors.country}>
            <Input size="large" value={values.country} onChange={set('country')} maxLength={50} />
          </Field>
          <Field label="Universitet" error={errors.university} className="sm:col-span-2">
            <Input size="large" value={values.university} onChange={set('university')} maxLength={100} />
          </Field>
          <Field label="Tarawı" error={errors.field}>
            <Input size="large" value={values.field} onChange={set('field')} maxLength={70} />
          </Field>
          <Field label="Grant" error={errors.grant} hint="Májbúriy emes">
            <Input size="large" value={values.grant} onChange={set('grant')} maxLength={80} />
          </Field>
          <Field label="Oqıw jılları" error={errors.years} hint="Mısalı: 2023–2027" className="sm:col-span-2">
            <Input size="large" value={values.years} onChange={set('years')} maxLength={15} placeholder="2023–2027" />
          </Field>
          {generalError(mutation.error) && (
            <div className="sm:col-span-2">
              <Notice tone="error">{generalError(mutation.error)}</Notice>
            </div>
          )}
          {saved && (
            <div className="sm:col-span-2">
              <Notice tone="success" icon="check">
                Profil saqlandı.
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

export function StudentRequests() {
  const query = useQuery({ queryKey: ['my-requests'], queryFn: api.myRequests });
  const items = query.data?.data ?? [];

  return (
    <>
      <PageTitle title="Sorawlarım" text="Mentorlarǵa jiberilgen sorawlar hám vakansiyalarǵa arzalar. Juwap sol jerde payda boladı." />
      {query.isLoading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Panel>
          <EmptyHint icon="mail">
            Házirshe sorawıńız joq.{' '}
            <Link to="/mentorlar" className="font-semibold text-primary">
              Mentor tabıw →
            </Link>
          </EmptyHint>
        </Panel>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {items.map((r) => (
            <li key={r.id}>
              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                      <Icon name={r.type === 'mentor' ? 'compass' : 'briefcase'} size={18} />
                    </span>
                    <div>
                      <div className="font-semibold">{r.targetTitle}</div>
                      <div className="text-xs text-muted">
                        {r.type === 'mentor' ? 'Mentorǵa soraw' : 'Vakansiyaǵa arza'} · {formatDate(r.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge tone={REQUEST_STATUS[r.status].tone}>{REQUEST_STATUS[r.status].label}</Badge>
                </div>
                <p className="mb-0 mt-4 whitespace-pre-line text-[15px] leading-relaxed">{r.message}</p>
                {r.reply ? (
                  <div className="mt-4 rounded-xl border border-solid border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Juwap · {formatDate(r.updatedAt)}</div>
                    <p className="mb-0 mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-emerald-950">{r.reply}</p>
                  </div>
                ) : (
                  <p className="mb-0 mt-4 text-sm text-muted">Juwap kútilip atır…</p>
                )}
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function StudentChecklist() {
  const guides = useQuery({ queryKey: ['guides'], queryFn: api.guides });
  const { checked, toggle, loading, saveError } = useChecklist();
  const stages = guides.data?.checklists ?? [];

  if (guides.isLoading || loading) return <Loading />;
  const total = stages.reduce((n, s) => n + s.items.length, 0);
  const done = stages.reduce((n, s) => n + s.items.filter((i) => checked[i.id]).length, 0);

  return (
    <>
      <PageTitle title="Tayarlıq dizimi" text="Ketiwden aldın, barǵannan keyin hám elge qaytqanda ne islew kerek. Belgilengenler profilińizde saqlanadı." />
      <div className="mb-6 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full transition-[width] duration-500 ease-premium" style={{ width: `${total ? (done / total) * 100 : 0}%`, background: 'var(--gold-gradient)' }} />
        </div>
        <span className="text-sm font-semibold tabular-nums" role="status">
          {done} / {total}
        </span>
      </div>
      {saveError && (
        <div className="mb-4">
          <Notice tone="error">Saqlawda qáte boldı. Qayta urınıp kóriń.</Notice>
        </div>
      )}
      <div className="grid gap-6">
        {stages.map((s) => (
          <Panel key={s.id} title={s.title}>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {s.items.map((it) => {
                const on = !!checked[it.id];
                return (
                  <li key={it.id}>
                    <label className={`flex cursor-pointer items-start gap-4 rounded-xl p-3.5 transition-colors ${on ? 'bg-primary-soft/60' : 'hover:bg-canvas'}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle(it.id)} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" />
                      <span>
                        <span className={`block text-[16px] font-semibold transition-colors ${on ? 'text-muted line-through decoration-accent/60' : ''}`}>{it.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-muted">{it.description}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}
