// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  downlink?: number; // Mbps
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
}

export const useNetworkStatus = (showToasts = true) => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      
      // @ts-ignore - Network Information API
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      setStatus((prev) => {
        const newStatus: NetworkStatus = {
          isOnline,
          wasOffline: prev.wasOffline || !isOnline,
          downlink: connection?.downlink,
          effectiveType: connection?.effectiveType,
        };

        // Notifications utilisateur
        if (showToasts) {
          if (!prev.isOnline && isOnline) {
            toast.success('Connexion rétablie ♡', {
              id: 'network-status',
              duration: 3000,
            });
          } else if (prev.isOnline && !isOnline) {
            toast.error('Connexion perdue. Mode hors ligne activé ♡', {
              id: 'network-status',
              duration: Infinity, // Reste jusqu'à reconnexion
            });
          }
        }

        return newStatus;
      });
    };

    // Event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Network Information API (si disponible)
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connection?.addEventListener('change', updateNetworkStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      connection?.removeEventListener('change', updateNetworkStatus);
    };
  }, [showToasts]);

  return status;
};