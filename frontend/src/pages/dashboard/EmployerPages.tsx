import { SelectField } from '@/components/ui/SelectField';
import { Button, Input } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge, EmptyHint, Loading, MiniButton, Notice, PageTitle, Panel, StatCard } from '@/components/dashboard/ui';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fieldErrorsFrom, formatDate, generalError, useFormState } from '@/lib/form';
import { USER_STATUS, VACANCY_STATUS } from '@/lib/roles';
import type { OwnVacancy } from '@/lib/types';

export function EmployerOverview() {
  const { user } = useAuth();
  const company = useQuery({ queryKey: ['company'], queryFn: api.company });
  const vacancies = useQuery({ queryKey: ['own-vacancies'], queryFn: api.ownVacancies });
  const inbox = useQuery({ queryKey: ['inbox'], queryFn: api.inbox });

  if (company.isLoading || vacancies.isLoading) return <Loading />;
  const list = vacancies.data?.data ?? [];
  const fresh = (inbox.data?.data ?? []).filter((r) => r.status === 'new').length;
  const live = user?.status === 'active' ? list.filter((v) => v.status === 'approved').length : 0;

  return (
    <>
      <PageTitle title={company.data?.company?.name ?? `Xosh kelipsiz, ${user?.name.split(' ')[0]}!`} text="Shet elde bilim alıp qaytqan qánigelerdi tabıń: vakansiya jariyalań, arzalarǵa juwap beriń." />

      {!company.data?.company && (
        <div className="mb-6">
          <Notice tone="info" icon="building">
            Aldın kárxana maǵlıwmatın (atı, qala, STIR) toltırıń — usıdan keyin vakansiya jariyalaw múmkin.{' '}
            <Link to="/kabinet/profil" className="font-semibold">
              Kárxanaǵa ótiw →
            </Link>
          </Notice>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Ashıq vakansiyalar" value={live} hint={`${list.length} vakansiyadan`} icon="briefcase" tone="mint" />
        <StatCard label="Tekseriwde" value={list.filter((v) => v.status === 'pending').length} hint="moderator tekseredi" icon="clock" tone="sun" />
        <StatCard label="Jańa arzalar" value={fresh} hint="juwap kútip atır" icon="inbox" tone="coral" />
      </div>

      <Panel
        className="mt-8"
        title="Vakansiyalarım"
        action={
          <Link to="/kabinet/vakansiyalar" className="text-sm font-semibold text-primary">
            Basqarıw →
          </Link>
        }
      >
        {list.length === 0 ? (
          <EmptyHint icon="briefcase">Házirshe vakansiya jariyalamadıńız.</EmptyHint>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {list.slice(0, 4).map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-canvas p-4">
                <div>
                  <div className="font-semibold">{v.title}</div>
                  <div className="text-sm text-muted">
                    {v.city} · {v.type} · {v.applications} arza
                  </div>
                </div>
                <Badge tone={VACANCY_STATUS[v.status].tone}>{VACANCY_STATUS[v.status].label}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

const EMPTY_COMPANY = { name: '', city: '', stir: '', about: '' };

export function CompanyPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['company'], queryFn: api.company });
  const { values, setValues, set, errors, setErrors } = useFormState<Record<keyof typeof EMPTY_COMPANY, string>>(EMPTY_COMPANY);
  const [saved, setSaved] = useState(false);

  const company = query.data?.company;
  useEffect(() => {
    if (company) setValues({ name: company.name, city: company.city, stir: company.stir, about: company.about });
  }, [company, setValues]);

  const mutation = useMutation({
    mutationFn: api.saveCompany,
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['own-vacancies'] });
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const errs: typeof errors = {};
    if (values.name.trim().length < 2) errs.name = 'Kárxana atı — keminde 2 belgi';
    if (values.city.trim().length < 2) errs.city = 'Qala — keminde 2 belgi';
    if (!/^\d{9}$/.test(values.stir.trim())) errs.stir = 'STIR — 9 san';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({ name: values.name.trim(), city: values.city.trim(), stir: values.stir.trim(), about: values.about.trim() });
  };

  if (query.isLoading) return <Loading />;
  const status = user ? USER_STATUS[user.status] : null;

  return (
    <>
      <PageTitle
        title="Kárxana"
        text="Kárxana STIR hám guwalıǵı boyınsha tekseriledi. Tastıyıqlanǵannan keyin vakansiyalarıńız ashıq dizimde kórinedi."
        actions={status && <Badge tone={status.tone}>{status.label}</Badge>}
      />
      <Panel className="max-w-3xl">
        <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
          <Field label="Kárxana atı" error={errors.name} className="sm:col-span-2">
            <Input size="large" value={values.name} onChange={set('name')} maxLength={80} />
          </Field>
          <Field label="Qala" error={errors.city}>
            <Input size="large" value={values.city} onChange={set('city')} maxLength={50} />
          </Field>
          <Field label="STIR" error={errors.stir} hint="9 sannan ibarat">
            <Input size="large" value={values.stir} onChange={set('stir')} inputMode="numeric" maxLength={9} />
          </Field>
          <Field label="Kárxana haqqında" error={errors.about} hint="Májbúriy emes, kóbi menen 500 belgi" className="sm:col-span-2">
            <Input.TextArea rows={4} showCount value={values.about} onChange={set('about')} maxLength={500} />
          </Field>
          {generalError(mutation.error) && (
            <div className="sm:col-span-2">
              <Notice tone="error">{generalError(mutation.error)}</Notice>
            </div>
          )}
          {saved && (
            <div className="sm:col-span-2">
              <Notice tone="success" icon="check">
                Kárxana maǵlıwmatı saqlandı.
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

const VACANCY_TYPES = ['Tolıq kún', 'Yarım kún', 'Onlayn'];
const EMPTY_VACANCY = { title: '', field: '', city: '', type: VACANCY_TYPES[0]!, requirement: '' };

const VacancyForm = ({ editing, onClose }: { editing: OwnVacancy | null; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { values, set, errors, setErrors } = useFormState<Record<keyof typeof EMPTY_VACANCY, string>>(
    editing ? { title: editing.title, field: editing.field, city: editing.city, type: editing.type, requirement: editing.requirement } : EMPTY_VACANCY,
  );
  const mutation = useMutation({
    mutationFn: (data: typeof values) => (editing ? api.updateVacancy(editing.id, data) : api.createVacancy(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['own-vacancies'] });
      onClose();
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (values.title.trim().length < 3) errs.title = 'Lawazım — keminde 3 belgi';
    if (values.field.trim().length < 2) errs.field = 'Taraw — keminde 2 belgi';
    if (values.city.trim().length < 2) errs.city = 'Qala — keminde 2 belgi';
    if (values.requirement.trim().length < 5) errs.requirement = 'Talap — keminde 5 belgi';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({ title: values.title.trim(), field: values.field.trim(), city: values.city.trim(), type: values.type, requirement: values.requirement.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Lawazım" error={errors.title} className="sm:col-span-2">
        <Input size="large" value={values.title} onChange={set('title')} maxLength={80} />
      </Field>
      <Field label="Taraw" error={errors.field} hint="IT, Medicina, Injeneriya…">
        <Input size="large" value={values.field} onChange={set('field')} maxLength={50} />
      </Field>
      <Field label="Qala" error={errors.city}>
        <Input size="large" value={values.city} onChange={set('city')} maxLength={50} />
      </Field>
      <Field label="Jumıs túri" error={errors.type} className="sm:col-span-2">
        <SelectField value={values.type} onChange={set('type')} options={[...VACANCY_TYPES]} />
      </Field>
      <Field label="Talaplar" error={errors.requirement} hint="Diplom, til, tájiriybe" className="sm:col-span-2">
        <Input.TextArea rows={4} showCount value={values.requirement} onChange={set('requirement')} maxLength={300} />
      </Field>
      {editing && (
        <p className="m-0 text-[13px] text-muted sm:col-span-2">Ózgertilgen vakansiya qayta moderaciyaǵa jiberiledi.</p>
      )}
      {generalError(mutation.error) && (
        <div className="sm:col-span-2">
          <Notice tone="error">{generalError(mutation.error)}</Notice>
        </div>
      )}
      <Button type="primary" size="large" htmlType="submit" loading={mutation.isPending} className="!inline-flex !items-center !gap-2 sm:col-span-2">
        {mutation.isPending ? 'Saqlanıp atır…' : editing ? 'Saqlaw' : 'Moderaciyaǵa jiberiw'}
      </Button>
    </form>
  );
};

export function VacanciesManager() {
  const queryClient = useQueryClient();
  const company = useQuery({ queryKey: ['company'], queryFn: api.company });
  const query = useQuery({ queryKey: ['own-vacancies'], queryFn: api.ownVacancies });
  const [form, setForm] = useState<{ editing: OwnVacancy | null } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const remove = useMutation({
    mutationFn: api.deleteVacancy,
    onSuccess: () => {
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ['own-vacancies'] });
    },
  });

  const hasCompany = !!company.data?.company;
  const list = query.data?.data ?? [];

  return (
    <>
      <PageTitle
        title="Vakansiyalarım"
        text="Hár jańa yamasa ózgertilgen vakansiya jariyalanıwdan aldın moderatordan ótedi. Jalǵan yamasa shet elge «jumısqa» shaqırıw usınısları qabıl etilmeydi."
        actions={
          <Button type="primary" size="large" disabled={!hasCompany} className="!inline-flex !items-center !gap-2" onClick={() => setForm({ editing: null })}>
            <Icon name="plus" size={17} /> Jańa vakansiya
          </Button>
        }
      />
      {!company.isLoading && !hasCompany && (
        <div className="mb-6">
          <Notice tone="warn" icon="building">
            Vakansiya jariyalaw ushın aldın{' '}
            <Link to="/kabinet/profil" className="font-semibold">
              kárxana maǵlıwmatın
            </Link>{' '}
            toltırıń.
          </Notice>
        </div>
      )}
      {generalError(remove.error) && (
        <div className="mb-4">
          <Notice tone="error">{generalError(remove.error)}</Notice>
        </div>
      )}

      {query.isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Panel>
          <EmptyHint icon="briefcase">Házirshe vakansiya joq. «Jańa vakansiya» túymesi arqalı birinshisin qosıń.</EmptyHint>
        </Panel>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {list.map((v) => (
            <li key={v.id}>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-lg font-semibold">{v.title}</h2>
                    <div className="mt-1 text-sm text-muted">
                      {v.field} · {v.city} · {v.type} · {formatDate(v.createdAt, false)}
                    </div>
                  </div>
                  <Badge tone={VACANCY_STATUS[v.status].tone}>{VACANCY_STATUS[v.status].label}</Badge>
                </div>
                <p className="mb-0 mt-3 text-[15px] leading-relaxed">
                  <span className="font-semibold">Talap:</span> {v.requirement}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-auto text-sm text-muted">{v.applications} arza</span>
                  <MiniButton onClick={() => setForm({ editing: v })}>
                    <Icon name="edit" size={14} /> Ózgertiw
                  </MiniButton>
                  {confirmId === v.id ? (
                    <>
                      <MiniButton tone="danger" disabled={remove.isPending} onClick={() => remove.mutate(v.id)}>
                        Óshiriwdi tastıyıqlaw
                      </MiniButton>
                      <MiniButton onClick={() => setConfirmId(null)}>Biykar etiw</MiniButton>
                    </>
                  ) : (
                    <MiniButton tone="danger" onClick={() => setConfirmId(v.id)}>
                      <Icon name="trash" size={14} /> Óshiriw
                    </MiniButton>
                  )}
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} eyebrow="Vakansiya" title={form?.editing ? 'Vakansiyanı ózgertiw' : 'Jańa vakansiya'}>
        {form && <VacancyForm editing={form.editing} onClose={() => setForm(null)} />}
      </Modal>
    </>
  );
}
