import { Avatar, Button, Input, Table, Timeline } from 'antd';
import { LOGIN_HINT, LOGIN_RE } from '@/lib/login';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashFilter, Badge, EmptyHint, Loading, MiniButton, Notice, PageTitle, Panel, StatCard } from '@/components/dashboard/ui';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { useDebounced } from '@/hooks/motion';
import { api } from '@/lib/api';
import { gradients } from '@/lib/palette';
import { fieldErrorsFrom, formatDate, generalError, useFormState } from '@/lib/form';
import { ROLES, USER_STATUS, VACANCY_STATUS } from '@/lib/roles';
import type { AuditEntry, Role, User, UserStatus, VacancyStatus } from '@/lib/types';

/* ───────────── Bas panel ───────────── */

export function AdminOverview() {
  const query = useQuery({ queryKey: ['admin-overview'], queryFn: api.adminOverview });
  if (query.isLoading) return <Loading />;
  if (query.error || !query.data) return <Notice tone="error">{generalError(query.error) ?? 'Maǵlıwmat júklenbedi'}</Notice>;
  const d = query.data;
  const todo = [
    { n: d.pendingUsers, label: 'paydalanıwshı tastıyıqlawdı kútip atır', to: '/kabinet/paydalaniwshilar?status=pending', icon: 'users' as const },
    { n: d.pendingVacancies, label: 'vakansiya moderaciyanı kútip atır', to: '/kabinet/moderaciya', icon: 'briefcase' as const },
  ];

  return (
    <>
      <PageTitle title="Basqarıw paneli" text="Paydalanıwshılardı tastıyıqlań, vakansiyalardı tekserip shıǵıń hám studentler dizimin qadaǵalań." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Studentler" value={d.users.student} hint="akkaunt" icon="cap" tone="primary" />
        <StatCard label="Mentorlar" value={d.users.mentor} hint="akkaunt" icon="compass" tone="mint" />
        <StatCard label="Tadbirkorlar" value={d.users.employer} hint="akkaunt" icon="building" tone="sky" />
        <StatCard label="Studentler dizimi" value={d.registry.now + d.registry.back} hint={`${d.registry.now} oqıp atır · ${d.registry.back} pitkergen`} icon="file" tone="sun" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Itibar kútip atır">
          <ul className="m-0 grid list-none gap-3 p-0">
            {todo.map((t) => (
              <li key={t.label}>
                <Link
                  to={t.to}
                  className={`group flex items-center gap-4 rounded-xl border border-solid p-4 no-underline transition-colors ${t.n ? 'border-coral/40 bg-coral-soft' : 'border-line bg-canvas'}`}
                >
                  <span className="font-serif-title text-3xl font-semibold text-midnight">{t.n}</span>
                  <span className="text-sm leading-snug text-ink">{t.label}</span>
                  <Icon name={t.icon} size={20} className="ml-auto text-primary" />
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-4 rounded-xl border border-solid border-line bg-canvas p-4">
              <span className="font-serif-title text-3xl font-semibold text-midnight">{d.openRequests}</span>
              <span className="text-sm leading-snug">juwapsız soraw hám arza (mentor/tadbirkorlarda)</span>
            </li>
          </ul>
        </Panel>

        <Panel
          title="Aqırǵı háreketler"
          action={
            <Link to="/kabinet/jurnal" className="text-sm font-semibold text-primary">
              Jurnal →
            </Link>
          }
        >
          {d.recentAudit.length === 0 ? (
            <EmptyHint icon="clock">Házirshe háreket jazılmaǵan.</EmptyHint>
          ) : (
            <Timeline
              items={d.recentAudit.map((a) => ({
                color: '#c29a45',
                content: (
                  <div className="text-sm">
                    <strong>{a.actorName}</strong> {a.action}: <span className="text-muted">{a.targetLabel}</span>
                    <div className="text-xs text-muted">{formatDate(a.createdAt)}</div>
                  </div>
                ),
              }))}
            />
          )}
        </Panel>
      </div>
    </>
  );
}

/* ───────────── Paydalanıwshılar ───────────── */

type RoleFilter = Role | 'all';
type StatusFilter = UserStatus | 'all';

const StaffForm = ({ onDone }: { onDone: () => void }) => {
  const queryClient = useQueryClient();
  const { values, set, errors, setErrors } = useFormState({ name: '', login: '', password: '' });
  const mutation = useMutation({
    mutationFn: api.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      onDone();
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (values.name.trim().length < 2) errs.name = 'Atı — keminde 2 belgi';
    if (!LOGIN_RE.test(values.login.trim().toLowerCase())) errs.login = LOGIN_HINT;
    if (values.password.length < 8) errs.password = 'Parol keminde 8 belgi';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({ name: values.name.trim(), login: values.login.trim(), password: values.password });
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Atı-familiyası" error={errors.name}>
        <Input size="large" value={values.name} onChange={set('name')} maxLength={80} />
      </Field>
      <Field label="Login" error={errors.login}>
        <Input size="large" autoComplete="off" autoCapitalize="none" spellCheck={false} value={values.login} onChange={set('login')} maxLength={32} />
      </Field>
      <Field label="Waqıtsha parol" error={errors.password} hint="Xızmetker kirgennen keyin paroldı ózgertiwi kerek">
        <Input size="large" type="text" autoComplete="off" value={values.password} onChange={set('password')} maxLength={100} />
      </Field>
      {generalError(mutation.error) && <Notice tone="error">{generalError(mutation.error)}</Notice>}
      <Button type="primary" size="large" htmlType="submit" loading={mutation.isPending} className="!inline-flex !items-center !gap-2">
        {mutation.isPending ? 'Jaratılıp atır…' : 'Akkaunt jaratıw'}
      </Button>
    </form>
  );
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const initialStatus = (['active', 'pending', 'blocked'] as const).find((s) => s === params.get('status')) ?? 'all';
  const [role, setRole] = useState<RoleFilter>('all');
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [q, setQ] = useState('');
  const [staffOpen, setStaffOpen] = useState(false);
  const search = useDebounced(q, 300);

  const query = useQuery({
    queryKey: ['admin-users', role, status, search],
    queryFn: () => api.adminUsers({ role: role === 'all' ? undefined : role, status: status === 'all' ? undefined : status, q: search }),
  });
  const mutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: UserStatus }) => api.setUserStatus(id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });
  const users = query.data?.data ?? [];

  const actions = (u: User) => {
    const act = (next: UserStatus, label: string, tone: 'primary' | 'danger' | 'default' = 'default') => (
      <MiniButton tone={tone} disabled={mutation.isPending} onClick={() => mutation.mutate({ id: u.id, next })}>
        {label}
      </MiniButton>
    );
    return (
      <div className="flex flex-wrap justify-end gap-2">
        {u.status === 'pending' && act('active', 'Tastıyıqlaw', 'primary')}
        {u.status === 'blocked' && act('active', 'Aktivlestiriw')}
        {u.status !== 'blocked' && act('blocked', 'Bloklaw', 'danger')}
      </div>
    );
  };

  return (
    <>
      <PageTitle
        title="Paydalanıwshılar"
        text="Mentordıń diplomın hám tadbirkordıń STIR-in tekserip, akkauntın tastıyıqlań. Bloklanǵan akkauntlar sistemaǵa kire almaydı."
        actions={
          <Button type="primary" size="large" className="!inline-flex !items-center !gap-2" onClick={() => setStaffOpen(true)}>
            <Icon name="plus" size={17} /> Xızmetker qosıw
          </Button>
        }
      />

      <div className="mb-4 grid gap-3">
        <DashFilter<RoleFilter>
          label="Rol boyınsha filtr"
          value={role}
          onChange={setRole}
          options={[{ value: 'all', label: 'Barlıq rol' }, ...(['student', 'mentor', 'employer', 'admin'] as const).map((r) => ({ value: r, label: ROLES[r].label }))]}
        />
        <DashFilter<StatusFilter>
          label="Status boyınsha filtr"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'Barlıq status' },
            { value: 'pending', label: 'Tekseriwde' },
            { value: 'active', label: 'Aktiv' },
            { value: 'blocked', label: 'Bloklanǵan' },
          ]}
        />
      </div>
      <div className="mb-6 max-w-md">
        <Field label="Izlew">
          <Input allowClear size="large" prefix={<Icon name="search" size={18} />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Atı, login yamasa kárxana" maxLength={100} />
        </Field>
      </div>

      {generalError(mutation.error) && (
        <div className="mb-4">
          <Notice tone="error">{generalError(mutation.error)}</Notice>
        </div>
      )}

      {query.isLoading ? (
        <Loading />
      ) : users.length === 0 ? (
        <Panel>
          <EmptyHint icon="users">Hesh kim tabılmadı. Filtrlerdi ózgertip kóriń.</EmptyHint>
        </Panel>
      ) : (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-card">
          <Table<User>
            rowKey="id"
            dataSource={users}
            pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
            scroll={{ x: 820 }}
            columns={[
              {
                title: 'Paydalanıwshı',
                key: 'user',
                render: (_: unknown, u: User) => (
                  <div className="flex items-center gap-3">
                    <Avatar className="!shrink-0" size={38} style={{ background: gradients.brand, fontWeight: 700 }}>
                      {u.name.slice(0, 1).toUpperCase()}
                    </Avatar>
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-sm text-muted">{u.login}</div>
                      {u.company && (
                        <div className="mt-0.5 text-xs text-accent-deep">
                          {u.company.name} · STIR {u.company.stir}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                title: 'Rol',
                dataIndex: 'role',
                render: (r: Role) => (
                  <span className="inline-flex items-center gap-2 font-medium">
                    <Icon name={ROLES[r].icon} size={18} className="text-primary" /> {ROLES[r].label}
                  </span>
                ),
              },
              { title: 'Status', dataIndex: 'status', render: (st: UserStatus) => <Badge tone={USER_STATUS[st].tone}>{USER_STATUS[st].label}</Badge> },
              { title: 'Dizimnen ótken', dataIndex: 'createdAt', render: (d: string) => <span className="whitespace-nowrap tabular-nums text-muted">{formatDate(d, false)}</span> },
              { title: '', key: 'actions', render: (_: unknown, u: User) => actions(u) },
            ]}
          />
        </div>
      )}

      <Modal open={staffOpen} onClose={() => setStaffOpen(false)} eyebrow="Jańa akkaunt" title="Xızmetker qosıw">
        {staffOpen && <StaffForm onDone={() => setStaffOpen(false)} />}
      </Modal>
    </>
  );
}

/* ───────────── Vakansiyalar moderaciyası ───────────── */

type VacancyFilter = VacancyStatus | 'all';

export function ModerationPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<VacancyFilter>('pending');
  const query = useQuery({ queryKey: ['admin-vacancies', filter], queryFn: () => api.adminVacancies(filter === 'all' ? undefined : filter) });
  const mutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: VacancyStatus }) => api.setVacancyStatus(id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });
  const list = query.data?.data ?? [];

  return (
    <>
      <PageTitle title="Vakansiyalar moderaciyası" text="Jalǵan yamasa shet elge «jumısqa» shaqırıw usınısların ótkermeń. Kárxana STIR hám tastıyıqlanıwın tekseriń." />
      <div className="mb-6">
        <DashFilter<VacancyFilter>
          label="Status boyınsha filtr"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'pending', label: 'Tekseriwde' },
            { value: 'approved', label: 'Maqullanǵan' },
            { value: 'rejected', label: 'Ruxsat berilmegen' },
            { value: 'all', label: 'Barlıǵı' },
          ]}
        />
      </div>
      {generalError(mutation.error) && (
        <div className="mb-4">
          <Notice tone="error">{generalError(mutation.error)}</Notice>
        </div>
      )}
      {query.isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Panel>
          <EmptyHint icon="briefcase">{filter === 'pending' ? 'Tekserilmegen vakansiya joq. Ájayıp!' : 'Bul status boyınsha vakansiya joq.'}</EmptyHint>
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
                      {v.company} · {v.city} · {v.type} · {v.field}
                    </div>
                  </div>
                  <Badge tone={VACANCY_STATUS[v.status].tone}>{VACANCY_STATUS[v.status].label}</Badge>
                </div>
                <p className="mb-0 mt-3 text-[15px] leading-relaxed">
                  <span className="font-semibold">Talap:</span> {v.requirement}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                  <span>STIR: {v.stir ?? '—'}</span>
                  <span>Jariyalaǵan: {v.ownerName ?? 'úlgi vakansiya'}</span>
                  <span>{formatDate(v.createdAt)}</span>
                </div>
                {v.ownerStatus === 'pending' && (
                  <div className="mt-3">
                    <Notice tone="warn" icon="clock">
                      Tadbirkordıń akkauntı ele tastıyıqlanbaǵan — vakansiya maqullansa da, akkaunt tastıyıqlanmaǵansha ashıq dizimde kórinbeydi.{' '}
                      <Link to="/kabinet/paydalaniwshilar?status=pending" className="font-semibold">
                        Akkauntqa ótiw →
                      </Link>
                    </Notice>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {v.status !== 'approved' && (
                    <MiniButton tone="primary" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: v.id, next: 'approved' })}>
                      <Icon name="check" size={14} /> Maqullaw
                    </MiniButton>
                  )}
                  {v.status !== 'rejected' && (
                    <MiniButton tone="danger" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: v.id, next: 'rejected' })}>
                      Ruxsat bermew
                    </MiniButton>
                  )}
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ───────────── Jurnal ───────────── */

export function AuditPage() {
  const query = useQuery({ queryKey: ['audit'], queryFn: api.audit });
  const list = query.data?.data ?? [];
  return (
    <>
      <PageTitle title="Jurnal" text="Studentlerdiń kontaktın kim hám qashan kórgeni, kim neni tastıyıqlaǵanı — barlıǵı saqlanadı. Jazıwlardı ózgertiw yamasa óshiriw múmkin emes." />
      {query.isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Panel>
          <EmptyHint icon="clock">Jurnal ele bos.</EmptyHint>
        </Panel>
      ) : (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-card">
          <Table<AuditEntry>
            rowKey="id"
            dataSource={list}
            pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
            scroll={{ x: 720 }}
            columns={[
              { title: 'Waqıt', dataIndex: 'createdAt', render: (d: string) => <span className="whitespace-nowrap tabular-nums text-muted">{formatDate(d)}</span> },
              { title: 'Xızmetker', dataIndex: 'actorName', render: (n: string) => <span className="font-semibold">{n}</span> },
              { title: 'Háreket', dataIndex: 'action' },
              { title: 'Obyekt', dataIndex: 'targetLabel', render: (t: string) => <span className="text-muted">{t}</span> },
            ]}
          />
        </div>
      )}
    </>
  );
}
