import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  text, 
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-lg p-8 max-w-md w-full mx-4 flex flex-col items-center ${className}`}>
          <Loader2 className={`${sizeClasses[size]} text-action animate-spin mb-4`} />
          {text && <p className="text-gray-700 text-lg font-medium text-center">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-action animate-spin ${text ? 'mb-2' : ''}`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}