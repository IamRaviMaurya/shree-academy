import React from 'react';
import { cn } from '../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  title,
  ...props
}) => {
  return (
    <div className={cn('card', className)} {...props}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};