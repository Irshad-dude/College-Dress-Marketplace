import { Link } from 'react-router-dom';
import { MdBusiness } from 'react-icons/md';
import clsx from 'clsx';
import { formatPrice, truncate, getInitials } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { _id, images, title, collegeName, size, condition, price, status, seller } = product;
  const imageUrl = images?.[0] || null;

  return (
    <Link
      to={`/products/${_id}`}
      className="card flex flex-col overflow-hidden group hover:scale-[1.02] transition-all duration-200 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-amber-100">
            <span className="text-5xl">👗</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
              status === 'available'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            )}
          >
            {status === 'available' ? 'Available' : 'Sold'}
          </span>
        </div>
        {/* Sold overlay */}
        {status === 'sold' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-wide rotate-[-12deg] border-2 border-white px-3 py-1 rounded">
              SOLD
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
          {truncate(title, 50)}
        </h3>

        {/* College */}
        {collegeName && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MdBusiness className="flex-shrink-0" />
            <span className="truncate">{collegeName}</span>
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {size && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md font-medium">
              {size}
            </span>
          )}
          {condition && (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-md font-medium">
              {condition}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto pt-2">
          <p className="text-amber-800 font-bold text-lg">{formatPrice(price)}</p>
        </div>

        {/* Seller */}
        {seller && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(seller.name)}
            </div>
            <span className="text-xs text-gray-500 truncate">{seller.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
