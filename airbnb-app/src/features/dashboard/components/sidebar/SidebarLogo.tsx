import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface SidebarLogoProps {
  isCollapsed: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ isCollapsed }) => {
  const navigate =useNavigate();
  return (
    <div className="p-5 mb-2 flex items-center border-b border-gray-100">
      {isCollapsed ? (        
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-airbnb" onClick={()=> navigate("/dashbord")}>
             <img src="./logo.svg" alt="airb application logo"  className='flex-1'/>
          </div>        
      ) : (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/dashboard" className="flex items-center gap-2 text-airbnb hover:opacity-90 transition-all group">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-airbnb">
                  <img src="./logo.svg" alt="airb application logo"  className='flex-1'/>
                </div>
                <span className="text-xl text-airbnb">airbnb</span>
              </div>
          </Link>
          <span className="text-[10px] font-medium text-gray-400 ml-1">Dashboard</span>
        </motion.div>
      )}
    </div>
  );
};

export default SidebarLogo;