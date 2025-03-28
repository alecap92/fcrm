import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    to: string;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
        {description}
      </p>
      {action && (
        <Link to={action.to}>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}