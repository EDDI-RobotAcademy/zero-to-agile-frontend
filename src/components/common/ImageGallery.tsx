"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className = '' }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`group overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 ${className}`}>
      {images.length >= 3 ? (
        /* 3장 이상일 경우 슬라이더 */
        <div className="relative">
          {/* 메인 이미지 */}
          <div className="relative h-[400px] overflow-hidden bg-slate-100">
            <img
              src={images[currentImageIndex]}
              alt={`${alt} - ${currentImageIndex + 1}`}
              className="h-full w-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/seed/default/600/400';
              }}
            />
          </div>

          {/* 이전 버튼 */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 p-2.5 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* 다음 버튼 */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 p-2.5 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
            aria-label="다음 이미지"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* 이미지 카운터 */}
          <div className="absolute right-4 top-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* 썸네일 미리보기 */}
          <div className="border-t border-slate-100 bg-white p-4">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 overflow-hidden rounded-lg transition ${
                    index === currentImageIndex
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`${index + 1}번째 이미지로 이동`}
                >
                  <img
                    src={image}
                    alt={`썸네일 ${index + 1}`}
                    className="h-16 w-24 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://picsum.photos/seed/default/96/64';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 3장 미만일 경우 그리드 */
        <div className={`grid gap-0 ${images.length === 1 ? '' : 'md:grid-cols-2'}`}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative h-[400px] overflow-hidden bg-slate-100 ${
                images.length === 2 && index === 0 ? 'border-r border-slate-200' : ''
              }`}
            >
              <img
                src={image}
                alt={`${alt} - ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://picsum.photos/seed/default/600/400';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
