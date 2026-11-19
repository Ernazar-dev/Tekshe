import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from './api';
import { useAuth } from './auth';

const STORAGE_KEY = 'tekshe:checklist';

const readLocal = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

type StudentPanel = Awaited<ReturnType<typeof api.studentPanel>>;

/**
 * Tayarlıq dizimi belgilengen bántler.
 * Student kirgen bolsa — serverde (profilinde) saqlanadı, basqa jaǵdayda — usı brauzerde.
 */
export const useChecklist = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const queryClient = useQueryClient();
  const panel = useQuery({ queryKey: ['student-panel'], queryFn: api.studentPanel, enabled: isStudent });
  const [local, setLocal] = useState(readLocal);

  useEffect(() => {
    if (isStudent) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    } catch {
      /* jeke rejim yamasa saqlaw sheklengen — tek usı sessiyada isleydi */
    }
  }, [local, isStudent]);

  const save = useMutation({
    mutationFn: api.saveChecklist,
    // Server juwap bermese, belgi kórinisi qaytadı
    onError: () => queryClient.invalidateQueries({ queryKey: ['student-panel'] }),
  });

  const serverDone = panel.data?.checklist ?? [];
  const checked: Record<string, boolean> = isStudent ? Object.fromEntries(serverDone.map((id) => [id, true])) : local;

  const toggle = (id: string) => {
    if (!isStudent) {
      setLocal((c) => ({ ...c, [id]: !c[id] }));
      return;
    }
    const next = new Set(serverDone);
    if (!next.delete(id)) next.add(id);
    const done = [...next];
    // Belgi dárhal kórinsin — server juwabın kútpeymiz
    queryClient.setQueryData<StudentPanel>(['student-panel'], (old) => (old ? { ...old, checklist: done } : old));
    save.mutate(done);
  };

  return { checked, toggle, synced: isStudent, loading: isStudent && panel.isLoading, saveError: save.isError };
};
