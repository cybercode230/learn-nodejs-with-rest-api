import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, Loader2, Image as ImageIcon, Paperclip, Home, Building, Umbrella, Mountain, Building2, Hotel, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useListings } from '../../../contexts/ListingContext';
import { useNavigate } from 'react-router-dom';

interface AISearchProps {
  onClose?: () => void;
}

const AISearch: React.FC<AISearchProps> = ({ onClose }) => {
  const { aiSearchListings } = useListings();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsThinking(true);
    try {
      await aiSearchListings(prompt);
      navigate(`/search-results?q=${encodeURIComponent(prompt)}`);
      if (onClose) onClose();
    } catch (error) {
      console.error('AI search failed:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const quickSearchOptions = [
    { icon: Home, label: "Properties in Kigali", query: "properties in Kigali" },
    { icon: Building, label: "Apartments", query: "apartments" },
    { icon: Umbrella, label: "Beachfront", query: "beachfront properties" },
    { icon: Mountain, label: "Mountain view", query: "mountain view homes" },
    { icon: Building2, label: "Downtown", query: "downtown apartments" },
    { icon: Hotel, label: "Villas", query: "luxury villas" },
    { icon: Home, label: "Cabins", query: "cabins" },
    { icon: Building, label: "Lofts", query: "lofts" },
    { icon: Home, label: "Countryside", query: "countryside homes" },
    { icon: Building, label: "Studios", query: "studios" },
  ];

  const handleQuickSearch = (query: string) => {
    setPrompt(query);
    textareaRef.current?.focus();
  };

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftChevron(scrollLeft > 10);
      setShowRightChevron(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-2 animate-fade-in max-w-4xl mx-auto px-2 sm:px-4">
      <div className={`w-full bg-white border ${isThinking ? 'border-airbnb ring-2 ring-airbnb/10' : 'border-gray-100'} rounded-2xl shadow-xl transition-all duration-500 overflow-hidden`}>
        <div className="p-4 pb-2">
          <div className="flex items-start gap-2">
            <div className={`mt-1 ${isThinking ? 'text-airbnb animate-pulse' : 'text-gray-300'}`}>
              <Sparkles size={20} />
            </div>
            <textarea 
              ref={textareaRef}
              className="flex-1 bg-transparent border-none outline-none text-sm md:text-base font-medium text-gray-700 placeholder:text-gray-300 py-0 resize-none overflow-y-auto"
              style={{ minHeight: '40px', maxHeight: '120px', lineHeight: '1.5' }}
              placeholder="Where would you like to go? Ask me anything..."
              value={prompt}
              onChange={handleTextareaChange}
              disabled={isThinking}
              rows={1}
            />
          </div>
        </div>

        <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1 md:gap-2">
            <input type="file" ref={fileInputRef} className="hidden" />
            <input type="file" accept="image/*" ref={imageInputRef} className="hidden" />
            <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-400 hover:text-airbnb hover:bg-airbnb/5 rounded-full transition-all group"><ImageIcon size={18} /></button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-airbnb hover:bg-airbnb/5 rounded-full transition-all group"><Paperclip size={18} /></button>
            <button type="button" className="p-2 text-gray-400 hover:text-airbnb hover:bg-airbnb/5 rounded-full transition-all group"><Mic size={18} /></button>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!prompt.trim() || isThinking}
            className={`w-10 h-10 rounded-full transition-all shadow-md flex items-center justify-center ${isThinking ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-airbnb text-white hover:bg-airbnb-dark shadow-airbnb/20 active:scale-95'}`}
          >
            {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      <div className="relative w-full mt-2">
        <AnimatePresence>
          {showLeftChevron && (
            <motion.button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg border border-gray-200 p-2 hover:bg-gray-50 hover:shadow-xl transition-all active:scale-95">
              <ChevronLeft size={18} className="text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>

        <div ref={scrollContainerRef} onScroll={checkScrollPosition} className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-2">
          {quickSearchOptions.map((option, index) => (
            <motion.button key={index} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => handleQuickSearch(option.query)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-airbnb/30 transition-all flex-shrink-0">
              <option.icon size={14} className="text-airbnb" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{option.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showRightChevron && (
            <motion.button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg border border-gray-200 p-2 hover:bg-gray-50 hover:shadow-xl transition-all active:scale-95">
              <ChevronRight size={18} className="text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AISearch;