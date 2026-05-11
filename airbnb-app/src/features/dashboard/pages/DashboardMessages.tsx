import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Search, Send, Paperclip, Phone, 
  Video, CheckCheck, 
  Smile, Mic, Image, File, ArrowLeft, 
  MoreHorizontal, Volume2, Inbox
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  delivered?: boolean;
  type?: 'text' | 'image' | 'file' | 'voice';
  mediaUrl?: string;
}

interface Conversation {
  id: string;
  guestName: string;
  guestAvatar?: string;
  guestId: string;
  listingTitle: string;
  listingId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  rating?: number;
  isOnline?: boolean;
  lastSeen?: string;
  typing?: boolean;
}

const DashboardMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock conversations data with realistic data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      guestName: 'Alice Martin',
      guestId: 'guest1',
      listingTitle: 'Downtown Luxury Loft',
      listingId: 'listing1',
      lastMessage: 'Thank you for the confirmation!',
      lastMessageTime: '2026-05-14T10:30:00',
      unreadCount: 2,
      isOnline: true,
      rating: 5,
      typing: false,
      messages: [
        { id: 'm1', senderId: 'guest', receiverId: 'host', content: 'Hi, is the property available for May 10-14?', timestamp: '2026-05-10T09:00:00', read: true, delivered: true },
        { id: 'm2', senderId: 'host', receiverId: 'guest', content: 'Yes, those dates are available! Would you like to proceed with booking?', timestamp: '2026-05-10T10:15:00', read: true, delivered: true },
        { id: 'm3', senderId: 'guest', receiverId: 'host', content: 'Great! I would love to book it. Can you tell me more about the parking situation?', timestamp: '2026-05-10T10:30:00', read: true, delivered: true },
        { id: 'm4', senderId: 'host', receiverId: 'guest', content: "We have free underground parking available. I've confirmed your booking. You'll receive the details shortly.", timestamp: '2026-05-10T11:00:00', read: true, delivered: true },
        { id: 'm5', senderId: 'guest', receiverId: 'host', content: 'Perfect! Thank you so much for your help! 🙏', timestamp: '2026-05-14T10:30:00', read: false, delivered: true },
      ]
    },
    {
      id: '2',
      guestName: 'James Okonkwo',
      guestId: 'guest2',
      listingTitle: 'Cozy Beach Cottage',
      listingId: 'listing2',
      lastMessage: "What's the check-in time?",
      lastMessageTime: '2026-05-13T15:45:00',
      unreadCount: 0,
      isOnline: false,
      lastSeen: '2026-05-14T08:30:00',
      rating: 4,
      typing: false,
      messages: [
        { id: 'm6', senderId: 'guest', receiverId: 'host', content: "What's the check-in time?", timestamp: '2026-05-13T15:45:00', read: true, delivered: true },
        { id: 'm7', senderId: 'host', receiverId: 'guest', content: 'Check-in is at 3 PM, but early check-in can be arranged if available.', timestamp: '2026-05-13T16:00:00', read: true, delivered: true },
      ]
    },
    {
      id: '3',
      guestName: 'Sofia Leclerc',
      guestId: 'guest3',
      listingTitle: 'Modern City Apartment',
      listingId: 'listing3',
      lastMessage: 'Is there parking available?',
      lastMessageTime: '2026-05-12T09:20:00',
      unreadCount: 1,
      isOnline: true,
      rating: 5,
      typing: false,
      messages: [
        { id: 'm8', senderId: 'guest', receiverId: 'host', content: 'Is there parking available?', timestamp: '2026-05-12T09:20:00', read: false, delivered: true },
      ]
    },
    {
      id: '4',
      guestName: 'Michael Chen',
      guestId: 'guest4',
      listingTitle: 'Mountain View Cabin',
      listingId: 'listing4',
      lastMessage: 'Thank you for the wonderful stay!',
      lastMessageTime: '2026-05-11T14:20:00',
      unreadCount: 0,
      isOnline: false,
      lastSeen: '2026-05-13T22:15:00',
      rating: 5,
      typing: false,
      messages: [
        { id: 'm9', senderId: 'guest', receiverId: 'host', content: 'The cabin was amazing! The views were breathtaking.', timestamp: '2026-05-11T12:00:00', read: true, delivered: true },
        { id: 'm10', senderId: 'host', receiverId: 'guest', content: "So glad you enjoyed it! You're welcome back anytime!", timestamp: '2026-05-11T13:00:00', read: true, delivered: true },
        { id: 'm11', senderId: 'guest', receiverId: 'host', content: 'Thank you for the wonderful stay!', timestamp: '2026-05-11T14:20:00', read: true, delivered: true },
      ]
    },
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation, conversations]);

  // Focus input when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedConversation]);

  // Simulate guest typing indicator when host is typing
  useEffect(() => {
    if (selectedConversation && isTyping) {
      // Clear existing timeout
      if (typingTimeout) clearTimeout(typingTimeout);
      
      // Set new timeout to stop typing indicator after 3 seconds of no typing
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      setTypingTimeout(timeout);
      
      // Simulate guest typing response (for demo)
      const guestTypingTimer = setTimeout(() => {
        const conv = conversations.find(c => c.id === selectedConversation);
        if (conv && !conv.typing) {
          setConversations(prev => prev.map(c =>
            c.id === selectedConversation ? { ...c, typing: true } : c
          ));
          
          // Stop guest typing after 3 seconds
          setTimeout(() => {
            setConversations(prev => prev.map(c =>
              c.id === selectedConversation ? { ...c, typing: false } : c
            ));
          }, 3000);
        }
      }, 1000);
      
      return () => {
        clearTimeout(timeout);
        clearTimeout(guestTypingTimer);
      };
    }
  }, [isTyping, selectedConversation, conversations, typingTimeout]);

  const filteredConversations = conversations.filter(conv =>
    conv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listingTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentConversation) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: 'host',
      receiverId: 'guest',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true,
    };

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation
        ? {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0
          }
        : conv
    ));

    setNewMessage('');
    setIsTyping(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m`;
    }
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Offline';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return `Last seen today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `Last seen ${date.toLocaleDateString()}`;
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
    setShowAttachmentMenu(false);
  };

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
  };

  // Get typing indicator text
  const getTypingText = () => {
    if (currentConversation?.typing) {
      return `${currentConversation.guestName} is typing...`;
    }
    if (isTyping) {
      return 'You are typing...';
    }
    return null;
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-xl overflow-hidden border border-gray-100">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-100 bg-gray-50">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-airbnb transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <motion.button
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv.id);
                  markAsRead(conv.id);
                }}
                className={`w-full p-3 flex items-start gap-3 hover:bg-gray-100 transition-colors ${
                  selectedConversation === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center text-white font-semibold text-base shadow-sm">
                    {conv.guestName[0]}
                  </div>
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm truncate">{conv.guestName}</p>
                    <p className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatTime(conv.lastMessageTime)}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.listingTitle}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate flex-1">
                      {conv.typing ? (
                        <span className="text-airbnb italic">typing...</span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 min-w-[18px] h-[18px] bg-airbnb text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {currentConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-3 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
            <button 
              onClick={() => setSelectedConversation(null)}
              className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  {currentConversation.guestName[0]}
                </div>
                {currentConversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{currentConversation.guestName}</p>
                <p className="text-xs text-gray-500">
                  {currentConversation.typing ? (
                    <span className="text-airbnb">Typing...</span>
                  ) : currentConversation.isOnline ? (
                    'Online'
                  ) : (
                    formatLastSeen(currentConversation.lastSeen)
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Phone size={18} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Video size={18} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {currentConversation.messages.map((msg, idx) => {
              const showAvatar = msg.senderId !== 'host' && 
                (idx === 0 || currentConversation.messages[idx - 1]?.senderId !== 'guest');
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === 'host' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[75%] ${msg.senderId === 'host' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar for guest messages */}
                    {msg.senderId !== 'host' && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center text-white text-xs font-semibold mr-2 flex-shrink-0 mt-1">
                        {currentConversation.guestName[0]}
                      </div>
                    )}
                    {msg.senderId !== 'host' && !showAvatar && (
                      <div className="w-8 mr-2 flex-shrink-0" />
                    )}
                    
                    <div className={`flex flex-col ${msg.senderId === 'host' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          msg.senderId === 'host'
                            ? 'bg-airbnb text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 text-[10px] text-gray-400 ${msg.senderId === 'host' ? 'flex-row-reverse' : ''}`}>
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {msg.senderId === 'host' && (
                          <CheckCheck size={10} className={msg.read ? 'text-airbnb' : 'text-gray-400'} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {currentConversation.typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-airbnb to-pink-500" />
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator in input area */}
          {getTypingText() && (
            <div className="px-4 py-1 text-xs text-gray-400 italic">
              {getTypingText()}
            </div>
          )}

          {/* Message Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Paperclip size={18} className="text-gray-500" />
                </button>
                
                <AnimatePresence>
                  {showAttachmentMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-12 left-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[140px]"
                    >
                      <button
                        onClick={handleFileUpload}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Image size={14} /> Photo/Video
                      </button>
                      <button
                        onClick={handleFileUpload}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <File size={14} /> Document
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*,video/*,application/*" className="hidden" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={handleVoiceRecording}
                className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                {isRecording ? <Volume2 size={18} /> : <Mic size={18} />}
              </button>
              
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-airbnb focus:bg-white transition-all"
                />
              </div>
              
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Smile size={18} className="text-gray-500" />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 rounded-full bg-airbnb text-white hover:bg-airbnb-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State - No conversation selected */
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center max-w-sm px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h3>
            <p className="text-sm text-gray-500 mb-6">
              Select a conversation from the sidebar to start chatting with your guests
            </p>
            <div className="flex flex-col gap-2 text-left text-sm text-gray-400 bg-white rounded-xl p-4 border border-gray-100">
              <p className="font-medium text-gray-600 mb-1">💡 Tip:</p>
              <p>• Click on any chat to view conversation history</p>
              <p>• Send photos, files, and voice messages</p>
              <p>• Get real-time typing indicators</p>
              <p>• Make voice or video calls to your guests</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMessages;