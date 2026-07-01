import { useRef, useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  onDelete: () => void;
  children: ReactNode;
}

export default function SwipeableRow({ onDelete, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startXRef.current;
    currentXRef.current = diff;
    if (diff < 0) {
      setOffset(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (currentXRef.current < -60) {
      setOffset(-100);
    } else {
      setOffset(0);
    }
  };

  const handleDelete = () => {
    setOffset(-300);
    setTimeout(onDelete, 200);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 rounded-xl">
        <button onClick={handleDelete} className="text-white flex items-center gap-2">
          <Trash2 size={18} />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease',
        }}
        className="relative z-10"
        onClick={() => {
          if (offset !== 0) setOffset(0);
        }}
      >
        {children}
      </div>
    </div>
  );
}
