import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-24 md:pb-12 border-t border-gray-800">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* ── Brand ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-block">
              <span className="font-bold text-2xl tracking-tighter uppercase text-white">
                DRESSMARKET
              </span>
            </Link>
            <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
              India's premier marketplace for college fashion. Buy, sell, and trade uniforms, 
              lab coats, and formal wear with fellow students.
            </p>
          </div>

          {/* ── Quick Links ──────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">Explore</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/products" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">New Arrivals</Link>
              <Link to="/products?sort=trending" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Bestsellers</Link>
              <Link to="/products?search=uniform" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Uniforms</Link>
              <Link to="/products?search=lab+coat" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Lab Coats</Link>
            </nav>
          </div>

          {/* ── Help ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">Help</h4>
            <nav className="flex flex-col gap-3">
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Track Order</Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Returns & Exchanges</Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Shipping Info</Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Contact Us</Link>
            </nav>
          </div>

          {/* ── Legal ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">Legal</h4>
            <nav className="flex flex-col gap-3">
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Terms of Service</Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Privacy Policy</Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide">Refund Policy</Link>
            </nav>
          </div>

        </div>

        {/* ── Bottom Bar ───────────────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 tracking-wide">
            &copy; {new Date().getFullYear()} DRESSMARKET. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
