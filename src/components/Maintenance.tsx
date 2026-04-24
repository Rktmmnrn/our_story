import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface MaintenanceProps {
  onDismiss?: () => void;
}

export default function Maintenance({ onDismiss }: MaintenanceProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout('manual');
    toast.success('Déconnecté');
    navigate('/');
    onDismiss?.();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #fdf0f4 0%, #fdf8f2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        zIndex: 9999,
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          textAlign: 'center',
          background: 'white',
          padding: '4rem 2.5rem',
          borderRadius: '8px',
          border: '0.5px solid rgba(201,168,76,0.3)',
          boxShadow: '0 20px 60px rgba(42,26,32,0.15)',
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🔧</div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2.5rem',
            fontWeight: 300,
            color: '#2a1a20',
            marginBottom: '1rem',
            letterSpacing: '-0.5px',
          }}
        >
          En Maintenance
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: '#7d6b6f',
            marginBottom: '0.5rem',
            fontSize: '1rem',
            lineHeight: 1.6,
          }}
        >
          Notre Histoire se fait une beauté ✨
        </p>

        {/* Message */}
        <p
          style={{
            color: '#a89191',
            marginBottom: '2.5rem',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            fontStyle: 'italic',
          }}
        >
          Nous mettons à jour l'application pour vous offrir une meilleure expérience. Nous serons bientôt de retour avec de surprises magiques ♡
        </p>

        {/* Emoji animation */}
        <div
          style={{
            marginBottom: '2rem',
            animation: 'pulse 2s ease-in-out infinite',
            fontSize: '2rem',
          }}
        >
          💫
        </div>

        {/* Footer message */}
        <p
          style={{
            color: '#c9a84c',
            fontSize: '0.85rem',
            marginBottom: '2rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          Prévu : bientôt
        </p>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #d4607a 0%, #c94c6d 100%)',
            color: '#fdf8f2',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 15px rgba(212,96,122,0.3)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212,96,122,0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,96,122,0.3)';
          }}
        >
          Se déconnecter
        </button>

        {/* Style animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
}
