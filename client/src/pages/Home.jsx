import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdArrowForward, MdSchool, MdVerified, MdLocalShipping, MdStar } from 'react-icons/md';
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

/* ─────────────────────────── Category data ──────────────────────────────── */
const CATEGORIES = [
  { label: 'Uniforms',    href: '/products?search=uniform', bg: '#F5F5F5', text: '#000' },
  { label: 'Lab Coats',   href: '/products?search=lab+coat', bg: '#000', text: '#FFF' },
  { label: 'Blazers',     href: '/products?search=blazer', bg: '#F5F5F5', text: '#000' },
  { label: 'Sarees',      href: '/products?search=saree', bg: '#000', text: '#FFF' },
  { label: 'Kurtas',      href: '/products?search=kurta', bg: '#F5F5F5', text: '#000' },
  { label: 'Formal Sets', href: '/products?search=formal', bg: '#000', text: '#FFF' },
];

const HERO_SLIDES = [
  {
    bg: '#000',
    title: 'COLLEGE\nFASHION\nMARKETPLACE',
    buttonText: 'SHOP NOW',
    textColor: 'text-white',
    btnClass: 'bg-white text-black hover:bg-gray-200'
  },
  {
    bg: '#F5F5F5',
    title: 'SELL YOUR\nCLOTHES',
    buttonText: 'START SELLING',
    textColor: 'text-black',
    btnClass: 'bg-[#E16E50] text-white hover:bg-[#D45E3F]'
  },
  {
    bg: '#E16E50',
    title: 'NEW\nARRIVALS',
    buttonText: 'BROWSE',
    textColor: 'text-white',
    btnClass: 'bg-black text-white hover:bg-gray-900'
  }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getProducts({ limit: 8, status: 'available' })
      .then(r => setProducts(r.data.products || r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* ── 1. HERO CAROUSEL ────────────────────────────────────────────── */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex flex-col justify-center px-6 md:px-16 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ backgroundColor: slide.bg }}
          >
            <div className="max-w-[1500px] w-full mx-auto">
              <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter leading-[0.9] whitespace-pre-line mb-8 ${slide.textColor}`}>
                {slide.title}
              </h1>
              <Link 
                to="/products"
                className={`inline-block px-8 py-4 font-bold uppercase tracking-widest text-sm transition-transform hover:scale-105 ${slide.btnClass}`}
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── 2. CATEGORY STRIP ─────────────────────────────────────────────── */}
      <RevealSection className="py-16 md:py-24">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 text-center mb-10">
            Shop By Category
          </h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:gap-6 pb-4 md:grid md:grid-cols-6 md:overflow-visible md:pb-0">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                to={cat.href}
                className="snap-center shrink-0 w-48 md:w-auto aspect-[3/4] flex items-center justify-center p-6 transition-transform hover:scale-105"
                style={{ backgroundColor: cat.bg }}
              >
                <span 
                  className="font-bold uppercase tracking-widest text-lg md:text-xl text-center"
                  style={{ color: cat.text }}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── 3. TRENDING NOW ──────────────────────────────────────────────── */}
      <RevealSection className="py-16 bg-white">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">Trending Now</h2>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Most popular items this week</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map(product => <ProductCard key={product._id} product={product} />)
            }
          </div>
          
          <div className="mt-16 text-center">
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-[#E16E50] hover:border-[#E16E50] transition-colors"
            >
              View All Products <MdArrowForward />
            </Link>
          </div>
        </div>
      </RevealSection>

      {/* ── 4. PROMOTIONAL SPLIT ─────────────────────────────────────────── */}
      <RevealSection className="py-16 md:py-24">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Left Col */}
            <div className="flex-1 bg-black text-white p-12 md:p-16 flex flex-col justify-center min-h-[400px]">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-none mb-6">
                SELL YOUR<br/>COLLEGE<br/>CLOTHES
              </h2>
              <p className="text-gray-400 mb-8 max-w-sm">
                Turn your old uniforms and lab coats into cash. Join thousands of students already selling on our platform.
              </p>
              <div>
                <Link to="/dashboard/add-product" className="inline-block bg-white text-black font-bold uppercase tracking-widest px-8 py-4 text-sm hover:bg-gray-200 transition-colors">
                  List Now &rarr;
                </Link>
              </div>
            </div>
            
            {/* Right Col */}
            <div className="flex-1 bg-[#F5F5F5] text-black p-12 md:p-16 flex flex-col justify-center min-h-[400px]">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-none mb-6">
                FIND YOUR<br/>SIZE
              </h2>
              <p className="text-gray-600 mb-8 max-w-sm">
                From XS to 6XL, we have sizes that fit everyone. Browse our inclusive collection of college wear.
              </p>
              <div>
                <Link to="/products" className="inline-block bg-black text-white font-bold uppercase tracking-widest px-8 py-4 text-sm hover:bg-gray-800 transition-colors">
                  Browse &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── 5. TRUST STRIP ──────────────────────────────────────────────── */}
      <RevealSection className="bg-black py-16">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="flex flex-col items-center gap-3">
              <MdSchool className="text-4xl text-[#E16E50]" />
              <span className="text-sm font-bold uppercase tracking-widest">1000+ Sellers</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MdStar className="text-4xl text-[#E16E50]" />
              <span className="text-sm font-bold uppercase tracking-widest">5000+ Products</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MdLocalShipping className="text-4xl text-[#E16E50]" />
              <span className="text-sm font-bold uppercase tracking-widest">Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MdVerified className="text-4xl text-[#E16E50]" />
              <span className="text-sm font-bold uppercase tracking-widest">Verified Users</span>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── 6. NEWSLETTER ────────────────────────────────────────────────── */}
      <RevealSection className="py-24 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold uppercase tracking-tighter mb-4">Join The Community</h2>
          <p className="text-gray-500 mb-8">Get notified about new listings, exclusive deals, and campus drops.</p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="flex-1 border border-black px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black uppercase placeholder:normal-case font-bold tracking-wider"
              required
            />
            <button type="submit" className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </RevealSection>

    </div>
  );
}
