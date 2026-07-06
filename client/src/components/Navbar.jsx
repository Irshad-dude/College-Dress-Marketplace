/**
 * Navbar — Veilux-inspired minimal editorial navbar
 * Transparent on top of hero, fills white on scroll.
 */
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdMenu, MdClose, MdPerson, MdDashboard, MdLogout } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const dropdownRef = useRef(null);

  // Scroll detection — fill background after 40px
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinkCls = 'text-sm font-medium tracking-wide transition-colors hover:text-amber-700';

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(250,250,250,0.96)' : '#F7F4F0',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 gap-6">

            {/* ── Logo ─────────────────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex-shrink-0 font-black text-xl tracking-tight"
              style={{ color: '#151414', letterSpacing: '-0.03em' }}
            >
              Dress<span style={{ color: '#B45309' }}>Market</span>
            </Link>

            {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink to="/products" className={navLinkCls} style={({ isActive }) => ({ color: isActive ? '#B45309' : '#767574' })}>
                Browse
              </NavLink>
              {user && (
                <NavLink to="/dashboard" className={navLinkCls} style={({ isActive }) => ({ color: isActive ? '#B45309' : '#767574' })}>
                  Dashboard
                </NavLink>
              )}
            </nav>

            {/* ── Right Actions ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <DarkModeToggle />

              {user ? (
                /* ── User avatar + dropdown ── */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(p => !p)}
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-black/5"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <span className="text-sm font-medium hidden lg:block" style={{ color: '#151414' }}>
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50"
                      style={{
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      }}
                    >
                      <Link to="/dashboard/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <MdPerson /> Profile
                      </Link>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <MdDashboard /> Dashboard
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors">
                        <MdLogout /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Guest CTAs ── */
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login"
                    className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors hover:bg-black/5"
                    style={{ color: '#767574' }}>
                    Login
                  </Link>
                  <Link to="/register"
                    className="text-sm font-semibold px-5 py-2 rounded-xl text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: '#151414' }}>
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
                style={{ color: '#151414' }}
                onClick={() => setMobileOpen(p => !p)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: mobileOpen ? '300px' : '0', opacity: mobileOpen ? 1 : 0 }}
        >
          <div className="px-6 pb-6 pt-2 space-y-2 border-t border-gray-100">
            <Link to="/products" onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-semibold border-b border-gray-100 text-gray-700">
              Browse Listings
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-semibold border-b border-gray-100 text-gray-700">
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block py-3 text-sm font-semibold text-red-500 w-full text-left">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#151414' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
