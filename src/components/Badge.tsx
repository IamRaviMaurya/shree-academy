import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva('badge', {
  variants: {
    variant: {
      default: 'bg-gray-100 text-gray-800',
      blue: 'badge-blue',
      green: 'badge-green',
      amber: 'badge-amber',
      red: 'badge-red',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
};