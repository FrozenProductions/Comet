import { ChevronLeft, ChevronRight } from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import type { GallerySectionProps } from "../../types/gallery";

const GallerySection: FC<GallerySectionProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
    const [isMobile, setIsMobile] = useState(false);

    const preloadImage = useCallback(
        (index: number) => {
            if (!loadedImages.has(index)) {
                const img = new Image();
                img.src = images[index].src;
                img.onload = () => {
                    setLoadedImages((prev) => new Set(prev).add(index));
                };
            }
        },
        [loadedImages, images],
    );

    const paginate = (newDirection: number) => {
        const nextIndex =
            (currentIndex + newDirection + images.length) % images.length;
        preloadImage(nextIndex);
        setCurrentIndex(nextIndex);
    };

    useEffect(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        preloadImage(nextIndex);
        preloadImage(prevIndex);
    }, [currentIndex, images, preloadImage]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    className="bg-theme-surface/80 hover:bg-theme-surface text-theme-subtle hover:text-theme-bright rounded-lg p-1.5 transition-colors duration-200 sm:p-2"
                    onClick={() => paginate(-1)}
                >
                    <ChevronLeft className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </button>

                <div className="flex-1">
                    <div className="overflow-hidden rounded-lg">
                        <div className="relative aspect-[16/9] w-full">
                            <div className="relative h-full w-full">
                                <img
                                    src={images[currentIndex].src}
                                    alt={images[currentIndex].alt}
                                    className="h-full w-full rounded-lg object-cover object-top shadow-sm transition-transform duration-300 hover:scale-[1.02]"
                                    loading="eager"
                                    crossOrigin="anonymous"
                                />
                                <div className="from-theme-base/90 via-theme-base/30 absolute inset-0 rounded-lg bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100">
                                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                                        <h3 className="text-theme-bright text-xs font-medium tracking-tight sm:text-sm">
                                            {images[currentIndex].alt}
                                        </h3>
                                        {!isMobile && (
                                            <p className="text-theme-subtle mt-1 text-[10px] sm:text-xs">
                                                {
                                                    images[currentIndex]
                                                        .description
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="bg-theme-surface/80 hover:bg-theme-surface text-theme-subtle hover:text-theme-bright rounded-lg p-1.5 transition-colors duration-200 sm:p-2"
                    onClick={() => paginate(1)}
                >
                    <ChevronRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </button>
            </div>

            <div className="mt-3 flex justify-center gap-1.5 sm:mt-4 sm:gap-2">
                {images.map((image, index) => (
                    <button
                        type="button"
                        key={image.src}
                        className={`h-1 w-1 rounded-full transition-colors duration-200 sm:h-1.5 sm:w-1.5 ${
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
