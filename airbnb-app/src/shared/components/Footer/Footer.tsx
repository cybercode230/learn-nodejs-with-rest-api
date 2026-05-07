import { Globe, Heart, Compass, User, MessageCircle, Send, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Safety information', href: '#' },
        { label: 'Cancellation options', href: '#' },
        { label: 'Our COVID-19 Response', href: '#' },
        { label: 'Supporting people with disabilities', href: '#' },
        { label: 'Report a neighborhood concern', href: '#' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Supplify.org: disaster relief housing', href: '#' },
        { label: 'Support Afghan refugees', href: '#' },
        { label: 'Combating discrimination', href: '#' },
      ],
    },
    {
      title: 'Hosting',
      links: [
        { label: 'Try hosting', href: '#' },
        { label: 'AirCover for Hosts', href: '#' },
        { label: 'Explore hosting resources', href: '#' },
        { label: 'How to host responsibly', href: '#' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Newsroom', href: '#' },
        { label: 'Learn about new features', href: '#' },
        { label: 'Letter from our founders', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Investors', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-[#F7F7F7] border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-200">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:underline hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-600">
            <span>© {currentYear} airbnb, Inc.</span>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Sitemap</a>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-sm cursor-pointer hover:underline">
              <Globe size={18} />
              <span>English (US)</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm cursor-pointer hover:underline">
              <span>$ USD</span>
            </div>
            <div className="flex items-center gap-4">
              <MessageCircle size={18} className="cursor-pointer hover:text-gray-900 transition-colors" />
              <Send size={18} className="cursor-pointer hover:text-gray-900 transition-colors" />
              <Camera size={18} className="cursor-pointer hover:text-gray-900 transition-colors" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation (Floating) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        <Link to="/" className="flex flex-col items-center gap-1 text-airbnb">
          <Compass size={24} />
          <span className="text-[10px] font-bold">Explore</span>
        </Link>
        <Link to="/wishlists" className="flex flex-col items-center gap-1 text-gray-400">
          <Heart size={24} />
          <span className="text-[10px] font-bold">Wishlists</span>
        </Link>
        <Link to="/login" className="flex flex-col items-center gap-1 text-gray-400">
          <User size={24} />
          <span className="text-[10px] font-bold">Log in</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
