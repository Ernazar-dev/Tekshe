import { useAuth } from '@/lib/auth';
import { AdminOverview } from './AdminPages';
import { EmployerOverview } from './EmployerPages';
import { MentorOverview } from './MentorPages';
import { StudentOverview } from './StudentPages';

/** /kabinet — rolge qaray óz bas paneli */
export default function Overview() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'admin':
      return <AdminOverview />;
    case 'mentor':
      return <MentorOverview />;
    case 'employer':
      return <EmployerOverview />;
    default:
      return <StudentOverview />;
  }
}
