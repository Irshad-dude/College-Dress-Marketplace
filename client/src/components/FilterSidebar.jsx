import { SIZES, CONDITIONS } from '../constants';

export default function FilterSidebar({ filters, onFilterChange }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSizeToggle = (size) => {
    const current = filters.sizes || [];
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    handleChange('sizes', updated);
  };

  const handleConditionToggle = (condition) => {
    const current = filters.conditions || [];
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    handleChange('conditions', updated);
  };

  const clearFilters = () => {
    onFilterChange({ sizes: [], conditions: [], minPrice: '', maxPrice: '' });
  };

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-xs text-amber-500 hover:text-amber-600 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range (₹)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                (filters.sizes || []).includes(size)
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Condition</h3>
        <div className="space-y-2">
          {CONDITIONS.map((condition) => (
            <label key={condition} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.conditions || []).includes(condition)}
                onChange={() => handleConditionToggle(condition)}
                className="accent-amber-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700">{condition}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
