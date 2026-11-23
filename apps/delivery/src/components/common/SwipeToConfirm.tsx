import React, { useState, useRef, useEffect } from 'react';
import { ChevronsRight, CheckCircle2 } from 'lucide-react';

interface SwipeToConfirmProps {
  label: string;
  confirmedLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: 'gold' | 'success' | 'danger';
}

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  label,
  confirmedLabel = 'Confirmed',
  onConfirm,
  isLoading = false,
  variant = 'gold',
}) => {
  const [sliderPos, setSliderPos] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const handleStart = (clientX: number) => {
    if (isConfirmed || isLoading) return;
    isDragging.current = true;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !trackRef.current || isConfirmed || isLoading) return;
    const rect = trackRef.current.getBoundingClientRect();
    const maxDrag = rect.width - 56; // 56px thumb width
    const currentOffset = Math.max(0, Math.min(clientX - rect.left - 28, maxDrag));
    setSliderPos(currentOffset);

    // If dragged > 88% of track, trigger confirmation!
    if (currentOffset >= maxDrag * 0.88) {
      isDragging.current = false;
      setSliderPos(maxDrag);
      setIsConfirmed(true);
      onConfirm();
    }
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!isConfirmed) {
      // Snap back smoothly
      setSliderPos(0);
    }
  };

  // Global mouse/touch up listeners
  useEffect(() => {
    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isConfirmed]);

  const getBorderColor = () => {
    if (variant === 'success') return 'border-emerald-300';
    if (variant === 'danger') return 'border-rose-300';
    return 'border-amber-300';
  };

  const getProgressBg = () => {
    if (variant === 'success') return 'bg-emerald-100';
    if (variant === 'danger') return 'bg-rose-100';
    return 'bg-amber-100';
  };

  const getThumbBg = () => {
    if (variant === 'success') return 'bg-emerald-500 text-white shadow-emerald-200';
    if (variant === 'danger') return 'bg-rose-500 text-white shadow-rose-200';
    return 'bg-[#FACC15] text-slate-950 shadow-amber-200';
  };

  return (
    <div
      ref={trackRef}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      className={`relative w-full h-14 rounded-2xl bg-slate-100 border ${getBorderColor()} overflow-hidden select-none flex items-center shadow-xs font-sans`}
    >
      {/* Background Filled Progress Bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 ${getProgressBg()} transition-all duration-75`}
        style={{ width: `${sliderPos + 56}px` }}
      />

      {/* Centered Guide Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-14 text-center">
        <span
          className={`text-xs font-black tracking-wider uppercase transition-opacity ${
            isConfirmed ? 'text-slate-900' : 'text-slate-500'
          }`}
        >
          {isConfirmed ? confirmedLabel : label}
        </span>
      </div>

      {/* Draggable Thumb Button */}
      <div
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        style={{ transform: `translateX(${sliderPos}px)` }}
        className={`absolute left-1.5 w-11 h-11 rounded-xl ${getThumbBg()} shadow-xs flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75`}
      >
        {isConfirmed ? (
          <CheckCircle2 size={22} strokeWidth={2.5} />
        ) : (
          <ChevronsRight size={22} strokeWidth={2.5} className="animate-pulse" />
        )}
      </div>
    </div>
  );
};
