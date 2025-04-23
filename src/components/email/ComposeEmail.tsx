import { useState, KeyboardEvent } from 'react';
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
  handleSendEmail: (invoice: any, form: {to: string[], subject: string, content: string}) => void;
  selectedInvoice?: any;
}

export function ComposeEmail({ onClose, handleSendEmail, selectedInvoice }: ComposeEmailProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (selectedInvoice) {
      handleSendEmail(selectedInvoice, {to: recipients, subject, content});
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Si se presiona Tab o Coma (,)
    if ((e.key === 'Tab' || e.key === ',') && currentInput.trim()) {
      e.preventDefault();
      addRecipient();
    }
    // Si se presiona Enter
    else if (e.key === 'Enter' && currentInput.trim()) {
      e.preventDefault();
      addRecipient();
    }
    // Si se presiona Backspace y no hay texto en el input, eliminar el último destinatario
    else if (e.key === 'Backspace' && !currentInput && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
    }
  };

  const addRecipient = () => {
    const email = currentInput.trim().replace(',', '');
    // Comprobar si es un email válido con una expresión regular básica
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setCurrentInput('');
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
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
              <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 border-0 border-b focus-within:border-action">
                {recipients.map((email, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <input
                  type="email"
                  placeholder={recipients.length > 0 ? "" : "Para"}
                  className="flex-1 min-w-[120px] border-0 focus:ring-0 p-0"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (currentInput.trim()) {
                      addRecipient();
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-3">
                Presiona Tab, coma o Enter para agregar múltiples destinatarios
              </p>
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
                disabled={recipients.length === 0 || !subject || !content || !selectedInvoice}
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