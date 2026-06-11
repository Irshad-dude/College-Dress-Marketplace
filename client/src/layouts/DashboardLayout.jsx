import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdInventory2, MdAddBox, MdChat,
  MdNotifications, MdPerson, MdLogout,
  MdHome, MdStorefront, MdMenu, MdClose,
} from 'react-icons/md';
import { GiGraduateCap } from 'react-icons/gi';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';
import { getInitials } from '../utils/helpers';
import usePageTitle from '../hooks/usePageTitle';

const ALL_NAV_LINKS = [
  { to: '/dashboard',               icon: MdDashboard,     label: 'Dashboard',     roles: null,       end: true },
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
  const { logout, user }                        = useAuth();
  const { unreadCount }                         = useNotifications();
  const { unreadMsgCount, clearUnreadMsgCount } = useSocket();
  const navigate    = useNavigate();
  const location    = useLocation();
  const pageTitle   = pageTitles[location.pathname] || 'Dashboard';
  const [sideOpen, setSideOpen] = useState(false);

  usePageTitle(pageTitle);

  const navLinks = ALL_NAV_LINKS.filter(
    ({ roles }) => !roles || roles.includes(user?.role)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeSidebar = () => setSideOpen(false);

  // Shared sidebar content — rendered in both desktop aside and mobile drawer
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Link
        to="/"
        onClick={closeSidebar}
        className="flex items-center gap-2 px-6 py-5 hover:opacity-80 transition-opacity"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <GiGraduateCap className="text-amber-500 text-2xl" />
        <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>DressMarket</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {/* Marketplace shortcuts */}
        <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <Link
            to="/" onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 font-medium text-sm transition-all hover:bg-amber-500/10 hover:text-amber-500"
            style={{ color: 'var(--text-muted)' }}
          >
            <MdHome className="text-xl flex-shrink-0" />
            <span>Home</span>
          </Link>
          <Link
            to="/products" onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 font-medium text-sm transition-all hover:bg-amber-500/10 hover:text-amber-500"
            style={{ color: 'var(--text-muted)' }}
          >
            <MdStorefront className="text-xl flex-shrink-0" />
            <span>Browse Listings</span>
          </Link>
        </div>

        {/* Dashboard links */}
        {navLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => {
              if (label === 'Chat') clearUnreadMsgCount();
              closeSidebar();
            }}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 font-medium text-sm transition-all',
                isActive ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-[var(--bg-hover)]'
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
            {label === 'Chat' && unreadMsgCount > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadMsgCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-red-500/10 hover:text-red-500"
          style={{ color: 'var(--text-muted)' }}
        >
          <MdLogout className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      {/* ── Desktop sidebar (lg+) ───────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col z-30"
        style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ───────────────────────────────────────────── */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Mobile drawer panel ─────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-72 flex flex-col z-50 lg:hidden transition-transform duration-300',
          sideOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        {/* Close button */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100"
          style={{ color: 'var(--text-muted)' }}
        >
          <MdClose className="text-2xl" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Top bar */}
        <header
          className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSideOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Open menu"
            >
              <MdMenu className="text-2xl" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <DarkModeToggle />
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <span className="text-sm font-medium hidden md:block" style={{ color: 'var(--text)' }}>
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
