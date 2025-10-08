import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Upload, Loader2, ImageIcon, UploadIcon } from 'lucide-react';
import { store } from '@/routes/categories';
import { Family, CategoryFormData } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  families: Family[];
}

export default function CategoryCreateModal({ open, onOpenChange, families }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const { data, setData, post, processing, errors, reset } = useForm<CategoryFormData>({
    name: '',
    description: '',
    logo: null,
    family_id: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post(store.url(), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setLogoPreview(null);
        onOpenChange(false);
      },
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('logo', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    reset();
    setLogoPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una nueva categoría para organizar tus productos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                  className="w-full"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Seleccionar Imagen
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF hasta 2MB
                </p>
              </div>
            </div>
            {errors.logo && (
              <p className="text-sm text-red-600">{errors.logo}</p>
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
              placeholder="Ingresa el nombre de la categoría"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
              placeholder="Describe la categoría (opcional)"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
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
              {processing ? 'Creando...' : 'Crear Categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}