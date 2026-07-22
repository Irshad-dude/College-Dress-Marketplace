export default function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white">
      <div className="aspect-[3/4] skeleton w-full"></div>
      <div className="flex flex-col gap-2 pt-3 pb-2">
        <div className="h-3 w-3/4 skeleton"></div>
        <div className="h-2.5 w-1/2 skeleton mt-1"></div>
        <div className="h-4 w-1/3 skeleton mt-2"></div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-5 rounded-full skeleton flex-shrink-0"></div>
          <div className="h-2.5 w-1/3 skeleton"></div>
        </div>
      </div>
    </div>
  );
}
