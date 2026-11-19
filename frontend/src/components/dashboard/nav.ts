import type { IconName } from '@/components/ui/Icon';
import type { Role } from '@/lib/types';

export interface DashNavItem {
  to: string;
  label: string;
  icon: IconName;
  /** true — tek dál usı mánzilde jaqıladı (bas panel ushın) */
  end?: boolean;
}

const HOME: DashNavItem = { to: '/kabinet', label: 'Bas panel', icon: 'grid', end: true };
const ACCOUNT: DashNavItem = { to: '/kabinet/akkaunt', label: 'Akkaunt', icon: 'user' };

/** Hár rol ushın óz paneli — menyu bántleri */
export const DASH_NAV: Record<Role, DashNavItem[]> = {
  student: [
    HOME,
    { to: '/kabinet/profil', label: 'Profilim', icon: 'cap' },
    { to: '/kabinet/sorawlar', label: 'Sorawlarım', icon: 'mail' },
    { to: '/kabinet/tayarliq', label: 'Tayarlıq dizimi', icon: 'checklist' },
    ACCOUNT,
  ],
  mentor: [
    HOME,
    { to: '/kabinet/profil', label: 'Mentor profili', icon: 'compass' },
    { to: '/kabinet/sorawlar', label: 'Kelgen sorawlar', icon: 'inbox' },
    ACCOUNT,
  ],
  employer: [
    HOME,
    { to: '/kabinet/profil', label: 'Kárxana', icon: 'building' },
    { to: '/kabinet/vakansiyalar', label: 'Vakansiyalarım', icon: 'briefcase' },
    { to: '/kabinet/sorawlar', label: 'Kelgen arzalar', icon: 'inbox' },
    ACCOUNT,
  ],
  admin: [
    HOME,
    { to: '/kabinet/paydalaniwshilar', label: 'Paydalanıwshılar', icon: 'users' },
    { to: '/kabinet/moderaciya', label: 'Vakansiyalar', icon: 'briefcase' },
    { to: '/kabinet/dizim', label: 'Studentler dizimi', icon: 'file' },
    { to: '/kabinet/jurnal', label: 'Jurnal', icon: 'clock' },
    ACCOUNT,
  ],
};
