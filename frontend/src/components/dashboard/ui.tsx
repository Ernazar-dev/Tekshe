import { Alert, Button, Card, Empty, Segmented, Spin, Statistic, Tag } from 'antd';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { gradients } from '@/lib/palette';

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'default';

export const PageTitle = ({ title, text, actions }: { title: string; text?: string; actions?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div className="max-w-2xl">
      <h1 className="font-serif-title m-0 text-3xl font-semibold md:text-4xl">{title}</h1>
      {text && <p className="mb-0 mt-2 leading-relaxed text-muted">{text}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </div>
);

export const Panel = ({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <Card
    variant="borderless"
    className={`!rounded-[20px] !shadow-card ${className}`}
    title={title ? <span className="font-serif-title text-xl font-semibold">{title}</span> : undefined}
    extra={action}
    styles={{ body: { padding: 24 } }}
  >
    {children}
  </Card>
);

export type StatTone = 'primary' | 'sun' | 'mint' | 'coral' | 'sky';
const STAT_BG: Record<StatTone, string> = {
  primary: gradients.brand,
  sun: gradients.sun,
  mint: 'linear-gradient(135deg, #34d399 0%, #10b981 60%, #059669 100%)',
  coral: 'linear-gradient(135deg, #ff8a9b 0%, #ff5d73 60%, #e11d48 110%)',
  sky: 'linear-gradient(135deg, #284b8a 0%, #1b3768 55%, #0b1530 120%)',
};

export const StatCard = ({ label, value, hint, icon, accent = false, tone }: { label: string; value: ReactNode; hint?: string; icon: IconName; accent?: boolean; tone?: StatTone }) => {
  const t = tone ?? (accent ? 'sun' : 'primary');
  return (
    <Card variant="borderless" className="!rounded-[20px] !shadow-card lift" styles={{ body: { padding: 22 } }}>
      <div className="flex items-start justify-between gap-3">
        <Statistic title={<span className="text-[13px] font-medium text-muted">{label}</span>} formatter={() => <span className="font-serif-title">{value}</span>} value={0} />
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: STAT_BG[t] }}>
          <Icon name={icon} size={22} weight="duotone" />
        </span>
      </div>
      {hint && <div className="mt-2 text-[13px] text-muted">{hint}</div>}
    </Card>
  );
};

const TAG_COLOR: Record<Tone, string> = { success: 'success', warning: 'warning', error: 'error', info: 'processing', default: 'default' };

export const Badge = ({ tone = 'default', children }: { tone?: Tone; children: ReactNode }) => (
  <Tag color={TAG_COLOR[tone]} variant="filled" className="!m-0 !rounded-full !px-3 !py-0.5 !text-xs !font-semibold">
    {children}
  </Tag>
);

const ALERT_TYPE = { info: 'info', success: 'success', warn: 'warning', error: 'error' } as const;

export const Notice = ({ tone = 'info', children, icon }: { tone?: keyof typeof ALERT_TYPE; children: ReactNode; icon?: IconName }) => (
  <Alert showIcon icon={icon ? <Icon name={icon} size={20} /> : undefined} type={ALERT_TYPE[tone]} title={children} className="!rounded-2xl" />
);

export const EmptyHint = ({ icon = 'inbox', children }: { icon?: IconName; children: ReactNode }) => (
  <Empty
    className="!py-8"
    image={
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
        <Icon name={icon} size={30} />
      </span>
    }
    styles={{ image: { height: 64 } }}
    description={<span className="mx-auto block max-w-sm text-sm leading-relaxed text-muted">{children}</span>}
  />
);

export const Loading = () => (
  <div className="flex justify-center py-16" aria-busy="true" aria-label="Júklenip atır">
    <Spin size="large" />
  </div>
);

/** Kishi ólshemli túyme (keste háreketleri ushın) */
export const MiniButton = ({
  children,
  tone = 'default',
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: {
  tone?: 'default' | 'danger' | 'primary';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}) => (
  <Button aria-label={ariaLabel} size="small" type={tone === 'primary' ? 'primary' : 'default'} danger={tone === 'danger'} onClick={onClick} disabled={disabled} className="!inline-flex !items-center !gap-1.5">
    {children}
  </Button>
);

/** Bir tańlawlı filtr (Ant Design Segmented). Eski FilterChips menen birdey API */
export const DashFilter = <T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) => (
  <div className="max-w-full overflow-x-auto pb-1" role="group" aria-label={label}>
    <Segmented<T>
      size="large"
      value={value}
      onChange={onChange}
      options={options.map((o) => ({
        value: o.value,
        label: (
          <span className="inline-flex items-center gap-2 px-1 font-medium">
            {o.label}
            {o.count !== undefined && <span className="rounded-full bg-black/5 px-2 text-xs tabular-nums">{o.count}</span>}
          </span>
        ),
      }))}
    />
  </div>
);
