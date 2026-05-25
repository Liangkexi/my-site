"use client";
import { useState, useEffect, useRef } from "react";

interface AppleLightboxProps {
  photos: string[];
  title?: string;
}

export default function AppleLightbox({ photos, title }: AppleLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MAX_ZOOM = 3;
  const MIN_ZOOM = 1;
  const SWIPE_THRESHOLD = 50;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, index]);

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % photos.length);
    resetZoom();
  };

  const goToPrevious = () => {
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
    resetZoom();
  };

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, MIN_ZOOM));
    if (zoom - 0.5 <= 1) {
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const maxOffset = (containerRef.current.clientWidth / 2) * (zoom - 1);
    const maxOffsetY = (containerRef.current.clientHeight / 2) * (zoom - 1);

    setOffset({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStart.x - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStart.y - e.changedTouches[0].clientY);

    // 只在水平滑动时触发（竖直位移小于水平位移）
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && deltaY < SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    setZoom(newZoom);
    if (newZoom <= 1) {
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleDoubleClick = () => {
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2);
    }
  };

  const currentPhoto = photos[index];

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .lightbox-image {
          animation: fadeIn 0.4s ease-out;
        }
        .thumbnail-fade {
          animation: fadeInScale 0.3s ease-out;
        }
      `}</style>
      {/* Thumbnail Grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        }}
      >
        {photos.map((src, i) => (
          <div
            key={i}
            onClick={() => {
              setIndex(i);
              setOpen(true);
              resetZoom();
            }}
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <img
              src={src}
              alt={`${title || "photo"} ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Apple-style Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              resetZoom();
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Main Viewer Container */}
          <div
            ref={containerRef}
            className="relative h-full w-full flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
          >
            {/* Image */}
            <img
              key={currentPhoto}
              ref={imageRef}
              src={currentPhoto}
              alt={`${title || "photo"} ${index + 1}`}
              className="select-none transition-all duration-300 lightbox-image"
              style={{
                transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                opacity: 1,
              }}
              onDoubleClick={handleDoubleClick}
              draggable={false}
            />
          </div>

          {/* Info Bar - Top */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 text-white bg-gradient-to-b from-black/50 to-transparent">
            <div>
              <p className="text-sm font-medium">
                {index + 1} / {photos.length}
              </p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                resetZoom();
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>


          {/* Thumbnail Strip - Bottom */}
          {photos.length > 1 && (
            <div className="absolute bottom-24 left-0 right-0 flex items-center justify-center gap-2 px-6">
              <div className="flex gap-2 overflow-x-auto max-w-xs">
                {photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIndex(i);
                      resetZoom();
                    }}
                    className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-all overflow-hidden thumbnail-fade ${
                      i === index
                        ? "border-white/100 opacity-100 ring-2 ring-white/50"
                        : "border-white/30 opacity-60 hover:opacity-80"
                    }`}
                    aria-label={`Go to photo ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors text-white z-10"
                aria-label="Previous image"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors text-white z-10"
                aria-label="Next image"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
