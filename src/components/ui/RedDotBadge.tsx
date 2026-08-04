import React from 'react';

interface RedDotBadgeProps {
  className?: string;
  title?: string;
}

export const RedDotBadge: React.FC<RedDotBadgeProps> = ({ className = '', title }) => {
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full bg-rose-500 red-dot-pulse shrink-0 ${className}`}
      title={title}
    />
  );
};
