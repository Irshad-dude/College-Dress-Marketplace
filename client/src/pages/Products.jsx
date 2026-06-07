import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { MdSearch } from 'react-icons/md';

export default function Products() {
  usePageTitle('All Products'); // L25
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const size = searchParams.get('size') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const filters = { size, condition, minPrice, maxPrice };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
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
  }, [search, size, condition, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('search', val); else next.delete('search');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleFilterChange = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    setSearchParams(next);
  };

  const handlePageChange = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onSubmit={(e) => { e.preventDefault(); }}
          placeholder="Search by name, college, department..."
        />
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">
              {loading ? 'Searching...' : `Showing ${total} result${total !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <MdSearch className="text-6xl text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {search ? `No results for "${search}"` : 'No products found'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              {(search || size || condition || minPrice || maxPrice) && (
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="btn-primary text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8">
              <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
