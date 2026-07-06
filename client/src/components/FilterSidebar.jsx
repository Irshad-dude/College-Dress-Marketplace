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
    <aside className="sticky top-[80px] bg-white pr-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black">
        <h2 className="font-bold text-lg uppercase tracking-tighter">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black border-b border-transparent hover:border-black transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Price Range (₹)</h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            placeholder="MIN"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full border-b border-gray-300 px-0 py-2 text-sm focus:outline-none focus:border-black uppercase placeholder:normal-case font-bold transition-colors"
          />
          <span className="text-gray-400 font-bold">-</span>
          <input
            type="number"
            placeholder="MAX"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full border-b border-gray-300 px-0 py-2 text-sm focus:outline-none focus:border-black uppercase placeholder:normal-case font-bold transition-colors"
          />
        </div>
      </div>

      {/* Size */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`min-w-[40px] px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                (filters.sizes || []).includes(size)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Condition</h3>
        <div className="flex flex-col gap-3">
          {CONDITIONS.map((condition) => (
            <label key={condition} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-gray-300 group-hover:border-black transition-colors">
                <input
                  type="checkbox"
                  checked={(filters.conditions || []).includes(condition)}
                  onChange={() => handleConditionToggle(condition)}
                  className="peer absolute w-full h-full opacity-0 cursor-pointer"
                />
                <div className="hidden peer-checked:block w-3 h-3 bg-black"></div>
              </div>
              <span className="text-sm font-medium uppercase tracking-wide text-gray-600 group-hover:text-black transition-colors">
                {condition}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
