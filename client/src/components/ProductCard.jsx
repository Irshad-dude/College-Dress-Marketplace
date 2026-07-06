/**
 * ProductCard — Snitch-inspired product card
 * Features: hover zoom (scale 1.03), clean borderless design,
 * size pill, condition badge, bold price, seller avatar.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import clsx from 'clsx';
import { formatPrice, truncate, getInitials } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { _id, images, title, collegeName, size, condition, price, status, seller } = product;
  const img1 = images?.[0] || null;
  const img2 = images?.[1] || null; // second image for hover swap
  const [liked, setLiked] = useState(false);

  return (
    <Link
      to={`/products/${_id}`}
      className="group relative flex flex-col bg-white overflow-hidden cursor-pointer"
    >
      {/* ── Image Container ─────────────────────────────────── */}
      <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
        {img1 ? (
          <>
            {/* Primary image */}
            <img
              src={img1}
              alt={title}
              loading="lazy"
              decoding="async"
              className={clsx(
                'absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out',
                'group-hover:scale-[1.03]',
                img2 && 'group-hover:opacity-0'
              )}
            />
            {/* Secondary image — crossfade on hover */}
            {img2 && (
              <img
                src={img2}
                alt={`${title} alt`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500 ease-out"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
            <span className="text-6xl opacity-30">👔</span>
          </div>
        )}

        {/* Wishlist heart icon — top right */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {liked ? (
            <MdFavorite className="text-[#E16E50] text-lg" />
          ) : (
            <MdFavoriteBorder className="text-gray-600 text-lg" />
          )}
        </button>

        {/* Condition badge — top left */}
        {condition && (
          <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 text-gray-700">
            {condition}
          </span>
        )}

        {/* Sold overlay */}
        {status === 'sold' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-bold text-sm uppercase tracking-[0.3em] border border-white px-4 py-2">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Size pill — shows on hover at bottom */}
        {size && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="flex gap-1.5 justify-center">
              <span className="bg-white text-black text-[10px] font-bold uppercase px-3 py-1.5 tracking-wide">
                {size}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Card Info ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1 pt-3 pb-2">
        {/* Title */}
        <h3 className="text-xs font-medium text-black leading-snug tracking-wide uppercase">
          {truncate(title, 45)}
        </h3>

        {/* College name */}
        {collegeName && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">
            {collegeName}
          </p>
        )}

        {/* Price */}
        <p className="text-sm font-bold text-black mt-1 tracking-wide">
          {formatPrice(price)}
        </p>

        {/* Seller */}
        {seller && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
              {getInitials(seller.name)}
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider truncate">
              {seller.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
