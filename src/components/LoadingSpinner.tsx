import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-white font-medium mb-2">Loading Physics Engine</div>
        <div className="text-gray-400 text-sm">Initializing WebGL components...</div>
      </div>
    </div>
  );
}