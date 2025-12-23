/**
 * Card Component
 * Reusable content container with consistent styling
 * 
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Card style: 'default', 'bordered', 'elevated' (default: 'default')
 * @param {string} padding - Card padding: 'none', 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} hoverable - Whether card should have hover effects
 * @param {function} onClick - Click handler for interactive cards
 */
const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hoverable = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg';

  const variantClasses = {
    default: 'shadow-md',
    bordered: 'border border-gray-200',
    elevated: 'shadow-lg'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const interactiveClasses = hoverable || onClick
    ? 'transition-all duration-200 hover:shadow-lg cursor-pointer'
    : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${interactiveClasses}
    ${className}
  `.trim();

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * CardHeader Component
 * Header section for cards with title and optional actions
 */
const CardHeader = ({ 
  title, 
  subtitle, 
  actions, 
  className = '' 
}) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CardBody Component
 * Main content area for cards
 */
const CardBody = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

/**
 * CardFooter Component
 * Footer section for cards with actions or additional info
 */
const CardFooter = ({ 
  children, 
  className = '',
  justify = 'end' 
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 flex items-center ${justifyClasses[justify]} ${className}`}>
      {children}
    </div>
  );
};

// Attach sub-components to main Card component
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;