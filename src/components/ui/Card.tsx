import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-navy-mid border border-gold/[0.15] rounded-[6px] p-8 ${className}`}
    >
      {children}
    </div>
  );
}
