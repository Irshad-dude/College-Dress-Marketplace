import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdArrowForward, MdSearch } from 'react-icons/md';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

/* ─────────────────────────── Intersection observer hook ─────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─────────────────────────── Category data ──────────────────────────────── */
const CATEGORIES = [
  { label: 'Uniforms',    emoji: '👔', href: '/products?search=uniform'  },
  { label: 'Lab Coats',   emoji: '🥼', href: '/products?search=lab+coat' },
  { label: 'Blazers',     emoji: '🧥', href: '/products?search=blazer'   },
  { label: 'Sarees',      emoji: '🪭', href: '/products?search=saree'    },
  { label: 'Kurtas',      emoji: '👘', href: '/products?search=kurta'    },
  { label: 'Formal Sets', emoji: '👗', href: '/products?search=formal'   },
];

/* ─────────────────────────── Sub-components ─────────────────────────────── */
function RevealSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════ HOME PAGE ══════════════════════════════════════ */
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getProducts({ limit: 8, status: 'available' })
      .then(r => setProducts(r.data.products || r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div style={{ background: '#FAFAFA', color: '#525150' }}>

      {/* ══════════════════════════ HERO ══════════════════════════════════════ */}
      <section style={{ background: '#F7F4F0' }} className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-0 min-h-[90vh] items-center">

          {/* Left — text */}
          <div className="py-24 lg:py-0 lg:pr-12 order-2 lg:order-1">
            <RevealSection delay={0}>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-amber-900 mb-6">
                College Dress Marketplace
              </p>
            </RevealSection>

            <RevealSection delay={80}>
              <h1
                className="font-black leading-none mb-8"
                style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em', color: '#151414' }}
              >
                Dress<br />
                <span style={{ color: '#B45309' }}>Smart,</span><br />
                Save More.
              </h1>
            </RevealSection>

            <RevealSection delay={160}>
              <p className="text-base lg:text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
                Buy &amp; sell college uniforms, lab coats, and formals directly with
                students in your campus community. Zero commission, instant chat.
              </p>
            </RevealSection>

            {/* Search bar */}
            <RevealSection delay={220}>
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-10">
                <div className="relative flex-1">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search uniforms, blazers…"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: '#B45309' }}
                >
                  Search
                </button>
              </form>
            </RevealSection>

            <RevealSection delay={280}>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: '#151414' }}
                >
                  Shop Now <MdArrowForward />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold border border-gray-300 hover:border-gray-900 transition-all hover:scale-105 active:scale-95"
                  style={{ color: '#151414', background: 'white' }}
                >
                  Sell a Dress
                </Link>
              </div>
            </RevealSection>

            {/* Stats strip */}
            <RevealSection delay={360}>
              <div className="flex gap-8 mt-14 pt-8 border-t border-gray-200">
                {[['500+', 'Listings'], ['200+', 'Students'], ['50+', 'Colleges']].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-2xl font-black" style={{ color: '#151414' }}>{n}</p>
                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{l}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>

          {/* Right — hero image */}
          <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
            <div
              className="relative w-full max-w-sm lg:max-w-none"
              style={{ aspectRatio: '3/4' }}
            >
              {/* Background accent */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'linear-gradient(145deg, #F5E6D3 0%, #EDD9C0 100%)',
                  transform: 'translate(16px, 16px)',
                }}
              />
              <img
                src="/hero.png"
                alt="College fashion"
                className="relative w-full h-full object-cover rounded-3xl shadow-2xl"
                style={{ objectPosition: 'top center' }}
              />
              {/* Floating badge */}
              <div
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3"
              >
                <span className="text-2xl">🎓</span>
                <div>
                  <p className="text-xs font-bold text-gray-900">Campus Deals</p>
                  <p className="text-[11px] text-gray-400">From ₹199 onwards</p>
                </div>
              </div>
              {/* Top badge */}
              <div
                className="absolute -top-4 -right-4 bg-amber-800 text-white rounded-2xl px-4 py-2.5 shadow-xl text-center"
              >
                <p className="text-xs font-bold">100%</p>
                <p className="text-[11px] opacity-90">FREE Listing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ MARQUEE STRIP ════════════════════════════ */}
      <div
        className="py-4 overflow-hidden"
        style={{ background: '#151414' }}
      >
        <div
          className="flex gap-12 whitespace-nowrap text-xs font-semibold text-white/60 tracking-widest uppercase"
          style={{
            animation: 'marquee 18s linear infinite',
          }}
        >
          {Array(3).fill(['🎓 Free Listings', '⚡ Instant Chat', '🔒 Verified Students', '👗 100+ Categories', '🏫 50+ Colleges', '💰 Save up to 80%']).flat().map((t, i) => (
            <span key={i} className="flex-shrink-0">{t}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
      </div>

      {/* ══════════════════════════ CATEGORIES ═══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <RevealSection>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-amber-900 mb-3">Browse By</p>
              <h2 className="text-4xl lg:text-5xl font-black" style={{ letterSpacing: '-0.02em', color: '#151414' }}>
                Categories
              </h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              All listings <MdArrowForward />
            </Link>
          </div>
        </RevealSection>

        {/* 3-column grid — first card is large (spans 2 rows) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px]">
          {CATEGORIES.map((cat, i) => (
            <RevealSection key={cat.label} delay={i * 50} className={i === 0 ? 'row-span-2' : ''}>
              <Link
                to={cat.href}
                className="flex flex-col justify-end p-6 h-full rounded-2xl relative overflow-hidden group"
                style={{
                  background: i === 0 ? '#151414' : i % 2 === 1 ? '#F7F4F0' : '#FEF3C7',
                  color: i === 0 ? 'white' : '#151414',
                }}
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                <p className="font-bold text-lg">{cat.label}</p>
                <p className="text-xs opacity-60 mt-1 flex items-center gap-1">
                  Shop now <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                </p>
                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
              </Link>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ LATEST LISTINGS ══════════════════════════ */}
      <section style={{ background: '#F7F4F0' }} className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <RevealSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-amber-900 mb-3">Fresh Arrivals</p>
                <h2 className="text-4xl lg:text-5xl font-black" style={{ letterSpacing: '-0.02em', color: '#151414' }}>
                  Latest Listings
                </h2>
              </div>
              <Link to="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                View all <MdArrowForward />
              </Link>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {loading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p, i) => (
                  <RevealSection key={p._id} delay={i * 40}>
                    <ProductCard product={p} />
                  </RevealSection>
                ))
            }
          </div>

          {!loading && products.length === 0 && (
            <RevealSection>
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🎓</p>
                <p className="text-lg font-bold mb-2 text-gray-900">No listings yet</p>
                <p className="text-gray-400 mb-6">Be the first to list a product!</p>
                <Link to="/dashboard/add-product" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#151414' }}>
                  Add First Listing <MdArrowForward />
                </Link>
              </div>
            </RevealSection>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900">
              View all listings <MdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ HOW IT WORKS ═════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <RevealSection>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-amber-900 mb-3">Simple Process</p>
            <h2 className="text-4xl lg:text-5xl font-black" style={{ letterSpacing: '-0.02em', color: '#151414' }}>
              How It Works
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '01', icon: '📸', title: 'List Your Dress', desc: 'Snap a few photos, set a price, and post your college uniform in under 2 minutes.' },
            { n: '02', icon: '💬', title: 'Connect Directly', desc: 'Chat in real-time with interested buyers. No middlemen, no delays, no fees.' },
            { n: '03', icon: '💰', title: 'Complete the Deal', desc: 'Meet on campus, hand over the dress, collect your cash. Done.' },
          ].map((step, i) => (
            <RevealSection key={step.n} delay={i * 100}>
              <div
                className="p-8 rounded-2xl group hover:-translate-y-2 transition-all duration-300"
                style={{ background: i === 1 ? '#151414' : '#F7F4F0', color: i === 1 ? 'white' : '#151414' }}
              >
                <p className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{step.icon}</p>
                <p className="text-sm font-bold tracking-widest opacity-40 mb-2">{step.n}</p>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed opacity-60">{step.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ EDITORIAL BANNER ═════════════════════════ */}
      <section
        className="relative overflow-hidden py-32 px-6"
        style={{ background: '#B45309' }}
      >
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }} />
        <RevealSection className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase opacity-70 mb-5">For Sellers</p>
          <h2
            className="font-black leading-none mb-8"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
          >
            Got a Dress<br />to Sell?
          </h2>
          <p className="text-lg opacity-80 mb-12 max-w-xl mx-auto">
            List for free. Reach hundreds of students in your college.
            Turn that old uniform into cash in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 bg-white px-10 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ color: '#B45309' }}
          >
            Start Selling Free <MdArrowForward className="text-xl" />
          </Link>
        </RevealSection>
      </section>

      {/* ══════════════════════════ TRUST STRIP ══════════════════════════════ */}
      <section style={{ background: '#F7F4F0' }} className="py-16 px-6">
        <RevealSection className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '🔒', title: 'Verified Users', desc: 'Only real college students' },
            { icon: '💬', title: 'Real-time Chat', desc: 'Talk directly, no delays' },
            { icon: '🚀', title: 'Instant Listing', desc: 'Live in under 2 minutes' },
            { icon: '₹0', title: 'Zero Commission', desc: 'Keep 100% of your price' },
          ].map((t, i) => (
            <div key={t.title}>
              <div className="text-3xl mb-3">{t.icon}</div>
              <p className="font-bold text-sm text-gray-900 mb-1">{t.title}</p>
              <p className="text-xs text-gray-400">{t.desc}</p>
            </div>
          ))}
        </RevealSection>
      </section>

    </div>
  );
}
