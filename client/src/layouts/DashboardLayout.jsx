import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdInventory2,
  MdAddBox,
  MdChat,
  MdNotifications,
  MdPerson,
  MdLogout,
} from 'react-icons/md';
import { GiGraduateCap } from 'react-icons/gi';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';
import { getInitials } from '../utils/helpers';
import usePageTitle from '../hooks/usePageTitle';

// L26: Split nav links by role
const ALL_NAV_LINKS = [
  { to: '/dashboard',               icon: MdDashboard,     label: 'Dashboard',     roles: null, end: true },
  { to: '/dashboard/my-products',   icon: MdInventory2,    label: 'My Products',   roles: ['seller'] },
  { to: '/dashboard/add-product',   icon: MdAddBox,        label: 'Add Product',   roles: ['seller'] },
  { to: '/dashboard/chat',          icon: MdChat,          label: 'Chat',          roles: null },
  { to: '/dashboard/notifications', icon: MdNotifications, label: 'Notifications', roles: null },
  { to: '/dashboard/profile',       icon: MdPerson,        label: 'Profile',       roles: null },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/my-products': 'My Products',
  '/dashboard/add-product': 'Add Product',
  '/dashboard/chat': 'Chat',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/profile': 'Profile',
};

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const { unreadCount }  = useNotifications();
  const navigate  = useNavigate();
  const location  = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  // L25: Set browser tab title
  usePageTitle(pageTitle);

  // L26: Filter nav links by role — buyers don't see seller-only links
  const navLinks = ALL_NAV_LINKS.filter(
    ({ roles }) => !roles || roles.includes(user?.role)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full w-60 flex flex-col z-30"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-6 py-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <GiGraduateCap className="text-amber-500 text-2xl" />
          <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
            DressMarket
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 font-medium text-sm transition-all duration-150',
                  isActive
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'hover:bg-[var(--bg-hover)]'
                )
              }
              style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-muted)' })}
            >
              <Icon className="text-xl flex-shrink-0" />
              <span>{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 hover:bg-red-500/10 hover:text-red-500"
            style={{ color: 'var(--text-muted)' }}
          >
            <MdLogout className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(user?.name)}
              </div>
              <span
                className="text-sm font-medium hidden md:block"
                style={{ color: 'var(--text)' }}
              >
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
