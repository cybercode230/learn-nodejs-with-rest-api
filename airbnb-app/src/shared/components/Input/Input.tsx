import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-airbnb transition-colors">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full py-3.5 bg-gray-50 border rounded-[10px] outline-none transition-all duration-200
              ${leftIcon ? 'pl-12' : 'px-4'} 
              ${rightIcon ? 'pr-12' : 'px-4'}
              ${error 
                ? 'border-red-300 focus:ring-2 focus:ring-red-100' 
                : 'border-gray-200 focus:border-airbnb focus:ring-2 focus:ring-airbnb/10'}
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-xs font-medium text-red-500 ml-1 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
