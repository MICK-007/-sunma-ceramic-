import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border-subtle rounded-lg bg-bg-secondary/40">
      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4 text-gold">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h3 className="font-heading text-lg font-bold text-txt-main mb-1">{title}</h3>
      {description && <p className="text-xs text-txt-muted max-w-md mb-6">{description}</p>}
      {actionText && onAction && (
        <Button variant="gold" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
