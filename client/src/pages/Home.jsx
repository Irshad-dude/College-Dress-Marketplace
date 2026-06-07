import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdSearch, MdTrendingUp, MdPeople, MdSchool, MdArrowForward } from 'react-icons/md';
import { GiGraduateCap } from 'react-icons/gi';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { PRODUCT_TYPES } from '../constants';

const steps = [
  { icon: '📸', title: 'List Your Dress', desc: 'Take photos and post your college uniform in minutes.' },
  { icon: '💬', title: 'Connect with Buyers', desc: 'Chat directly with interested juniors. No middlemen.' },
  { icon: '💰', title: 'Complete the Sale', desc: 'Meet up, hand over the dress, and earn money.' },
];

const stats = [
  { icon: <MdTrendingUp />, label: '500+ Listings', color: '#F59E0B' },
  { icon: <MdPeople />,     label: '200+ Students', color: '#10B981' },
  { icon: <MdSchool />,     label: '50+ Colleges',  color: '#3B82F6' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getProducts({ limit: 8, status: 'available' })
      .then((res) => setProducts(res.data.products || res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div style={{ color: 'var(--text)' }}>

      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 40%, #FDE68A 80%, #F59E0B 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #FCD34D, transparent)' }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-25 animate-float"
          style={{ background: '#F59E0B', animationDelay: '2s' }} />

        <div className="max-w-4xl mx-auto px-4 py-28 text-center relative z-10">
          {/* Badge */}
          <div className="reveal-up inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <GiGraduateCap className="text-amber-500 text-lg" />
            <span className="text-sm font-medium text-amber-700">College Dress Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="reveal-up text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 leading-tight" style={{ animationDelay: '80ms' }}>
            Buy &amp; Sell<br />
            <span className="text-amber-600">College Dresses</span>
          </h1>

          <p className="reveal-up text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto" style={{ animationDelay: '160ms' }}>
            Connect with seniors. Save money. Pass it on.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="reveal-up flex max-w-xl mx-auto gap-2 mb-10"
            style={{ animationDelay: '240ms' }}
          >
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search uniforms, lab coats, blazers..."
                className="input pl-10 shadow-md"
                style={{ backgroundColor: 'white', color: '#111827' }}
              />
            </div>
            <button type="submit" className="btn-primary shadow-md pulse-glow">
              Search
            </button>
          </form>

          {/* CTAs */}
          <div className="reveal-up flex flex-col sm:flex-row gap-3 justify-center mb-12" style={{ animationDelay: '320ms' }}>
            <Link to="/products" className="btn-primary text-base px-8 py-3 shadow-lg">
              Browse Listings
            </Link>
            <Link to="/dashboard/add-product" className="btn-secondary text-base px-8 py-3 shadow"
              style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#92400E' }}>
              Sell Your Dress
            </Link>
          </div>

          {/* Stats */}
          <div className="reveal-up flex flex-wrap justify-center gap-8" style={{ animationDelay: '400ms' }}>
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-2xl" style={{ color: s.color }}>{s.icon}</span>
                <span className="font-bold text-gray-700">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-14 reveal-up">
          <span className="text-amber-500 text-sm font-semibold uppercase tracking-widest">Simple Process</span>
          <h2 className="text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>How It Works</h2>
          <p style={{ color: 'var(--text-muted)' }}>Three simple steps to buy or sell</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
          {steps.map((step, i) => (
            <div key={i} className="card p-8 text-center reveal-scale group hover:-translate-y-1 transition-transform duration-300">
              <div className="text-6xl mb-5 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Latest Products ─── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-hover)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12 reveal-up">
            <div>
              <span className="text-amber-500 text-sm font-semibold uppercase tracking-widest">Fresh Arrivals</span>
              <h2 className="text-4xl font-bold mt-1" style={{ color: 'var(--text)' }}>Latest Listings</h2>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1 text-amber-500 font-semibold hover:text-amber-600 transition-colors group"
            >
              View All
              <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 stagger">
            {loading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>

          {!loading && products.length === 0 && (
            <div className="text-center py-16 reveal-up">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>No listings yet</p>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Be the first to list a product!</p>
              <Link to="/dashboard/add-product" className="btn-primary">Add First Listing</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-12 reveal-up">
          <span className="text-amber-500 text-sm font-semibold uppercase tracking-widest">Categories</span>
          <h2 className="text-4xl font-bold mt-2 mb-2" style={{ color: 'var(--text)' }}>Browse by Type</h2>
          <p style={{ color: 'var(--text-muted)' }}>Find exactly what you need</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center stagger">
          {PRODUCT_TYPES.map((type) => (
            <Link
              key={type}
              to={`/products?type=${encodeURIComponent(type)}`}
              className="reveal-scale px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F59E0B';
                e.currentTarget.style.color = '#D97706';
                e.currentTarget.style.backgroundColor = '#FFFBEB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
            >
              {type}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10 reveal-up">
          <h2 className="text-4xl font-bold text-white mb-4">Got a Dress to Sell?</h2>
          <p className="text-amber-100 mb-10 text-lg">
            List it for free and connect with students who need it most.
          </p>
          <Link
            to="/dashboard/add-product"
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold py-4 px-10 rounded-2xl hover:bg-amber-50 transition-all duration-200 hover:scale-105 shadow-xl pulse-glow"
          >
            Start Selling <MdArrowForward className="text-xl" />
          </Link>
        </div>
      </section>
    </div>
  );
}
