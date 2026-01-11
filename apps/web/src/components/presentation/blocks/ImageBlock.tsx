import React from 'react';
import Image from 'next/image';

interface ImageBlockProps {
  src: string;
  alt: string;
  size: 'small' | 'medium' | 'large' | 'full';
}

export function ImageBlock({ src, alt, size }: ImageBlockProps) {
  const sizeClasses = {
    small: 'max-w-xs',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'w-full',
  };

  return (
    <div className={`${sizeClasses[size]} relative h-auto`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          layout="responsive"
          width={1200}
          height={800}
          objectFit="contain"
          priority={false}
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          No image selected
        </div>
      )}
    </div>
  );
} 