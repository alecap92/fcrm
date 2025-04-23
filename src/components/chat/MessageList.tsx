import { Message } from '../../types/chat';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  isInitialLoad: boolean;
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

const groupMessagesByDate = (messages: Message[]) => {
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';

  messages.forEach((message) => {
    const messageDate = formatDate(message.timestamp);
    
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({
        date: messageDate,
        messages: [message]
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  return groupedMessages;
};

export function MessageList({ 
  messages, 
  onLoadMore, 
  isLoading, 
  hasMore,
  isInitialLoad 
}: MessageListProps) {
  const messageListRef = useRef<HTMLDivElement>(null);
  const groupedMessages = groupMessagesByDate(messages);
  const prevMessagesLengthRef = useRef<number>(messages.length);

  const handleScroll = () => {
    if (!messageListRef.current) return;

    const { scrollTop } = messageListRef.current;
    
    // Si el scroll está cerca del top, cargamos más mensajes
    if (scrollTop < 100 && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  // Scroll al final cuando se carga inicialmente
  useEffect(() => {
    if (messageListRef.current && isInitialLoad && messages.length > 0) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [isInitialLoad, messages.length]);

  // Mantener la posición del scroll cuando se cargan más mensajes
  useEffect(() => {
    if (!isInitialLoad && messages.length > prevMessagesLengthRef.current && messageListRef.current) {
      // Si hemos cargado más mensajes (scroll hacia arriba)
      const scrollHeightBefore = messageListRef.current.scrollHeight;
      
      // Esperamos a que el DOM se actualice
      setTimeout(() => {
        if (messageListRef.current) {
          const newScrollHeight = messageListRef.current.scrollHeight;
          messageListRef.current.scrollTop = newScrollHeight - scrollHeightBefore;
        }
      }, 10);
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, isInitialLoad]);

  return (
    <div 
      ref={messageListRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f3f4f6' fill-opacity='0.6' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    >
      {isLoading && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}


      
      {groupedMessages.map((group) => (
        <div key={group.date} className="space-y-4">
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
              {group.date}
            </div>
          </div>
          {group.messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[70%] rounded-lg px-4 py-2 shadow-sm
                  ${message.direction === 'incoming' 
                    ? 'bg-action text-white' 
                    : 'bg-white text-gray-900'
                  }
                `}
              >
                {message.type === 'image' && message.mediaUrl ? (
                  <img 
                    src={message.mediaUrl} 
                    alt="Imagen del mensaje" 
                    className="w-full rounded-md"
                    style={{ maxWidth: '300px' }}
                  />
                ) : message.type === 'document' && message.mediaUrl ? (
                  <div className="mt-2">
                    <iframe 
                      src={message.mediaUrl} 
                      className="w-full rounded-md border border-gray-200"
                      style={{ height: '300px', maxWidth: '300px' }}
                      title="Documento PDF"
                    ></iframe>
                  </div>
                ) : message.type === 'audio' && message.mediaUrl ? (
                  <div className="mt-2">
                    <audio 
                      controls
                      src={message.mediaUrl} 
                      className=""
                      style={{ maxWidth: '1000px' }}
                    >
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
                ) : (
                  <p className="text-sm">{message.message}</p>
                )}
                <div className={`
                  flex items-center gap-1 text-xs mt-1
                  ${message.direction === 'incoming' ? 'text-white/80' : 'text-gray-500'}
                `}>
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}