import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthLayout = ({ children, imagePosition = 'left', imageSrc, imageAlt, imageOverlayText }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [prevPosition, setPrevPosition] = useState(imagePosition);

    useEffect(() => {
        if (prevPosition !== imagePosition) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setPrevPosition(imagePosition);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [imagePosition, prevPosition]);

    const imageSection = (
        <div className="relative h-full min-h-[400px] lg:min-h-screen overflow-hidden">
            <img
                src={imageSrc}
                alt={imageAlt}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            {imageOverlayText && (
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">{imageOverlayText.title}</h2>
                    <p className="text-lg lg:text-xl text-gray-200">{imageOverlayText.subtitle}</p>
                </div>
            )}
        </div>
    );

    const formSection = (
        <div className="flex items-center justify-center p-8 lg:p-12 bg-white min-h-[600px] lg:min-h-screen">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden">
            <div className="grid lg:grid-cols-2 relative">
                {imagePosition === 'left' ? (
                    <>
                        <div
                            className={`transition-all duration-700 ease-in-out ${isAnimating ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
                                }`}
                        >
                            {imageSection}
                        </div>
                        <div
                            className={`transition-all duration-700 ease-in-out ${isAnimating ? 'transform -translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
                                }`}
                        >
                            {formSection}
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            className={`transition-all duration-700 ease-in-out ${isAnimating ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
                                }`}
                        >
                            {formSection}
                        </div>
                        <div
                            className={`transition-all duration-700 ease-in-out ${isAnimating ? 'transform -translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
                                }`}
                        >
                            {imageSection}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired,
    imagePosition: PropTypes.oneOf(['left', 'right']),
    imageSrc: PropTypes.string.isRequired,
    imageAlt: PropTypes.string,
    imageOverlayText: PropTypes.shape({
        title: PropTypes.string,
        subtitle: PropTypes.string,
    }),
};

export default AuthLayout;
