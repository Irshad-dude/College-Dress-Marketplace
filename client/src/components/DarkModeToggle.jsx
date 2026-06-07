import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useDarkMode } from '../hooks/useDarkMode';

export default function DarkModeToggle({ className = '' }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative w-10 h-10 rounded-xl flex items-center justify-center
        transition-all duration-200
        bg-[var(--bg-hover)] hover:bg-[var(--border)]
        text-[var(--text-muted)] hover:text-[var(--text)]
        ${className}
      `}
    >
      <span
        className="text-xl transition-all duration-300"
        style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        {isDark ? <MdLightMode className="text-amber-400" /> : <MdDarkMode />}
      </span>
    </button>
  );
}
