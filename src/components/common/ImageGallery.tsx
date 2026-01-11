"use client";

import { useState } from 'react';

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

  return (
    <div className={`overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 ${className}`}>
      {images.length >= 3 ? (
        /* 3장 이상일 경우 슬라이더 */
        <div className="relative">
          <img
            src={images[currentImageIndex]}
            alt={`${alt} - ${currentImageIndex + 1}`}
            className="h-96 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://picsum.photos/seed/default/600/400';
            }}
          />

          {/* 이전 버튼 */}
          <button
            onClick={() => setCurrentImageIndex((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            )}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
            aria-label="이전 이미지"
          >
            ◀
          </button>

          {/* 다음 버튼 */}
          <button
            onClick={() => setCurrentImageIndex((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            )}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
            aria-label="다음 이미지"
          >
            ▶
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 w-2 rounded-full transition ${
                  index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
                aria-label={`${index + 1}번째 이미지로 이동`}
              />
            ))}
          </div>

          {/* 이미지 카운터 */}
          <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      ) : (
        /* 3장 미만일 경우 그리드 */
        <div className="grid gap-2 md:grid-cols-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${alt} - ${index + 1}`}
              className="h-80 w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/seed/default/600/400';
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
