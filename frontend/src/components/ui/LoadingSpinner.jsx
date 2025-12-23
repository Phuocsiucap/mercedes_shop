/**
 * LoadingSpinner Component
 * Reusable loading indicator with different sizes and variants
 * 
 * @param {string} size - Spinner size: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} variant - Spinner style: 'primary', 'secondary', 'white' (default: 'primary')
 * @param {string} className - Additional CSS classes
 * @param {boolean} overlay - Whether to show as full-screen overlay
 * @param {string} text - Loading text to display
 */
const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  className = '',
  overlay = false,
  text = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const variantClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={spinnerClasses} />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * LoadingDots Component
 * Alternative loading indicator with bouncing dots
 */
const LoadingDots = ({ 
  size = 'md', 
  variant = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white'
  };

  const dotClasses = `
    rounded-full animate-bounce
    ${sizeClasses[size]}
    ${variantClasses[variant]}
  `.trim();

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className={dotClasses} style={{ animationDelay: '0ms' }} />
      <div className={dotClasses} style={{ animationDelay: '150ms' }} />
      <div className={dotClasses} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

/**
 * LoadingPulse Component
 * Skeleton loading placeholder
 */
const LoadingPulse = ({ 
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = 'rounded'
}) => {
  return (
    <div className={`animate-pulse bg-gray-300 ${height} ${width} ${rounded} ${className}`} />
  );
};

// Attach variants to main component
LoadingSpinner.Dots = LoadingDots;
LoadingSpinner.Pulse = LoadingPulse;

export default LoadingSpinner;