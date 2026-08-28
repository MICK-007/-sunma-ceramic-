import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'stone' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className = '' }) => {
  const styles = {
    gold: 'bg-gold/15 text-gold border-gold/40',
    stone: 'bg-stone-dark/30 text-stone-light border-stone/30',
    success: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40',
    warning: 'bg-amber-950/50 text-amber-400 border-amber-500/40',
    danger: 'bg-rose-950/50 text-rose-400 border-rose-500/40',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
