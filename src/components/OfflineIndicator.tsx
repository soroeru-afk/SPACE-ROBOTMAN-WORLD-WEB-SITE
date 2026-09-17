import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-3 right-3 z-50 flex items-center gap-2 bg-[#121212]/95 border border-[#ffaa00] px-3 py-1.5 text-[10px] font-['Orbitron'] tracking-wider text-[#ffaa00] shadow-[0_0_15px_rgba(255,170,0,0.3)] backdrop-blur-sm"
    >
      <WifiOff className="w-3.5 h-3.5 animate-pulse text-[#ffaa00]" />
      <span>OFFLINE ARCHIVE MODE (ACTIVE)</span>
    </div>
  );
};
