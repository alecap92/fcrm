import { Check } from 'lucide-react';
import { Message } from '../../types/chat';

interface MessageStatusProps {
  status: Message['status'];
}

export function MessageStatus({ status }: MessageStatusProps) {
  if (status === 'sent') {
    return <Check className="w-4 h-4 text-gray-400" />;
  }
  if (status === 'delivered') {
    return (
      <div className="flex">
        <Check className="w-4 h-4 text-gray-400" />
        <Check className="w-4 h-4 -ml-2 text-gray-400" />
      </div>
    );
  }
  return (
    <div className="flex">
      <Check className="w-4 h-4 text-blue-500" />
      <Check className="w-4 h-4 -ml-2 text-blue-500" />
    </div>
  );
}