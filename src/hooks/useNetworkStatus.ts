import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface NetworkStatus {
  isOnline: boolean;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie ♡', { id: 'network', duration: 3000 });
    };
    const goOffline = () => {
      setIsOnline(false);
      toast.error('Connexion perdue ♡', { id: 'network', duration: Infinity });
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return { isOnline };
};
