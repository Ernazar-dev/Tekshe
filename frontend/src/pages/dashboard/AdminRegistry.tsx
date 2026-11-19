import { SelectField } from '@/components/ui/SelectField';
import { Avatar, Button, Input, Table, Tag } from 'antd';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { DashFilter, EmptyHint, Loading, MiniButton, Notice, PageTitle, Panel } from '@/components/dashboard/ui';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { useDebounced } from '@/hooks/motion';
import { api } from '@/lib/api';
import { gradients } from '@/lib/palette';
import { fieldErrorsFrom, generalError, useFormState } from '@/lib/form';
import type { RevealedContact, Student, StudentStatus, StudentsQuery } from '@/lib/types';

type StatusFilter = StudentStatus | 'all';
const STATUS_LABEL: Record<StudentStatus, string> = { now: 'Oqıp atır', back: 'Pitkerip qayttı' };
const EMPTY_FILTERS = { q: '', country: '', grant: '', field: '' };
const EMPTY_FORM = { name: '', status: 'now', country: '', university: '', field: '', grant: '', years: '' };

const AddStudent = ({ onDone }: { onDone: () => void }) => {
  const queryClient = useQueryClient();
  const { values, set, errors, setErrors } = useFormState<Record<keyof typeof EMPTY_FORM, string>>(EMPTY_FORM);
  const mutation = useMutation({
    mutationFn: api.addStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registry'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      onDone();
    },
    onError: (err) => setErrors(fieldErrorsFrom(err)),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    for (const [k, label] of [
      ['name', 'Atı-familiyası'],
      ['country', 'Mámleket'],
      ['university', 'Universitet'],
      ['field', 'Tarawı'],
    ] as const) {
      if (values[k].trim().length < 2) errs[k] = `${label} — keminde 2 belgi`;
    }
    if (values.years.trim() && !/^\d{4}\s*[–-]\s*\d{4}$/.test(values.years.trim())) errs.years = 'Jıllar 2022–2026 formatında bolsın';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({
      name: values.name.trim(),
      status: values.status as StudentStatus,
      country: values.country.trim(),
      university: values.university.trim(),
      field: values.field.trim(),
      grant: values.grant.trim(),
      years: values.years.trim(),
    });
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Atı-familiyası" error={errors.name} className="sm:col-span-2">
        <Input size="large" value={values.name} onChange={set('name')} maxLength={80} autoComplete="off" />
      </Field>
      <Field label="Status">
        <SelectField value={values.status} onChange={set('status')} options={[{ value: 'now', label: STATUS_LABEL.now }, { value: 'back', label: STATUS_LABEL.back }]} />
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
        <Input size="large" value={values.years} onChange={set('years')} maxLength={15} />
      </Field>
      {generalError(mutation.error) && (
        <div className="sm:col-span-2">
          <Notice tone="error">{generalError(mutation.error)}</Notice>
        </div>
      )}
      <Button type="primary" size="large" htmlType="submit" loading={mutation.isPending} className="!inline-flex !items-center !gap-2 sm:col-span-2">
        {mutation.isPending ? 'Saqlanıp atır…' : 'Dizimge qosıw'}
      </Button>
    </form>
  );
};

export function RegistryPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [adding, setAdding] = useState(false);
  const [revealed, setRevealed] = useState<RevealedContact | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const q = useDebounced(filters.q, 300);

  const params: StudentsQuery = { ...filters, q, status: status === 'all' ? undefined : status };
  const query = useQuery({ queryKey: ['registry', params], queryFn: () => api.registry(params), placeholderData: keepPreviousData });
  const data = query.data;

  const reveal = useMutation({ mutationFn: (s: Student) => api.revealStudent(s.id), onSuccess: setRevealed });
  const remove = useMutation({
    mutationFn: api.deleteStudent,
    onSuccess: () => {
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ['registry'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });

  const setFilter = (k: keyof typeof EMPTY_FILTERS) => (e: { target: { value: string } }) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const clear = () => {
    setStatus('all');
    setFilters(EMPTY_FILTERS);
  };
  const hasFilters = status !== 'all' || Object.values(filters).some(Boolean);
  const download = async () => {
    setCsvError(null);
    try {
      await api.downloadRegistry(params);
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    } catch (err) {
      setCsvError(generalError(err));
    }
  };

  return (
    <>
      <PageTitle
        title="Studentler dizimi"
        text="Tolıq dizim tek ruxsatı bar xızmetkerlerge kórinedi. Kontaktlar jasırın: «Kontakt» basılǵanda kim hám qashan kórgeni jurnalǵa jazıladı."
        actions={
          <>
            <Button size="large" onClick={download} className="!inline-flex !items-center !gap-2">
              <Icon name="download" size={18} /> CSV júklew
            </Button>
            <Button type="primary" size="large" className="!inline-flex !items-center !gap-2" onClick={() => setAdding(true)}>
              <Icon name="plus" size={18} /> Student qosıw
            </Button>
          </>
        }
      />

      <div className="mb-5">
        <DashFilter<StatusFilter>
          label="Status boyınsha filtr"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'Barlıǵı', count: data?.counts.all },
            { value: 'now', label: STATUS_LABEL.now, count: data?.counts.now },
            { value: 'back', label: STATUS_LABEL.back, count: data?.counts.back },
          ]}
        />
      </div>

      <div className="card mb-6 grid gap-4 p-5 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <Field label="Izlew">
          <Input allowClear size="large" prefix={<Icon name="search" size={18} />} value={filters.q} onChange={setFilter('q')} placeholder="Atı, universitet yamasa tarawı" maxLength={100} />
        </Field>
        <Field label="Mámleket">
          <SelectField searchable value={filters.country} onChange={setFilter('country')} options={[{ value: '', label: 'Barlıǵı' }, ...(data?.facets.countries ?? [])]} />
        </Field>
        <Field label="Grant">
          <SelectField searchable value={filters.grant} onChange={setFilter('grant')} options={[{ value: '', label: 'Barlıǵı' }, ...(data?.facets.grants ?? [])]} />
        </Field>
        <Field label="Tarawı">
          <SelectField searchable value={filters.field} onChange={setFilter('field')} options={[{ value: '', label: 'Barlıǵı' }, ...(data?.facets.fields ?? [])]} />
        </Field>
      </div>

      {(csvError || generalError(reveal.error) || generalError(remove.error)) && (
        <div className="mb-4">
          <Notice tone="error">{csvError ?? generalError(reveal.error) ?? generalError(remove.error)}</Notice>
        </div>
      )}

      <div className="mb-4 flex min-h-[28px] flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-muted" role="status" aria-live="polite">
          {data ? `Kórsetilgen: ${data.total} profil` : ''}
        </p>
        {hasFilters && (
          <button type="button" className="border-0 bg-transparent text-sm font-medium text-primary underline-offset-4 hover:underline" onClick={clear}>
            Filtrlerdi tazalaw
          </button>
        )}
      </div>

      {query.isLoading ? (
        <Loading />
      ) : data?.data.length === 0 ? (
        <Panel>
          <EmptyHint icon="search">Nátiyje tabılmadı. Filtrlerdi ózgertiń.</EmptyHint>
        </Panel>
      ) : (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-card">
          <Table<Student>
            rowKey="id"
            aria-label="Studentler dizimi"
            loading={query.isPlaceholderData}
            dataSource={data?.data}
            pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
            scroll={{ x: 980 }}
            columns={[
              {
                title: 'Atı-familiyası',
                dataIndex: 'name',
                render: (name: string) => (
                  <span className="flex items-center gap-3 whitespace-nowrap font-semibold">
                    <Avatar className="!shrink-0" size={34} style={{ background: gradients.brand, fontWeight: 700 }}>
                      {name.slice(0, 1).toUpperCase()}
                    </Avatar>
                    {name}
                  </span>
                ),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (st: Student['status']) => (
                  <Tag color={st === 'now' ? 'purple' : 'gold'} variant="filled" className="!rounded-full !px-3 !font-semibold">
                    {STATUS_LABEL[st]}
                  </Tag>
                ),
              },
              { title: 'Mámleket', dataIndex: 'country' },
              { title: 'Universitet', dataIndex: 'university' },
              { title: 'Tarawı', dataIndex: 'field' },
              { title: 'Grant', dataIndex: 'grant' },
              { title: 'Jıllar', dataIndex: 'years', render: (y: string) => <span className="whitespace-nowrap tabular-nums text-muted">{y}</span> },
              {
                title: '',
                key: 'actions',
                fixed: 'right',
                render: (_: unknown, s: Student) => (
                  <div className="flex justify-end gap-2">
                    <MiniButton disabled={reveal.isPending} onClick={() => reveal.mutate(s)}>
                      <Icon name="eye" size={14} /> Kontakt
                    </MiniButton>
                    {confirmId === s.id ? (
                      <>
                        <MiniButton tone="danger" disabled={remove.isPending} onClick={() => remove.mutate(s.id)}>
                          Tastıyıqlaw
                        </MiniButton>
                        <MiniButton onClick={() => setConfirmId(null)}>Yaq</MiniButton>
                      </>
                    ) : (
                      <MiniButton tone="danger" aria-label={`${s.name} dizimnen óshiriw`} onClick={() => setConfirmId(s.id)}>
                        <Icon name="trash" size={14} />
                      </MiniButton>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} eyebrow="Jańa profil" title="Student qosıw">
        {adding && <AddStudent onDone={() => setAdding(false)} />}
      </Modal>

      <Modal open={!!revealed} onClose={() => setRevealed(null)} eyebrow="Kontakt maǵlıwmatı" title={revealed?.name ?? ''}>
        {revealed && (
          <div className="grid gap-4">
            {revealed.phone ? (
              <dl className="m-0 grid gap-3">
                {revealed.phone && (
                  <div className="rounded-xl bg-canvas p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Telefon</dt>
                    <dd className="m-0 mt-1 font-semibold">{revealed.phone}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="m-0 text-muted">
                {revealed.hasAccount ? "Student akkaunt ashqan, biraq telefon nomerin kórsetpegen." : "Bul student platformada akkaunt ashpaǵan, kontakt maǵlıwmatı joq."}
              </p>
            )}
            <Notice tone="warn" icon="eye">
              Usı háreket jurnalǵa jazıldı: kim hám qashan kórgeni saqlanadı. Maǵlıwmattı tek xızmet maqsetinde paydalanıń.
            </Notice>
          </div>
        )}
      </Modal>
    </>
  );
}
