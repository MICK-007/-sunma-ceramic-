'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'primary' | 'outline' | 'secondary' | 'ghost' | 'danger';
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
    'inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-300 rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none select-none';

  const variants = {
    gold: 'bg-gold text-white hover:bg-gold-hover shadow-sm font-semibold',
    primary: 'bg-txt-main text-white hover:bg-stone-dark shadow-sm font-semibold',
    outline: 'border border-border-subtle hover:border-txt-main text-txt-main hover:bg-txt-main/5 font-medium',
    secondary: 'bg-bg-secondary text-txt-main border border-border-subtle hover:bg-bg-elevated font-medium',
    ghost: 'text-txt-muted hover:text-txt-main hover:bg-bg-secondary font-medium',
    danger: 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold',
  };

  const sizes = {
    sm: 'text-[11px] px-3 py-1.5 tracking-widest',
    md: 'text-xs px-5 py-2.5 tracking-wider',
    lg: 'text-xs px-7 py-3.5 tracking-widest',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
