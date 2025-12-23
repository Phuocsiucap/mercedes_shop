import { forwardRef } from 'react';

/**
 * Button Component
 * Reusable button with multiple variants and sizes
 * 
 * @param {string} variant - Button style: 'primary', 'secondary', 'danger', 'success', 'warning', 'ghost' (default: 'primary')
 * @param {string} size - Button size: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} disabled - Whether button is disabled
 * @param {boolean} loading - Whether button is in loading state
 * @param {ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} leftIcon - Icon to display on the left
 * @param {ReactNode} rightIcon - Icon to display on the right
 * @param {boolean} fullWidth - Whether button should take full width
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim();

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      )}
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;