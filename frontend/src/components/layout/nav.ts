import type { IconName } from '@/components/ui/Icon';

export interface NavItem {
  to: string;
  label: string;
  brief: string;
  icon: IconName;
}

/** Platforma bólimleri — navbar, landing hám footer usı dizimnen paydalanadı */
export const NAV: NavItem[] = [
  { to: '/grantlar', label: 'Grantlar', brief: 'Mámleketlik hám shet el grantları bir jerde', icon: 'cap' },
  { to: '/mentorlar', label: 'Mentorlar', brief: 'Oqıp qaytqan qánigelerden keńes', icon: 'compass' },
  { to: '/kenesler', label: 'Keńesler', brief: 'Tayarlıq dizimi hám video-keńesler', icon: 'checklist' },
  { to: '/studentler', label: 'Studentler', brief: 'Shet eldegi jaslarımızdıń dizimi', icon: 'users' },
  { to: '/vakansiyalar', label: 'Vakansiyalar', brief: 'Elge qaytqanlar ushın jumıs orınları', icon: 'briefcase' },
  { to: '/jardem', label: 'Járdem', brief: 'Anonim psixologiyalıq qollaw', icon: 'heart' },
];
