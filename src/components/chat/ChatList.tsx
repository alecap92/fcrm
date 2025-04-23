import { Search } from 'lucide-react';
import { Chat } from '../../types/chat';
import { useEffect, useRef } from 'react';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  handleSelectChat: (contactId: string) => void;
}

export function ChatList({ 
  chats, 
  selectedChat, 
  searchTerm, 
  onSearchChange,
  onLoadMore,
  isLoading,
  hasMore,
  handleSelectChat
}: ChatListProps) {
  const chatListRef = useRef<HTMLDivElement>(null);

  if (!chats) return null;

  const handleScroll = () => {
    if (!chatListRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatListRef.current;
    
    // Si el scroll está cerca del final, cargamos más chats
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div className="w-80 border-r bg-white">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar chats..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div 
        ref={chatListRef}
        className="h-[calc(100vh-65px)] overflow-y-auto"
        onScroll={handleScroll}
      >
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
              selectedChat?._id === chat._id ? 'bg-action/5' : ''
            }`}
            onClick={() => handleSelectChat(chat.contact)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={'https://avatar.iran.liara.run/public'}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-action text-white text-xs">
                    {chat.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {!hasMore && chats.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            No hay más chats para mostrar
          </div>
        )}
      </div>
    </div>
  );
}