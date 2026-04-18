// src/pages/Login.tsx (extrait pour afficher le message)
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const { sessionExpiredMessage, clearSessionExpiredMessage } = useAuthStore();

  useEffect(() => {
    if (sessionExpiredMessage) {
      toast.error(sessionExpiredMessage, { duration: 5000 });
      clearSessionExpiredMessage();
    }
  }, [sessionExpiredMessage, clearSessionExpiredMessage]);

  // ... reste du composant
}