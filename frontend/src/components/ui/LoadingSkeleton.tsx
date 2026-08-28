import React from 'react';

export const LoadingSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-bg-card border border-border-subtle rounded p-4 space-y-4 animate-pulse"
        >
          <div className="w-full h-56 bg-bg-elevated rounded" />
          <div className="h-4 bg-bg-elevated rounded w-3/4" />
          <div className="h-3 bg-bg-elevated rounded w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-bg-elevated rounded w-1/3" />
            <div className="h-8 bg-bg-elevated rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
