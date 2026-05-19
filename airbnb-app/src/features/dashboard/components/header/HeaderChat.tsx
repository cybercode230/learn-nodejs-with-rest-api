import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, ChevronRight, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInbox } from '../../../../contexts/InboxContext';

interface HeaderChatProps {
  unreadCount?: number;
}

const HeaderChat: React.FC<HeaderChatProps> = () => {
  const { conversations, sendMessage, markConversationRead } = useInbox();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedChatId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const selectedChat = conversations.find(c => c.participantId === selectedChatId);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChatId) return;
    sendMessage(selectedChatId, messageInput);
    setMessageInput('');
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return `${Math.floor(diff / 60000)}m`;
    if (hours < 24) return `${Math.floor(hours)}h`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSelectedChatId(null);
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Messages"
      >
        <MessageSquare size={18} />
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-airbnb text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            {!selectedChat ? (
              // Conversations List
              <>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {conversations.length > 0 ? (
                    conversations.map((conv) => (
                      <button
                        key={conv.participantId}
                        onClick={() => {
                          setSelectedChatId(conv.participantId);
                          markConversationRead(conv.participantId);
                        }}
                        className="w-full p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
                      >
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {conv.participantName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 text-sm truncate">{conv.participantName}</p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{formatTime(conv.lastMessageTime)}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-airbnb text-white text-[10px] font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No messages yet</p>
                    </div>
                  )}
                </div>
                <Link to="/dashboard/messages">
                  <button className="w-full p-3 text-center text-sm text-airbnb font-medium hover:bg-gray-50 border-t border-gray-100">
                    View All Messages
                  </button>
                </Link>
              </>
            ) : (
              // Chat View
              <>
                <div className="flex items-center gap-3 p-3 border-b border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {selectedChat.participantName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{selectedChat.participantName}</p>
                      <p className="text-[10px] text-green-500">● Active now</p>
                    </div>
                  </div>
                </div>

                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {selectedChat.messages.map((msg) => {
                    const isMe = msg.senderId === 'me';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                            isMe
                              ? 'bg-airbnb text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div className={`text-[10px] mt-1 flex items-center gap-1 ${
                            isMe ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {formatTime(msg.timestamp)}
                            {isMe && <CheckCheck size={10} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-2 rounded-xl bg-airbnb text-white hover:bg-airbnb-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderChat;