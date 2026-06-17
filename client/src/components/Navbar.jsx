import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiGraduateCap } from 'react-icons/gi';
import { MdSearch, MdMenu, MdClose, MdPerson, MdDashboard, MdLogout } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
      }}
      className="sticky top-0 z-50 transition-shadow duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <GiGraduateCap className="text-amber-500 text-3xl" />
            <span className="font-bold text-xl hidden sm:block" style={{ color: 'var(--text)' }}>
              Dress<span className="text-amber-500">Market</span>
            </span>
          </Link>

          {/* Search Bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xl"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="     Search dresses, uniforms, lab coats..."
                className="input pl-20"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              />
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-medium hidden lg:block" style={{ color: 'var(--text)' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm themed-hover transition-colors"
                      style={{ color: 'var(--text)' }}
                    >
                      <MdPerson /> Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm themed-hover transition-colors"
                      style={{ color: 'var(--text)' }}
                    >
                      <MdDashboard /> Dashboard
                    </Link>
                    <hr style={{ borderColor: 'var(--border)' }} className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <MdLogout /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold hover:text-amber-500 transition-colors px-3 py-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg themed-hover transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="md:hidden py-4 space-y-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <form onSubmit={handleSearch} className="px-1">
              <div className="relative">
                <MdSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xl"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="input pl-10"
                />
              </div>
            </form>
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="block px-1 py-2 text-sm font-medium hover:text-amber-500 transition-colors"
              style={{ color: 'var(--text)' }}
            >
              Browse Listings
            </Link>
            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-1 py-2 text-sm font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block btn-primary text-center text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
