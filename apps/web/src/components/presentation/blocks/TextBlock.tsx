import React from 'react';

interface TextBlockProps {
  text: string;
  style?: {
    align?: 'left' | 'center' | 'right';
    fontSize?: string;
    color?: string;
  };
}

export function TextBlock({ text, style }: TextBlockProps) {
  return (
    <div
      style={{
        textAlign: style?.align || 'left',
        fontSize: style?.fontSize || '16px',
        color: style?.color || '#000000',
      }}
    >
      {text}
    </div>
  );
} 