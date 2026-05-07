import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, DollarSign, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'payout' | 'review';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

interface HeaderNotificationsProps {
  unreadCount?: number;
  onNotificationClick?: (notification: Notification) => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    description: 'John Doe wants to book Downtown Loft for 3 nights',
    time: '5 min ago',
    read: false,
    link: '/dashboard/bookings'
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message from Guest',
    description: 'Sarah asked about check-in time',
    time: '1 hour ago',
    read: false,
    link: '/dashboard/messages'
  },
  {
    id: '3',
    type: 'payout',
    title: 'Payout Processed',
    description: '$480 has been sent to your bank account',
    time: '2 hours ago',
    read: true,
    link: '/dashboard/wallet'
  },
  {
    id: '4',
    type: 'review',
    title: 'New 5-Star Review',
    description: 'James left a great review for Beach Cottage',
    time: '1 day ago',
    read: true,
    link: '/dashboard/listings'
  },
];

const getIcon = (type: string) => {
  switch(type) {
    case 'booking': return <Calendar size={14} className="text-blue-500" />;
    case 'message': return <Bell size={14} className="text-purple-500" />;
    case 'payout': return <DollarSign size={14} className="text-green-500" />;
    case 'review': return <Star size={14} className="text-amber-500" />;
    default: return <Bell size={14} />;
  }
};

const HeaderNotifications: React.FC<HeaderNotificationsProps> = ({   
  onNotificationClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadNotifications > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-airbnb rounded-full ring-2 ring-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadNotifications > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-airbnb hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.link || '#'}
                    onClick={() => {
                      markAsRead(notification.id);
                      onNotificationClick?.(notification);
                      setIsOpen(false);
                    }}
                    className={`block p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderNotifications;