import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, HelpCircle, BookOpen, Video, MessageCircle, 
  ChevronRight, Mail, Phone, Users, DollarSign, Calendar, Home,  
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  icon: React.ReactNode;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const categories: HelpCategory[] = [
  { id: 'getting-started', title: 'Getting Started', description: 'Learn the basics of Hostify', icon: <BookOpen size={20} />, color: 'bg-blue-50 text-blue-600' },
  { id: 'bookings', title: 'Bookings', description: 'Manage reservations and calendars', icon: <Calendar size={20} />, color: 'bg-purple-50 text-purple-600' },
  { id: 'listings', title: 'Listings', description: 'Create and optimize properties', icon: <Home size={20} />, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'payments', title: 'Payments', description: 'Payouts, invoices, and taxes', icon: <DollarSign size={20} />, color: 'bg-amber-50 text-amber-600' },
  { id: 'guests', title: 'Guest Management', description: 'Communication and reviews', icon: <Users size={20} />, color: 'bg-rose-50 text-rose-600' },
];

const popularArticles: HelpArticle[] = [
  { id: '1', title: 'How to create your first listing', description: 'Step-by-step guide to adding a property', category: 'Listings', readTime: '5 min', icon: <Home size={16} /> },
  { id: '2', title: 'Managing booking requests', description: 'Accept, decline, or modify reservations', category: 'Bookings', readTime: '3 min', icon: <Calendar size={16} /> },
  { id: '3', title: 'Understanding payouts', description: 'When and how you get paid', category: 'Payments', readTime: '4 min', icon: <DollarSign size={16} /> },
  { id: '4', title: 'Responding to guest messages', description: 'Best practices for communication', category: 'Guests', readTime: '2 min', icon: <MessageCircle size={16} /> },
];

const faqs = [
  { question: 'How do I edit my listing?', answer: 'Go to Listings → Click the three dots on your listing → Select Edit' },
  { question: 'When do I get paid?', answer: 'Payouts are processed 24 hours after guest check-in' },
  { question: 'How to cancel a booking?', answer: 'Go to Bookings → Select the booking → Click Cancel Reservation' },
  { question: 'How to contact support?', answer: 'Email support@hostify.com or use live chat' },
];

const DashboardHelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredArticles = popularArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Help Center</h1>
        <p className="text-gray-500 mt-2">Everything you need to know about hosting with Hostify</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/dashboard/messages">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all">
            <MessageCircle size={24} className="mx-auto mb-2 text-airbnb" />
            <p className="text-sm font-medium text-gray-900">Contact Support</p>
          </div>
        </Link>
        <Link to="/dashboard/listings/new">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all">
            <Home size={24} className="mx-auto mb-2 text-airbnb" />
            <p className="text-sm font-medium text-gray-900">Create Listing</p>
          </div>
        </Link>
        <button className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all">
          <Video size={24} className="mx-auto mb-2 text-airbnb" />
          <p className="text-sm font-medium text-gray-900">Video Tutorials</p>
        </button>
        <button className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all">
          <Mail size={24} className="mx-auto mb-2 text-airbnb" />
          <p className="text-sm font-medium text-gray-900">Email Support</p>
        </button>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedCategory(category.id)}
              className="bg-white rounded-xl p-5 border border-gray-100 text-left hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center mb-3`}>
                {category.icon}
              </div>
              <h3 className="font-bold text-gray-900">{category.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
              <div className="flex items-center gap-1 mt-3 text-airbnb text-xs font-medium">
                View articles <ChevronRight size={12} />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Popular Articles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Popular Articles</h2>
          <button className="text-xs text-airbnb font-medium">View all</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {filteredArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  {article.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{article.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{article.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400">{article.category}</span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] text-gray-400">{article.readTime} read</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => setOpenFaq(openFaq === faq.question ? null : faq.question)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                <ChevronRight 
                  size={16} 
                  className={`text-gray-400 transition-transform ${openFaq === faq.question ? 'rotate-90' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openFaq === faq.question && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
        <p className="text-gray-500 text-sm mb-6">Our support team is ready to assist you</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-airbnb text-white rounded-xl text-sm font-medium hover:bg-airbnb-dark transition-all">
            <MessageCircle size={16} /> Live Chat
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            <Mail size={16} /> Email Support
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            <Phone size={16} /> Call Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardHelpCenter;