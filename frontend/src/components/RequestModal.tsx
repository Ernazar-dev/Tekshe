import { Button, Input } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { RequestType } from '@/lib/types';

export interface RequestTarget {
  type: RequestType;
  id: string;
  /** Mentor atı yamasa vakansiya ataması */
  title: string;
}

const EMPTY = { message: '' };
type Values = typeof EMPTY;
type Errors = Partial<Record<keyof Values, string>>;

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (v.message.trim().length < 10) e.message = 'Sorawıńızdı tolıǵıraq jazıń (keminde 10 belgi)';
  return e;
};

/** Mentorǵa keńes sorawı yamasa vakansiyaǵa arza */
export const RequestModal = ({ target, onClose }: { target: RequestTarget | null; onClose: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const mutation = useMutation({ mutationFn: api.createRequest });
  const { reset } = mutation;

  // Hár jańa ashılıwda forma tazalanadı
  useEffect(() => {
    if (!target) return;
    setValues(EMPTY);
    setErrors({});
    reset();
  }, [target, reset]);

  const isMentor = target?.type === 'mentor';
  const isVacancy = target?.type === 'vacancy';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!target || mutation.isPending) return;
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    mutation.mutate(
      {
        type: target.type,
        targetId: target.id,
        message: values.message.trim(),
      },
      {
        onError: (err) => {
          if (err instanceof ApiError) {
            setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]])) as Errors);
          }
        },
      },
    );
  };

  const serverError =
    mutation.error && !(mutation.error instanceof ApiError && Object.keys(mutation.error.fieldErrors).length)
      ? mutation.error.message
      : null;

  // Foydalanuvchi tizimga kirmagan bo'lsa
  if (!user) {
    return (
      <Modal open={!!target} onClose={onClose} eyebrow={isMentor ? 'Keńes sorawı' : 'Arza'} title={target?.title ?? ''}>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <Icon name="shield" size={26} />
          </span>
          <h3 className="font-serif-title m-0 text-xl font-semibold">Sistemaǵa kiriw talab etiledi</h3>
          <p className="m-0 max-w-sm text-sm leading-relaxed text-muted">
            {isMentor ? 'Mentorǵa soraw jiberiw ushın dáslep sistemaǵa kiriń.' : 'Vakansiyaǵa arza beriw ushın dáslep sistemaǵa kiriń.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Button type="primary" size="large" className="!inline-flex !items-center !gap-2" onClick={() => {
                onClose();
                navigate('/kirish', { state: { from: location.pathname } });
              }}
            >
              Kiriwge ótiw <Icon name="arrowRight" size={16} />
            </Button>
            <Button size="large" className="!inline-flex !items-center !gap-2" onClick={() => {
                onClose();
                navigate('/dizimnen-otiw', { state: { from: location.pathname } });
              }}
            >
              Dizimnen ótiw
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Vakansiyaga faqat studentlar ariza topshira oladi
  const roleBlocked = isVacancy && user.role !== 'student';

  return (
    <Modal open={!!target} onClose={onClose} eyebrow={isMentor ? 'Keńes sorawı' : 'Arza'} title={target?.title ?? ''}>
      {mutation.isSuccess ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="animate-pulse-ring flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <Icon name="check" size={26} />
          </span>
          <h3 className="font-serif-title m-0 text-xl font-semibold">
            {isMentor ? 'Sorawıńız jiberildi' : 'Arzańız jiberildi'}
          </h3>
          <p className="m-0 max-w-sm text-sm leading-relaxed text-muted">
            {isMentor
              ? 'Mentor sorawıńızdı kórip, platforma arqalı juwap beredi.'
              : 'Kárxana arzańızdı kórip shıǵıp, siz benen baylanısadı.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Link to="/kabinet/sorawlar" className="btn-dark" onClick={onClose}>
              Kabinetke ótiw <Icon name="arrowRight" size={16} />
            </Link>
            <Button size="large" onClick={onClose} className="!inline-flex !items-center !gap-2">
              Jabıw
            </Button>
          </div>
        </div>
      ) : roleBlocked ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-800">
            <Icon name="alert" size={26} />
          </span>
          <h3 className="font-serif-title m-0 text-xl font-semibold">Ruxsat sheklengen</h3>
          <p className="m-0 max-w-sm text-sm leading-relaxed text-muted">
            Vakansiyalarǵa arza beriw tek <strong>student</strong> profili ushın ashıq. Siz házir{' '}
            <strong>{user.role === 'mentor' ? 'mentor' : user.role === 'employer' ? 'tadbirkor' : 'xızmetker'}</strong> akkauntındasız.
          </p>
          <Button type="primary" size="large" onClick={onClose} className="!inline-flex !items-center !gap-2 mt-2">
            Túsinikli
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="rounded-xl border border-solid border-line bg-canvas p-3.5 text-sm">
            <span className="block text-xs font-medium text-muted">Jiberiwshi:</span>
            <span className="font-semibold text-ink">{user.name}</span>
            <span className="ml-2 text-xs text-muted">({user.login}{user.phone ? ` · ${user.phone}` : ''})</span>
          </div>

          <p className="m-0 text-sm leading-relaxed text-muted">
            {isMentor
              ? 'Sorawıńızdı qısqa hám anıq jazıń — mentor ana tilińizde juwap beredi.'
              : 'Qısqasha ózińiz, tálimińiz hám jumıs tájiriybeńiz haqqında jazıń.'}
          </p>

          <Field label={isMentor ? 'Sorawıńız' : 'Xat'} error={errors.message} hint="Keminde 10 belgi">
            <Input.TextArea
              rows={5}
              showCount
              value={values.message}
              onChange={(e) => {
                setValues({ message: e.target.value });
                if (errors.message) setErrors({});
              }}
              maxLength={1000}
              placeholder={isMentor ? 'Qaysı másele boyınsha járdem kerek?' : 'Bilimińiz, tájiriybeńiz hám máqsetińiz…'}
            />
          </Field>

          {serverError && (
            <p className="m-0 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {serverError}
            </p>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button size="large" onClick={onClose} disabled={mutation.isPending} className="!inline-flex !items-center !gap-2">
              Biykar etiw
            </Button>
            <Button type="primary" size="large" htmlType="submit" loading={mutation.isPending} className="!inline-flex !items-center !gap-2">
              {mutation.isPending ? 'Jiberilip atır…' : 'Jiberiw'}
              {!mutation.isPending && <Icon name="send" size={17} />}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
