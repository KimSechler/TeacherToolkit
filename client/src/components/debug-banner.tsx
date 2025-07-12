import React from 'react';
import { config } from '@/lib/config';

export function DebugBanner() {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem('debug') !== 'true') return null;

  const handleDisable = () => {
    window.localStorage.removeItem('debug');
    window.location.reload();
  };

  return (
    <div className="w-full bg-yellow-300 text-black text-center py-2 px-4 fixed top-0 left-0 z-50 shadow-md flex items-center justify-between">
      <div>
        <strong>DEBUG MODE ENABLED</strong> | Env: {config.app.nodeEnv} | Version: {config.app.version}
      </div>
      <button
        className="ml-4 px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-600 text-xs font-bold"
        onClick={handleDisable}
      >
        Disable
      </button>
    </div>
  );
} 