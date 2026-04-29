import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, fullScreen }) {
  // Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Portal: renderiza diretamente no <body>, escapando qualquer overflow/transform do pai
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: fullScreen ? '1rem' : '2rem 1rem',
        overflowY: 'auto',
      }}
    >
      {/* Overlay com blur */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 20, 10, 0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 0,
        }}
        onClick={onClose}
      />

      {/* Painel */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: fullScreen ? '95vw' : '32rem',
          height: fullScreen ? '95vh' : 'auto',
          margin: 'auto',
          borderRadius: '1rem',
          background: '#0f172a',
          boxShadow: '0 32px 80px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.08)',
          overflow: 'hidden',
          display: fullScreen ? 'flex' : 'block',
          flexDirection: fullScreen ? 'column' : 'unset',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: '0.375rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#f8fafc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
