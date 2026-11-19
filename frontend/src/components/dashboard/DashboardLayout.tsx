import { Avatar, Breadcrumb, Button, Drawer, Dropdown, Grid, Layout, Menu, Tag } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';
import { gradients } from '@/lib/palette';
import { PENDING_NOTE, ROLES, USER_STATUS } from '@/lib/roles';
import type { Role } from '@/lib/types';
import { DASH_NAV } from './nav';
import { Loading, Notice } from './ui';

const { Sider, Header, Content } = Layout;

/** Betti tek ruxsat etilgen rollerge kórsetedi, qalǵanlardı bas panelge qaytaradı */
export const OnlyRoles = ({ roles, children }: { roles: Role[]; children: ReactNode }) => {
  const { user } = useAuth();
  return user && roles.includes(user.role) ? <>{children}</> : <Navigate to="/kabinet" replace />;
};

export const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const desktop = !!screens.lg;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (loading) return <Loading />;
  // Kirmegen paydalanıwshı kiriw betine jiberiledi, kirgennen keyin sol jerge qaytadı
  if (!user) return <Navigate to="/kirish" state={{ from: pathname }} replace />;

  const nav = DASH_NAV[user.role];
  const current = nav.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));
  const pendingNote = user.status === 'pending' ? PENDING_NOTE[user.role] : null;

  const sidebar = (
    <div className="flex h-full flex-col" style={{ background: gradients.night }}>
      <div className="relative overflow-hidden px-5 pb-5 pt-6">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative">
          <Logo dark />
        </div>
      </div>

      <div className="mx-4 flex items-center gap-3 rounded-2xl border border-solid border-white/10 bg-white/[0.07] p-3.5 backdrop-blur">
        <Avatar size={44} style={{ background: gradients.sun, color: '#1a1306', fontWeight: 700 }}>
          {user.name.slice(0, 1).toUpperCase()}
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-white">{user.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Tag color="gold" variant="filled" className="!m-0 !rounded-full !text-[11px] !font-semibold">
              {ROLES[user.role].label}
            </Tag>
            {user.status !== 'active' && (
              <Tag color={USER_STATUS[user.status].tone === 'error' ? 'error' : 'warning'} variant="filled" className="!m-0 !rounded-full !text-[11px]">
                {USER_STATUS[user.status].label}
              </Tag>
            )}
          </div>
        </div>
      </div>

      <nav aria-label="Panel menyusı" className="mt-5 flex-1 overflow-y-auto px-3">
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={current ? [current.to] : []}
          onClick={({ key }) => navigate(key)}
          items={nav.map((item) => ({ key: item.to, icon: <Icon name={item.icon} size={20} />, label: item.label }))}
          style={{ background: 'transparent', borderInlineEnd: 0 }}
        />
      </nav>

      <div className="flex flex-col gap-1 border-0 border-t border-solid border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 no-underline transition-colors hover:bg-white/10 hover:text-white">
          <Icon name="globe" size={18} /> Sayttıń bas beti
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Icon name="logout" size={18} /> Shıǵıw
        </button>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen" style={{ background: 'transparent' }}>
      {desktop ? (
        <Sider width={280} theme="dark" style={{ position: 'sticky', top: 0, height: '100vh', background: 'transparent' }}>
          {sidebar}
        </Sider>
      ) : (
        <Drawer placement="left" open={open} onClose={() => setOpen(false)} size={296} closable={false} styles={{ body: { padding: 0 }, wrapper: { maxWidth: '88vw' } }}>
          {sidebar}
        </Drawer>
      )}

      <Layout style={{ background: 'transparent', minWidth: 0 }}>
        <Header
          className="sticky top-0 z-30 flex items-center gap-3 !px-4 md:!px-8"
          style={{ height: 64, lineHeight: 'normal', background: 'rgba(251,250,244,0.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e6e3dc' }}
        >
          {!desktop && (
            <Button shape="circle" aria-label="Menyunı ashıw" aria-expanded={open} onClick={() => setOpen(true)} icon={<Icon name="menu" size={20} />} />
          )}
          <Breadcrumb
            items={[{ title: <Link to="/kabinet" className="text-muted no-underline">Panel</Link> }, ...(current && !current.end ? [{ title: <span className="font-semibold text-ink">{current.label}</span> }] : [])]}
          />
          <div className="ml-auto">
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  { key: 'acc', icon: <Icon name="user" size={18} />, label: 'Akkaunt', onClick: () => navigate('/kabinet/akkaunt') },
                  { key: 'out', icon: <Icon name="logout" size={18} />, label: 'Shıǵıw', danger: true, onClick: logout },
                ],
              }}
            >
              <button type="button" className="flex cursor-pointer items-center gap-2 rounded-full border border-solid border-line bg-white py-1 pl-1 pr-3 text-sm font-medium text-ink shadow-card" aria-label="Akkaunt menyusı">
                <Avatar size={32} style={{ background: gradients.brand, fontWeight: 700 }}>
                  {user.name.slice(0, 1).toUpperCase()}
                </Avatar>
                <span className="hidden max-w-[160px] truncate sm:inline">{user.name}</span>
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content id="content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-8 focus:outline-none md:px-8 md:py-10">
          {pendingNote && (
            <div className="mb-6">
              <Notice tone="warn" icon="clock">
                <strong>Akkauntıńız tekseriwde.</strong> {pendingNote}
              </Notice>
            </div>
          )}
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
