'use client';

import React, { useEffect, useState, Suspense } from 'react';

// This component wraps Konva components to only render them on the client side
interface KonvaClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const KonvaClientOnly: React.FC<KonvaClientOnlyProps> = ({
  children,
  fallback = null
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}; 