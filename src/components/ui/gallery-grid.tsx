import { ResilientImage } from "@/components/ui/resilient-image";
import { cn } from "@/lib/utils";

type GalleryImage = {
  src: string;
  alt: string;
};

type GalleryGridProps = {
  images: GalleryImage[];
  limit?: number;
};

export function GalleryGrid({ images, limit }: GalleryGridProps) {
  const visibleImages = typeof limit === "number" ? images.slice(0, limit) : images;

  return (
    <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visibleImages.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={cn(
            "group relative overflow-hidden rounded-lg bg-[var(--sand)] ring-1 ring-[var(--border-soft)]",
            index === 0 && "sm:col-span-2 sm:row-span-2",
            index === 3 && "lg:row-span-2",
          )}
        >
          <ResilientImage
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
            fallbackLabel="Gallery photo coming soon"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/36 via-transparent to-transparent opacity-80" />
          <p className="absolute bottom-4 left-4 right-4 translate-y-3 text-sm font-bold text-white opacity-0 drop-shadow transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-0 sm:opacity-90">
            {image.alt}
          </p>
        </div>
      ))}
    </div>
  );
}
