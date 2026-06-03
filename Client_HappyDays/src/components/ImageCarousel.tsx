import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
    images: string[];
    alt: string;
    className?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt, className = '' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    // Filter out images that failed to load
    const validImages = images.filter((_, index) => !imageErrors.has(index));
    const hasMultipleImages = validImages.length > 1;

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    };

    const handleImageError = (index: number) => {
        setImageErrors((prev) => new Set(prev).add(index));
        // If current image failed, try to show next valid one
        if (index === currentIndex && currentIndex > 0) {
            setCurrentIndex(0);
        }
    };

    // Get the actual image to display (accounting for errors)
    const displayIndex = Math.min(currentIndex, validImages.length - 1);
    const currentImage = validImages[displayIndex] || images[0];

    return (
        <div className={`relative w-full h-full overflow-hidden group ${className}`}>
            <img
                src={currentImage}
                alt={`${alt} - ${displayIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => handleImageError(images.indexOf(currentImage))}
            />

            {/* Navigation arrows - only show if multiple valid images */}
            {hasMultipleImages && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        aria-label="Image précédente"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        aria-label="Image suivante"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {validImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(index);
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === displayIndex
                                        ? 'bg-white scale-110'
                                        : 'bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`Image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
