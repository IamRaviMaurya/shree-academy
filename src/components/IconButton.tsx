import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const iconButtonVariants = cva('icon-btn', {
  variants: {
    variant: {
      default: '',
      danger: 'icon-btn-danger',
      success: 'icon-btn-success',
      primary: 'icon-btn-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  variant,
  children,
  ...props
}) => {
  return (
    <button className={cn(iconButtonVariants({ variant }), className)} {...props}>
      {children}
    </button>
  );
};