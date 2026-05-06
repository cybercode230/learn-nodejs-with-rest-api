import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = true,
  noPadding = false 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-gray-100 overflow-hidden
        ${hoverable ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${noPadding ? '' : 'p-4'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
