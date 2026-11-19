import type { Tone } from '@/components/dashboard/ui';
import type { IconName } from '@/components/ui/Icon';
import type { RequestStatus, Role, UserStatus, VacancyStatus } from './types';

export interface RoleMeta {
  label: string;
  /** Dizimnen ótiw betindegi túsindirme */
  brief: string;
  icon: IconName;
}

export const ROLES: Record<Role, RoleMeta> = {
  student: { label: 'Student', brief: 'Shet elde oqıp atırman yamasa baratuǵınman: grant, mentor, tayarlıq dizimi', icon: 'cap' },
  mentor: { label: 'Mentor', brief: 'Shet elde oqıp qaytqanman: tájiriybem menen jaslarǵa járdem beremen', icon: 'compass' },
  employer: { label: 'Tadbirkor', brief: 'Kárxanam ushın shet elde bilim alǵan qánigelerdi izleymen', icon: 'briefcase' },
  admin: { label: 'Xızmetker', brief: 'Jaslar isleri agentligi xızmetkeri', icon: 'shield' },
};

/** Ashıq dizimnen ótiw múmkin bolǵan rollar */
export const SIGNUP_ROLES = ['student', 'mentor', 'employer'] as const;

export const USER_STATUS: Record<UserStatus, { label: string; tone: Tone }> = {
  active: { label: 'Aktiv', tone: 'success' },
  pending: { label: 'Tekseriwde', tone: 'warning' },
  blocked: { label: 'Bloklanǵan', tone: 'error' },
};

export const VACANCY_STATUS: Record<VacancyStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Tekseriwde', tone: 'warning' },
  approved: { label: 'Maqullandı', tone: 'success' },
  rejected: { label: 'Ruxsat berilmedi', tone: 'error' },
};

export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: Tone }> = {
  new: { label: 'Jańa', tone: 'info' },
  answered: { label: 'Juwap berildi', tone: 'success' },
  closed: { label: 'Jabıldı', tone: 'default' },
};

/** Mentor hám tadbirkordıń tastıyıqlawı ne ushın kerekligi */
export const PENDING_NOTE: Partial<Record<Role, string>> = {
  mentor: 'Diplomıńızdı xızmetker tekseredi. Tastıyıqlanǵansha profilińiz ashıq dizimde kórinbeydi — házirshe onı toltırıp qoyıń.',
  employer: 'Kárxanańızdı STIR boyınsha xızmetker tekseredi. Tastıyıqlanǵansha vakansiyalarıńız ashıq dizimde kórinbeydi.',
};
