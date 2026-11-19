import { Button, Input } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DashFilter, Badge, EmptyHint, Loading, Notice, PageTitle, Panel } from '@/components/dashboard/ui';
import { Icon } from '@/components/ui/Icon';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, generalError } from '@/lib/form';
import { REQUEST_STATUS } from '@/lib/roles';
import type { RequestItem, RequestStatus } from '@/lib/types';

type Filter = RequestStatus | 'all';

const ReplyBox = ({ item }: { item: RequestItem }) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState(item.reply);
  const mutation = useMutation({
    mutationFn: (data: { reply?: string; status?: RequestStatus }) => api.reply(item.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
  const error = generalError(mutation.error);
  const dirty = text.trim() !== item.reply;

  return (
    <div className="mt-4 grid gap-3">
      <label className="grid gap-1.5 text-[13px] font-medium">
        Juwabıńız
        <Input.TextArea
          rows={4}
          showCount
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          placeholder="Qısqa hám túsinikli juwap jazıń…"
        />
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <Button type="primary" size="large" disabled={mutation.isPending || !text.trim() || !dirty} className="!inline-flex !items-center !gap-2" onClick={() => mutation.mutate({ reply: text.trim() })}>
          <Icon name="send" size={15} /> {item.reply ? 'Juwapdı jańalaw' : 'Juwap jiberiw'}
        </Button>
        {item.status !== 'closed' ? (
          <Button size="large" disabled={mutation.isPending} onClick={() => mutation.mutate({ status: 'closed' })}>
            Jabıw
          </Button>
        ) : (
          <Button size="large" disabled={mutation.isPending} onClick={() => mutation.mutate({ status: item.reply ? 'answered' : 'new' })}>
            Qayta ashıw
          </Button>
        )}
      </div>
    </div>
  );
};

/** Mentorǵa kelgen sorawlar yamasa tadbirkorǵa kelgen arzalar */
export function Inbox() {
  const { user } = useAuth();
  const isMentor = user?.role === 'mentor';
  const query = useQuery({ queryKey: ['inbox'], queryFn: api.inbox });
  const [filter, setFilter] = useState<Filter>('all');

  const all = query.data?.data ?? [];
  const count = (s: RequestStatus) => all.filter((r) => r.status === s).length;
  const items = filter === 'all' ? all : all.filter((r) => r.status === filter);

  return (
    <>
      <PageTitle
        title={isMentor ? 'Kelgen sorawlar' : 'Kelgen arzalar'}
        text={isMentor ? 'Studentlerden kelgen sorawlar. Juwabıńız platforma ishinde, sorawshıǵa kórinedi.' : 'Vakansiyalarıńızǵa tússen arzalar. Juwabıńız kandidatqa platforma ishinde kórinedi.'}
      />
      <div className="mb-6">
        <DashFilter<Filter>
          label="Status boyınsha filtr"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Barlıǵı', count: all.length },
            { value: 'new', label: 'Jańa', count: count('new') },
            { value: 'answered', label: 'Juwap berildi', count: count('answered') },
            { value: 'closed', label: 'Jabıldı', count: count('closed') },
          ]}
        />
      </div>

      {query.isLoading ? (
        <Loading />
      ) : query.error ? (
        <Notice tone="error">{generalError(query.error)}</Notice>
      ) : items.length === 0 ? (
        <Panel>
          <EmptyHint icon="inbox">{all.length ? 'Bul status boyınsha jazıw joq.' : isMentor ? 'Házirshe sorawlar kelmegen.' : 'Házirshe arzalar kelmegen. Vakansiya maqullanǵannan keyin kandidatlar arza bere aladı.'}</EmptyHint>
        </Panel>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {items.map((r) => (
            <li key={r.id}>
              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-serif-title flex h-11 w-11 items-center justify-center rounded-full bg-midnight font-semibold text-accent-light">{r.name.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted">
                        {isMentor ? 'Soraw' : r.targetTitle} · {formatDate(r.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge tone={REQUEST_STATUS[r.status].tone}>{REQUEST_STATUS[r.status].label}</Badge>
                </div>
                <p className="mb-0 mt-4 whitespace-pre-line text-[15px] leading-relaxed">{r.message}</p>
                {r.contact && (
                  <p className="mb-0 mt-3 flex items-center gap-2 text-sm text-muted">
                    <Icon name="mail" size={15} /> Qosımsha baylanıs (óz erki menen): <strong className="text-ink">{r.contact}</strong>
                  </p>
                )}
                <ReplyBox item={r} />
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
