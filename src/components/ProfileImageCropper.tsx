import { useState, useRef, useEffect } from 'react';
import { Move, Check, X } from 'lucide-react';

interface ProfileImageCropperProps {
  imageUrl: string;
  onSave: (position: { x: number; y: number }) => void;
  onCancel: () => void;
  initialPosition?: { x: number; y: number };
}

export function ProfileImageCropper({
  imageUrl,
  onSave,
  onCancel,
  initialPosition = { x: 50, y: 50 }
}: ProfileImageCropperProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (position.x * (containerRef.current?.offsetWidth || 100) / 100),
      y: e.clientY - (position.y * (containerRef.current?.offsetHeight || 100) / 100)
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - (position.x * (containerRef.current?.offsetWidth || 100) / 100),
      y: touch.clientY - (position.y * (containerRef.current?.offsetHeight || 100) / 100)
    });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    const maxX = imageRect.width - containerRect.width;
    const maxY = imageRect.height - containerRect.height;

    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    const percentX = (newX / maxX) * 100;
    const percentY = (newY / maxY) * 100;

    setPosition({
      x: isNaN(percentX) ? 50 : percentX,
      y: isNaN(percentY) ? 50 : percentY
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Position Your Profile Picture</h2>
        <p className="text-gray-400 mb-6">
          Drag the image to adjust what part should be displayed on your profile
        </p>

        <div
          ref={containerRef}
          className="relative w-full h-96 bg-gray-800 rounded-lg overflow-hidden mb-6 cursor-move"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Profile preview"
            className="absolute min-w-full min-h-full object-cover select-none"
            style={{
              objectPosition: `${position.x}% ${position.y}%`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            draggable={false}
          />

          <div className="absolute inset-0 border-4 border-green-500/30 pointer-events-none" />

          {!isDragging && (
            <div className="absolute top-4 left-4 bg-black/70 px-3 py-2 rounded-lg flex items-center gap-2 text-sm text-white">
              <Move className="w-4 h-4" />
              Drag to position
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={() => onSave(position)}
            className="px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Check className="w-5 h-5" />
            Save Position
          </button>
        </div>

        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400">
            Preview shows how your profile picture will appear on your digital ID card and throughout the platform
          </p>
        </div>
      </div>
    </div>
  );
}
