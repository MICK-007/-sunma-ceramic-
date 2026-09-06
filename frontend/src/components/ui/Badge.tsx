import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'stone' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className = '' }) => {
  const styles = {
    gold: 'bg-gold/10 text-gold border-gold/30',
    stone: 'bg-stone/10 text-stone border-stone/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-[10px] font-semibold tracking-widest uppercase border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
