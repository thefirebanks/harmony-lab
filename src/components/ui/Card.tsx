/**
 * Card Component
 * Container with elevated background
 */

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const baseStyles = 'rounded-xl';
    
    const variants = {
      default: 'bg-background-elevated border border-text-muted/10',
      elevated: 'bg-background-elevated border border-text-muted/20 shadow-lg',
    };
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
