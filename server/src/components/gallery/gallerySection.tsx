import { FC, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GallerySectionProps } from "../../types/gallery";

const GallerySection: FC<GallerySectionProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

    const paginate = (newDirection: number) => {
        const nextIndex =
            (currentIndex + newDirection + images.length) % images.length;
        preloadImage(nextIndex);
        setCurrentIndex(nextIndex);
    };

    const preloadImage = (index: number) => {
        if (!loadedImages.has(index)) {
            const img = new Image();
            img.src = images[index].src;
            img.onload = () => {
                setLoadedImages((prev) => new Set(prev).add(index));
            };
        }
    };

    useEffect(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        preloadImage(nextIndex);
        preloadImage(prevIndex);
    }, [currentIndex, images]);

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-2">
                <button
                    className="p-2 bg-theme-surface/80 hover:bg-theme-surface text-theme-subtle hover:text-theme-bright rounded-lg"
                    onClick={() => paginate(-1)}
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="flex-1">
                    <div className="overflow-hidden rounded-lg">
                        <div className="relative aspect-[16/9] w-full">
                            <div className="relative w-full h-full">
                                <img
                                    src={images[currentIndex].src}
                                    alt={images[currentIndex].alt}
                                    className="w-full h-full object-cover object-top rounded-lg shadow-sm"
                                    loading="eager"
                                    crossOrigin="anonymous"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-theme-base/90 via-theme-base/30 to-transparent opacity-0 hover:opacity-100 rounded-lg">
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-theme-bright font-medium text-sm tracking-tight">
                                            {images[currentIndex].alt}
                                        </h3>
                                        <p className="text-theme-subtle text-xs mt-1">
                                            {images[currentIndex].description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    className="p-2 bg-theme-surface/80 hover:bg-theme-surface text-theme-subtle hover:text-theme-bright rounded-lg"
                    onClick={() => paginate(1)}
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="flex justify-center gap-2 mt-4">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${
                            index === currentIndex
                                ? "bg-theme-accent"
                                : "bg-theme-surface/50 hover:bg-theme-surface"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GallerySection;
