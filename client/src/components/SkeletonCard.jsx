export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        {/* College */}
        <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
        {/* Badges row */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-lg w-12" />
          <div className="h-6 bg-gray-200 rounded-lg w-16" />
        </div>
        {/* Price */}
        <div className="h-6 bg-amber-100 rounded-lg w-24" />
        {/* Seller */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}
