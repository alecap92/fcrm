import { useState } from 'react';
import { 
  X, 
  Minus,
  Maximize2,
  Minimize2,
  Paperclip,
  Image,
  Link,
  Send
} from 'lucide-react';
import { Button } from '../ui/button';

interface ComposeEmailProps {
  onClose: () => void;
}

export function ComposeEmail({ onClose }: ComposeEmailProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSend = () => {
    // Send email logic here
    onClose();
  };

  return (
    <div
      className={`
        fixed bottom-0 right-4 bg-white rounded-t-lg shadow-xl border border-b-0
        ${isMinimized ? 'h-[48px]' : isMaximized ? 'inset-4 rounded-lg border-b' : 'w-[600px] h-[600px]'}
        transition-all duration-200 ease-in-out
        z-50
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-900">
          Nuevo Mensaje
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Form */}
          <div className="p-4 space-y-4">
            <div>
              <input
                type="email"
                placeholder="Para"
                className="w-full px-3 py-2 border-0 border-b focus:ring-0 focus:border-action"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Asunto"
                className="w-full px-3 py-2 border-0 border-b focus:ring-0 focus:border-action"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Escribe tu mensaje aquí..."
                className="w-full h-64 px-3 py-2 border-0 resize-none focus:ring-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Image className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSend}
                disabled={!to || !subject || !content}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}