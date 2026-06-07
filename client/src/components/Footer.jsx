import { Link } from 'react-router-dom';
import { GiGraduateCap } from 'react-icons/gi';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + Tagline */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <GiGraduateCap className="text-amber-500 text-2xl" />
              <span className="font-bold text-gray-900 text-lg">
                Dress<span className="text-amber-500">Market</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 italic">Where seniors meet juniors</p>
          </div>

          {/* Links */}
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link to="#" className="hover:text-amber-600 transition-colors">About</Link>
            <Link to="#" className="hover:text-amber-600 transition-colors">Contact</Link>
            <Link to="#" className="hover:text-amber-600 transition-colors">Privacy</Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 DressMarket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
