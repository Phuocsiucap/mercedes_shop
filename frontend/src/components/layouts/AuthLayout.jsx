import { useEffect } from 'react';

const AuthLayout = ({ 
  children, 
  imagePosition = 'left', 
  imageSrc, 
  imageAlt, 
  imageOverlayText 
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const imageContent = (
    <div className="relative h-full">
      {imageSrc && (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      {imageOverlayText && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="text-4xl font-bold mb-4">{imageOverlayText.title}</h2>
            <p className="text-xl">{imageOverlayText.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );

  const formContent = (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {imagePosition === 'left' ? (
        <>
          <div className="hidden lg:block lg:w-1/2">
            {imageContent}
          </div>
          <div className="w-full lg:w-1/2">
            {formContent}
          </div>
        </>
      ) : (
        <>
          <div className="w-full lg:w-1/2">
            {formContent}
          </div>
          <div className="hidden lg:block lg:w-1/2">
            {imageContent}
          </div>
        </>
      )}
    </div>
  );
};

export default AuthLayout;