import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Chat } from '../../types/chat';

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
  onShowMenu: () => void;
}

export function ChatHeader({ chat, onBack, onShowMenu }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <img
          src={chat.avatar}
          alt={chat.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900">
            {chat.name}
          </h2>
          {chat.isOnline && (
            <p className="text-sm text-green-500">En línea</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onShowMenu}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}