import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdSearch, MdClose, MdMenu, MdPerson, MdLogout, MdDashboard, MdHome, MdExplore, MdAdd, MdChat } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { getInitials } from '../utils/helpers';
import clsx from 'clsx';

const NAV_LINKS = [
  { label: 'SHOP ALL', href: '/products' },
  { label: 'NEW ARRIVALS', href: '/products?sort=newest' },
  { label: 'UNIFORMS', href: '/products?search=uniform' },
  { label: 'BLAZERS', href: '/products?search=blazer' },
  { label: 'SAREES', href: '/products?search=saree' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#E16E50' : '#000000',
    borderBottom: isActive ? '2px solid #E16E50' : '2px solid transparent',
  });

  const baseNavLinkClass = "py-1.5 text-xs font-bold tracking-[0.1em] transition-colors hover:text-[#E16E50]";

  return (
    <>
      {/* ── Top Announcement Marquee ──────────────────────────────────── */}
      <div className="hidden md:block w-full bg-black text-white h-8 overflow-hidden relative">
        <div className="absolute whitespace-nowrap flex items-center h-full animate-marquee">
          <span className="text-[10px] font-bold tracking-widest px-8">
            FREE SHIPPING ON ORDERS ABOVE ₹500 • SELL YOUR CLOTHES TODAY • COLLEGE DEALS EVERY WEEK • TRUSTED BY 1000+ STUDENTS •
            FREE SHIPPING ON ORDERS ABOVE ₹500 • SELL YOUR CLOTHES TODAY • COLLEGE DEALS EVERY WEEK • TRUSTED BY 1000+ STUDENTS •
            FREE SHIPPING ON ORDERS ABOVE ₹500 • SELL YOUR CLOTHES TODAY • COLLEGE DEALS EVERY WEEK • TRUSTED BY 1000+ STUDENTS
          </span>
        </div>
      </div>

      {/* ── Main Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 text-black"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="font-bold text-2xl tracking-tighter text-black uppercase">
                Dress<span className="text-black">Market</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex flex-1 justify-center gap-8">
              {NAV_LINKS.map(link => (
                <NavLink 
                  key={link.label} 
                  to={link.href} 
                  style={navLinkStyle}
                  className={baseNavLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              <form onSubmit={handleSearch} className="hidden md:flex relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 xl:w-64 border-b border-black py-1 pl-2 pr-8 text-xs focus:outline-none bg-transparent placeholder-gray-400"
                />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 text-black hover:text-[#E16E50] transition-colors">
                  <MdSearch size={18} />
                </button>
              </form>

              {user ? (
                <>
                  <NotificationBell />
                  
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      className="flex items-center gap-2 p-1 border border-black hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-black flex items-center justify-center text-white text-[10px] font-bold">
                        {getInitials(user.name)}
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg py-1 text-sm font-medium z-50">
                        <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider truncate">
                          {user.email}
                        </div>
                        <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-black hover:bg-gray-50 transition-colors uppercase tracking-wide text-xs">
                          <MdDashboard size={16} /> Dashboard
                        </Link>
                        <Link to="/dashboard/profile" className="flex items-center gap-2 px-4 py-2.5 text-black hover:bg-gray-50 transition-colors uppercase tracking-wide text-xs">
                          <MdPerson size={16} /> Profile
                        </Link>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => logout()}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-black hover:bg-gray-50 transition-colors uppercase tracking-wide text-xs text-left"
                        >
                          <MdLogout size={16} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-black hover:text-[#E16E50] transition-colors">
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg pb-6 px-4 z-50">
            <form onSubmit={handleSearch} className="relative mt-4 mb-6">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b border-black py-2 pl-2 pr-8 text-sm focus:outline-none bg-transparent placeholder-gray-400"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-black">
                <MdSearch size={20} />
              </button>
            </form>
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.label} 
                  to={link.href}
                  className="text-sm font-bold uppercase tracking-widest text-black border-b border-gray-100 pb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col gap-3 mt-2">
                  <Link to="/login" className="btn-secondary w-full py-3" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary w-full py-3" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────────── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-[65px] bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom pb-2 pt-1" 
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          
          <NavLink to="/" className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isActive ? "text-[#E16E50]" : "text-gray-500 hover:text-black")}>
            <MdHome size={22} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
          </NavLink>
          
          <NavLink to="/products" className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isActive ? "text-[#E16E50]" : "text-gray-500 hover:text-black")}>
            <MdExplore size={22} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Explore</span>
          </NavLink>

          <Link to={user ? "/dashboard/add-product" : "/login"} className={clsx("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", window.location.pathname.includes('add-product') ? "text-[#E16E50]" : "text-gray-500 hover:text-black")}>
            <div className="bg-black text-white p-1 mb-0.5 rounded-none flex items-center justify-center">
              <MdAdd size={16} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider">Sell</span>
          </Link>

          <NavLink to={user ? "/dashboard/chat" : "/login"} className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isActive ? "text-[#E16E50]" : "text-gray-500 hover:text-black")}>
            <div className="relative">
              <MdChat size={22} />
              {/* Optional unread indicator here */}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider">Chat</span>
          </NavLink>

          <NavLink to={user ? "/dashboard/profile" : "/login"} className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isActive ? "text-[#E16E50]" : "text-gray-500 hover:text-black")}>
            <MdPerson size={22} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
          </NavLink>

        </div>
      </nav>
    </>
  );
}
