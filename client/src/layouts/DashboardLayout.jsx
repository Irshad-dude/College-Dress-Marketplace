import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdInventory2, MdAddBox, MdChat,
  MdNotifications, MdPerson, MdLogout,
  MdHome, MdStorefront, MdMenu, MdClose,
} from 'react-icons/md';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import NotificationBell from '../components/NotificationBell';
import { getInitials } from '../utils/helpers';
import usePageTitle from '../hooks/usePageTitle';

const ALL_NAV_LINKS = [
  { to: '/dashboard',               icon: MdDashboard,     label: 'DASHBOARD',     roles: null,       end: true },
  { to: '/dashboard/my-products',   icon: MdInventory2,    label: 'MY PRODUCTS',   roles: ['seller'] },
  { to: '/dashboard/add-product',   icon: MdAddBox,        label: 'ADD PRODUCT',   roles: ['seller'] },
  { to: '/dashboard/chat',          icon: MdChat,          label: 'CHAT',          roles: null },
  { to: '/dashboard/notifications', icon: MdNotifications, label: 'NOTIFICATIONS', roles: null },
  { to: '/dashboard/profile',       icon: MdPerson,        label: 'PROFILE',       roles: null },
];

const pageTitles = {
  '/dashboard': 'DASHBOARD',
  '/dashboard/my-products': 'MY PRODUCTS',
  '/dashboard/add-product': 'ADD PRODUCT',
  '/dashboard/chat': 'CHAT',
  '/dashboard/notifications': 'NOTIFICATIONS',
  '/dashboard/profile': 'PROFILE',
};

export default function DashboardLayout() {
  const { logout, user }                        = useAuth();
  const { unreadCount }                         = useNotifications();
  const { unreadMsgCount, clearUnreadMsgCount } = useSocket();
  const navigate    = useNavigate();
  const location    = useLocation();
  const pageTitle   = pageTitles[location.pathname] || 'DASHBOARD';
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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Link
        to="/"
        onClick={closeSidebar}
        className="flex items-center gap-2 px-6 py-6 border-b border-gray-200"
      >
        <span className="font-bold text-2xl uppercase tracking-tighter text-black">DRESSMARKET</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <Link
            to="/" onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 mb-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
          >
            <MdHome size={18} /> BACK TO HOME
          </Link>
          <Link
            to="/products" onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
          >
            <MdStorefront size={18} /> BROWSE LISTINGS
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {navLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => {
                if (label === 'CHAT') clearUnreadMsgCount();
                closeSidebar();
              }}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors',
                  isActive ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'NOTIFICATIONS' && unreadCount > 0 && (
                <span className="ml-auto bg-[#E16E50] text-white text-[10px] px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
              {label === 'CHAT' && unreadMsgCount > 0 && (
                <span className="ml-auto bg-[#E16E50] text-white text-[10px] px-2 py-0.5">
                  {unreadMsgCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-4 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors text-black"
        >
          <MdLogout size={16} /> LOGOUT
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Desktop sidebar (lg+) ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 flex-col z-30 bg-[#F5F5F5] border-r border-gray-200">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ───────────────────────────────────────────── */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Mobile drawer panel ─────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-[280px] flex flex-col z-50 lg:hidden bg-white transition-transform duration-300',
          sideOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={closeSidebar}
          className="absolute top-6 right-4 text-black"
        >
          <MdClose size={24} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen bg-white">
        
        {/* Top bar */}
        <header className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSideOpen(true)}
              className="lg:hidden text-black"
            >
              <MdMenu size={24} />
            </button>
            <h1 className="text-lg font-bold uppercase tracking-widest text-black hidden sm:block">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest hidden md:block text-black">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-10 max-w-[1200px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
