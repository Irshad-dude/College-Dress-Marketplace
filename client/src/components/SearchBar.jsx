import { MdSearch } from 'react-icons/md';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search listings...' }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input pl-10"
        />
      </div>
      <button type="submit" className="btn-primary flex-shrink-0">
        Search
      </button>
    </form>
  );
}
