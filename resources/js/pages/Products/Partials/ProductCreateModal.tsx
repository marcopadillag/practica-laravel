import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import products from '@/routes/products';
import { Family, ProductFormData } from '@/types';
import { toast } from 'sonner';
import { Upload, X, Star } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  families: Family[];
}

interface PhotoPreview {
  id: string;
  file: File;
  preview: string;
  isProfile: boolean;
}

export default function ProductCreateModal({ open, onOpenChange, families }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  
  const { data, setData, post, processing, errors, reset } = useForm<ProductFormData>({
    code: '',
    name: '',
    price: '',
    description: '',
    family_id: undefined,
    category_id: undefined,
  });

  // Fetch categories when family changes
  useEffect(() => {
    if (data.family_id) {
      fetch(`/products/get-categories-by-family?family_id=${data.family_id}`)
        .then(response => response.json())
        .then(data => setCategories(data))
        .catch(() => setCategories([]));
      setData('category_id', undefined);
    } else {
      setCategories([]);
      setData('category_id', undefined);
    }
  }, [data.family_id]);

  // Manejar selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoPreview[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isProfile: photos.length === 0 && index === 0, // Primera foto es perfil por defecto
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = ''; // Reset input
  };

  // Eliminar foto
  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      const removedPhoto = prev.find(p => p.id === id);
      
      // Si eliminamos la foto de perfil, hacer que la primera sea perfil
      if (removedPhoto?.isProfile && filtered.length > 0) {
        filtered[0].isProfile = true;
      }
      
      // Limpiar el preview URL
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.preview);
      }
      
      return filtered;
    });
  };

  // Marcar foto como perfil
  const setProfilePhoto = (id: string) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isProfile: p.id === id,
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('code', data.code || '');
    formData.append('name', data.name);
    formData.append('price', data.price.toString());
    formData.append('description', data.description || '');
    
    if (data.family_id) {
      formData.append('family_id', data.family_id.toString());
    }
    if (data.category_id) {
      formData.append('category_id', data.category_id.toString());
    }

    // Agregar fotos
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}][file]`, photo.file);
      formData.append(`photos[${index}][is_profile]`, photo.isProfile ? '1' : '0');
    });
    
    // Usar router.post para enviar FormData
    router.post(products.store.url(), formData, {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setCategories([]);
        setPhotos([]);
        onOpenChange(false);
        toast.success('Producto creado exitosamente');
      },
      onError: (errors) => {
        console.error('Errores de validación:', errors);
        toast.error('Error al crear el producto');
      },
    });
  };

  const handleClose = () => {
    reset();
    setCategories([]);
    // Limpiar preview URLs
    photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Producto</DialogTitle>
          <DialogDescription>
            Agrega un nuevo producto al inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              type="text"
              value={data.code}
              onChange={(e) => setData('code', e.target.value)}
              placeholder="Código del producto (opcional)"
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Ingresa el nombre del producto"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={data.price}
              onChange={(e) => setData('price', e.target.value)}
              placeholder="0.00"
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Family */}
          <div className="space-y-2">
            <Label htmlFor="family">Familia</Label>
            <Select
              value={data.family_id?.toString() || 'none'}
              onValueChange={(value) => setData('family_id', value === 'none' ? undefined : parseInt(value))}
            >
              <SelectTrigger className={errors.family_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una familia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin familia</SelectItem>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id.toString()}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.family_id && (
              <p className="text-sm text-red-600">{errors.family_id}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={data.category_id?.toString() || 'none'}
              onValueChange={(value) => setData('category_id', value === 'none' ? undefined : parseInt(value))}
              disabled={!data.family_id}
            >
              <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={
                  !data.family_id 
                    ? "Primero selecciona una familia" 
                    : "Selecciona una categoría"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-600">{errors.category_id}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
              placeholder="Describe el producto (opcional)"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Photos Section */}
          <div className="space-y-3">
            <Label>Imágenes del Producto</Label>
            
            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir Imágenes
              </Button>
            </div>

            {/* Carousel de fotos */}
            {photos.length > 0 && (
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {photos.map((photo) => (
                      <CarouselItem key={photo.id} className="basis-1/3 pl-2 md:pl-4">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted group">
                          <img
                            src={photo.preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                          
                          {/* Badge de foto de perfil */}
                          {photo.isProfile && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              Perfil
                            </div>
                          )}
                          
                          {/* Botones de acción */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {!photo.isProfile && (
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-7 w-7"
                                onClick={() => setProfilePhoto(photo.id)}
                                title="Marcar como foto de perfil"
                              >
                                <Star className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7"
                              onClick={() => removePhoto(photo.id)}
                              title="Eliminar foto"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {photos.length > 3 && (
                    <>
                      <CarouselPrevious className="left-0" />
                      <CarouselNext className="right-0" />
                    </>
                  )}
                </Carousel>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {photos.length} imagen{photos.length !== 1 ? 'es' : ''} agregada{photos.length !== 1 ? 's' : ''}
                  {photos.some(p => p.isProfile) && ' • Haz clic en la estrella para marcar como perfil'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Creando...' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}