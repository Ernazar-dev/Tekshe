import { lazy, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardLayout, OnlyRoles } from '@/components/dashboard/DashboardLayout';
import { Layout } from '@/components/layout/Layout';
import Landing from '@/pages/Landing';

// Bas bet birden júklenedi, qalǵan betler — kerek bolǵanda
const Grants = lazy(() => import('@/pages/Grants'));
const Mentors = lazy(() => import('@/pages/Mentors'));
const Guides = lazy(() => import('@/pages/Guides'));
const Students = lazy(() => import('@/pages/Students'));
const Vacancies = lazy(() => import('@/pages/Vacancies'));
const Support = lazy(() => import('@/pages/Support'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Login = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Register })));

const Overview = lazy(() => import('@/pages/dashboard/Overview'));
const AccountPage = lazy(() => import('@/pages/dashboard/AccountPage').then((m) => ({ default: m.AccountPage })));
const Inbox = lazy(() => import('@/pages/dashboard/Inbox').then((m) => ({ default: m.Inbox })));
const StudentProfile = lazy(() => import('@/pages/dashboard/StudentPages').then((m) => ({ default: m.StudentProfile })));
const StudentRequests = lazy(() => import('@/pages/dashboard/StudentPages').then((m) => ({ default: m.StudentRequests })));
const StudentChecklist = lazy(() => import('@/pages/dashboard/StudentPages').then((m) => ({ default: m.StudentChecklist })));
const MentorProfile = lazy(() => import('@/pages/dashboard/MentorPages').then((m) => ({ default: m.MentorProfile })));
const CompanyPage = lazy(() => import('@/pages/dashboard/EmployerPages').then((m) => ({ default: m.CompanyPage })));
const VacanciesManager = lazy(() => import('@/pages/dashboard/EmployerPages').then((m) => ({ default: m.VacanciesManager })));
const UsersPage = lazy(() => import('@/pages/dashboard/AdminPages').then((m) => ({ default: m.UsersPage })));
const ModerationPage = lazy(() => import('@/pages/dashboard/AdminPages').then((m) => ({ default: m.ModerationPage })));
const AuditPage = lazy(() => import('@/pages/dashboard/AdminPages').then((m) => ({ default: m.AuditPage })));
const RegistryPage = lazy(() => import('@/pages/dashboard/AdminRegistry').then((m) => ({ default: m.RegistryPage })));

import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/types';

/** /kabinet/profil — rolge qaray óz profili */
const RoleSwitch = ({ map }: { map: Partial<Record<Role, ReactNode>> }) => {
  const { user } = useAuth();
  return <>{user ? map[user.role] : null}</>;
};
const only = (roles: Role[], el: ReactNode) => <OnlyRoles roles={roles}>{el}</OnlyRoles>;

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/grantlar', element: <Grants /> },
      { path: '/mentorlar', element: <Mentors /> },
      { path: '/kenesler', element: <Guides /> },
      { path: '/studentler', element: <Students /> },
      { path: '/vakansiyalar', element: <Vacancies /> },
      { path: '/jardem', element: <Support /> },
      { path: '/kirish', element: <Login /> },
      { path: '/dizimnen-otiw', element: <Register /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/kabinet',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'profil', element: <RoleSwitch map={{ student: <StudentProfile />, mentor: <MentorProfile />, employer: <CompanyPage /> }} /> },
      { path: 'sorawlar', element: <RoleSwitch map={{ student: <StudentRequests />, mentor: <Inbox />, employer: <Inbox /> }} /> },
      { path: 'tayarliq', element: only(['student'], <StudentChecklist />) },
      { path: 'vakansiyalar', element: only(['employer'], <VacanciesManager />) },
      { path: 'paydalaniwshilar', element: only(['admin'], <UsersPage />) },
      { path: 'moderaciya', element: only(['admin'], <ModerationPage />) },
      { path: 'dizim', element: only(['admin'], <RegistryPage />) },
      { path: 'jurnal', element: only(['admin'], <AuditPage />) },
      { path: 'akkaunt', element: <AccountPage /> },
    ],
  },
]);

export const App = () => <RouterProvider router={router} future={{ v7_startTransition: true }} />;
