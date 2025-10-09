import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: Photo[];
  initialIndex?: number;
}

export default function ProductPhotoPreview({ open, onOpenChange, photos, initialIndex = 0 }: Props) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Ir al índice inicial cuando se abre el modal
  React.useEffect(() => {
    if (api && open && initialIndex !== undefined) {
      api.scrollTo(initialIndex);
    }
  }, [api, open, initialIndex]);

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return null;
    return `/storage/${photoPath}`;
  };

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex flex-col">
          {/* Botón de cerrar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Contador de fotos */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
            {current + 1} / {count}
          </div>

          {/* Carousel */}
          <div className="flex-1 flex items-center justify-center p-8">
            <Carousel
              setApi={setApi}
              className="w-full max-w-5xl"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id}>
                    <div className="flex items-center justify-center h-[80vh]">
                      <img
                        src={getImageUrl(photo.url_photo) || ''}
                        alt="Foto del producto"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {photos.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 h-12 w-12 bg-black/60 hover:bg-black/80 text-white border-none" />
                  <CarouselNext className="right-4 h-12 w-12 bg-black/60 hover:bg-black/80 text-white border-none" />
                </>
              )}
            </Carousel>
          </div>

          {/* Miniaturas */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/60 p-2 rounded-lg max-w-[90vw] overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => api?.scrollTo(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    current === index ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(photo.url_photo) || ''}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
