export interface GalleryImageProps {
    src: string;
    alt: string;
    description?: string;
}

export interface GallerySectionProps {
    images: GalleryImageProps[];
}
