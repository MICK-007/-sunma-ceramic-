'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'gold',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-200 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const variants = {
    gold: 'bg-gold text-bg-primary hover:bg-gold-hover shadow-md font-bold',
    outline: 'border border-border-gold text-gold hover:bg-gold/10',
    ghost: 'text-txt-muted hover:text-txt-main hover:bg-bg-secondary',
    danger: 'bg-red-900/40 border border-red-500/40 text-red-300 hover:bg-red-900/60',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-xs px-4 py-2.5',
    lg: 'text-sm px-6 py-3.5',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
