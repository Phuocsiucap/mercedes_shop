import { forwardRef } from 'react';

/**
 * Input Component
 * Reusable input field with validation states and various types
 * 
 * @param {string} type - Input type (default: 'text')
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 * @param {string} error - Error message to display
 * @param {string} helperText - Helper text to display
 * @param {boolean} required - Whether input is required
 * @param {boolean} disabled - Whether input is disabled
 * @param {string} size - Input size: 'sm', 'md', 'lg' (default: 'md')
 * @param {ReactNode} leftIcon - Icon to display on the left
 * @param {ReactNode} rightIcon - Icon to display on the right
 * @param {string} className - Additional CSS classes
 * @param {string} containerClassName - Additional CSS classes for container
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `.trim();

  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;