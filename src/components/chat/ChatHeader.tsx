import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Chat } from '../../types/chat';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
  onShowMenu: () => void;
  isContact: string | boolean;
}

export function ChatHeader({ chat, onBack, onShowMenu, isContact }: ChatHeaderProps) {
  console.log(chat,12);
  const navigate = useNavigate();

  const handleNavigate = () => {
    
    if(isContact){
      navigate(`/contacts/${isContact}`);
    }

  }

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
          src={"https://avatar.iran.liara.run/public"}
          alt={chat.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900" onClick={handleNavigate}>
            {chat.name} 
            
            <span className='text-xs text-gray-500'> ({chat._id})</span>
          </h2>
         
        </div>
        <div className="flex items-center gap-4">
        
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