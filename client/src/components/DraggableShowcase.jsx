import { useState, useRef, useEffect } from 'react';
import { MdDragIndicator, MdOutlineWallpaper } from 'react-icons/md';

export default function DraggableShowcase({ imageUrl, bgUrl = 'https://images.unsplash.com/photo-1595079676339-1534801ad6cb?auto=format&fit=crop&w=1000&q=80' }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPosition({ x, y });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
          <MdOutlineWallpaper size={16} /> VIRTUAL SHOWCASE
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">DRAG ITEM TO REPOSITION</p>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden border border-black cursor-crosshair group touch-none"
      >
        {/* Background Layer */}
        <img 
          src={bgUrl} 
          alt="Showcase Background" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
        />

        {/* Draggable Item Layer */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing w-[40%] max-w-[300px]"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
          onPointerDown={handlePointerDown}
        >
          <div className="relative shadow-2xl transition-transform duration-200 group-active:scale-105">
            <img 
              src={imageUrl} 
              alt="Draggable Item" 
              className="w-full h-auto object-contain pointer-events-none bg-white p-2 border border-gray-200"
            />
            {/* Drag Handle Indicator */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <MdDragIndicator size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
