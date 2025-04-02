import { Smile, Paperclip, Plus, Send } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageInputProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onAttachment: () => void;
  onQuickResponse: () => void;
}

export function MessageInput({
  message,
  onMessageChange,
  onSend,
  onAttachment,
  onQuickResponse
}: MessageInputProps) {
  return (
    <div className="bg-white border-t p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2">
          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
            <Smile className="w-5 h-5 text-gray-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onAttachment}
            className="hover:bg-gray-100"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onQuickResponse}
            className="hover:bg-gray-100"
          >
            <Plus className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
        <div className="relative">
          <textarea
            placeholder="Escribe un mensaje"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent resize-none"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={3}
            style={{ minHeight: '60px', maxHeight: '120px' }}
          />
          <Button
            className="absolute right-2 bottom-2 rounded-full w-8 h-8 p-0 bg-action hover:bg-action-hover"
            onClick={onSend}
            disabled={!message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="px-2 text-xs text-gray-500">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </div>
      </div>
    </div>
  );
}