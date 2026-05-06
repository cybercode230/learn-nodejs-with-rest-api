import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

const Label: React.FC<LabelProps> = ({ children, required, className = '', ...props }) => {
  return (
    <label 
      className={`block text-sm font-bold text-gray-700 ml-1 mb-1.5 ${className}`} 
      {...props}
    >
      {children}
      {required && <span className="text-airbnb ml-1">*</span>}
    </label>
  );
};

export default Label;
