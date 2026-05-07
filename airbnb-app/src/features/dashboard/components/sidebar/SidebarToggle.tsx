import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ isCollapsed, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        left: isCollapsed ? '72px' : '248px',
        marginLeft: '-14px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 999999,
        color: '#666',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), background 0.15s, color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = '#fff';
        el.style.color = '#111';
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.8) inset';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = 'rgba(255,255,255,0.92)';
        el.style.color = '#666';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset';
      }}
    >
      {isCollapsed
        ? <ChevronRight size={13} strokeWidth={2.5} />
        : <ChevronLeft size={13} strokeWidth={2.5} />
      }
    </button>
  );
};

export default SidebarToggle;