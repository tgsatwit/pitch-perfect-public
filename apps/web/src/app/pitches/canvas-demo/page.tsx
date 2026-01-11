import React from 'react';
import { SlideCanvasDemo } from '@/components/presentation/SlideCanvasDemo';

export default function CanvasDemo() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Canvas-Based Slide Editor Demo</h1>
      <p className="mb-6 text-slate-600">
        This page demonstrates the canvas-based slide editor with drag, resize, and editing capabilities.
        Try dragging elements around and selecting them to edit their properties.
      </p>
      
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <SlideCanvasDemo />
      </div>
      
      <div className="mt-8 p-4 bg-slate-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Implementation Notes</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Built using react-konva for canvas manipulation</li>
          <li>Supports precise positioning and resizing of elements</li>
          <li>Real-time property editing</li>
          <li>Persists element positions and sizes</li>
          <li>Can be extended with additional element types</li>
        </ul>
      </div>
    </div>
  );
} 