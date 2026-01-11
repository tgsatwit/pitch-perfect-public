import React from 'react';

interface FlexContainerProps {
  children: any[];
  style?: {
    direction?: 'row' | 'column';
    gap?: string;
    align?: 'start' | 'center' | 'end';
    justify?: 'start' | 'center' | 'end' | 'space-between';
  };
}

export function FlexContainer({ children, style }: FlexContainerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: style?.direction || 'row',
        gap: style?.gap || '1rem',
        alignItems: style?.align || 'start',
        justifyContent: style?.justify || 'start',
      }}
    >
      {children.map((child, index) => (
        <div key={index}>{child.component}</div>
      ))}
    </div>
  );
} 