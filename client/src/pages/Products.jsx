import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import FilterSidebar from '../components/FilterSidebar';
import { MdSearch, MdKeyboardArrowDown } from 'react-icons/md';

export default function Products() {
  usePageTitle('Shop All');
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const size = searchParams.get('size') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const filters = { 
    sizes: size ? size.split(',') : [], 
    conditions: condition ? condition.split(',') : [], 
    minPrice, 
    maxPrice 
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 16, sort };
      if (search) params.search = search;
      if (size) params.size = size;
      if (condition) params.condition = condition;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await getProducts(params);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, size, condition, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.search.value;
    const next = new URLSearchParams(searchParams);
    if (val) next.set('search', val); else next.delete('search');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleFilterChange = (newFilters) => {
    const next = new URLSearchParams(searchParams);
    
    if (newFilters.sizes && newFilters.sizes.length > 0) next.set('size', newFilters.sizes.join(','));
    else next.delete('size');
    
    if (newFilters.conditions && newFilters.conditions.length > 0) next.set('condition', newFilters.conditions.join(','));
    else next.delete('condition');
    
    if (newFilters.minPrice) next.set('minPrice', newFilters.minPrice);
    else next.delete('minPrice');
    
    if (newFilters.maxPrice) next.set('maxPrice', newFilters.maxPrice);
    else next.delete('maxPrice');
    
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    next.set('page', '1');
    setSearchParams(next);
    setIsSortOpen(false);
  };

  const loadMore = () => {
    if (page < pages) {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(page + 1));
      setSearchParams(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const sortOptions = [
    { value: 'newest', label: "WHAT'S NEW" },
    { value: 'trending', label: "BESTSELLERS" },
    { value: 'price_asc', label: "PRICE: LOW TO HIGH" },
    { value: 'price_desc', label: "PRICE: HIGH TO LOW" },
  ];
  
  const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || "WHAT'S NEW";

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 md:py-12">
      
      {/* ── Page Header & Search ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 pb-6 border-b border-gray-200">
        <div className="w-full md:w-auto mb-6 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2">
            {search ? `Search: ${search}` : 'SHOP ALL'}
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {total} PRODUCTS FOUND
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <input
            name="search"
            defaultValue={search}
            placeholder="SEARCH PRODUCTS..."
            className="w-full border-b-2 border-black py-3 pl-0 pr-10 text-sm focus:outline-none focus:border-[#E16E50] uppercase placeholder:normal-case font-bold tracking-wider transition-colors bg-transparent"
          />
          <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-black hover:text-[#E16E50] transition-colors p-2">
            <MdSearch size={24} />
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* ── Sidebar Filters ───────────────────────────────────────── */}
        <div className="hidden md:block w-64 lg:w-72 shrink-0">
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* ── Main Content Grid ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          
          {/* Controls Bar */}
          <div className="flex justify-between items-center mb-6">
            {/* Mobile Filter Toggle placeholder (would expand full-screen modal ideally) */}
            <button className="md:hidden text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4">
              Filters
            </button>
            
            {/* Sort Dropdown */}
            <div className="relative ml-auto">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                SORT BY: <span className="text-[#E16E50]">{currentSortLabel}</span>
                <MdKeyboardArrowDown size={18} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black shadow-lg z-20">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors ${sort === option.value ? 'bg-black text-white hover:bg-black' : 'text-black'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-gray-300">
              <span className="text-6xl opacity-20 mb-6">🔍</span>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-2">No Products Found</h3>
              <p className="text-sm text-gray-500 max-w-md">Try adjusting your search terms or clearing some filters to find what you're looking for.</p>
              <button 
                onClick={() => setSearchParams(new URLSearchParams())}
                className="mt-8 btn-primary text-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              
              {/* Pagination / Load More */}
              {pages > 1 && (
                <div className="mt-16 flex justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      PAGE {page} OF {pages}
                    </p>
                    <div className="flex gap-2">
                      {Array.from({ length: pages }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.set('page', String(pageNum));
                            setSearchParams(next);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-colors ${
                            page === pageNum 
                              ? 'bg-black text-white' 
                              : 'bg-gray-100 text-black hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
