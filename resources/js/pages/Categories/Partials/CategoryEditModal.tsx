import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ImageIcon, UploadIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Family, CategoryFormData } from '@/types';
import { update } from '@/routes/categories';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  families: Family[];
}

export default function CategoryEditModal({ open, onOpenChange, category, families }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const { data, setData, post, processing, errors, reset } = useForm<CategoryFormData>({
    name: category.name,
    description: category.description || '',
    logo: null,
    family_id: category.family_id,
  });

  useEffect(() => {
    if (open) {
      setData({
        name: category.name,
        description: category.description || '',
        logo: null,
        family_id: category.family_id,
      });
      setLogoPreview(category.logo ? `/storage/${category.logo}` : null);
    }
  }, [open, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.logo) formData.append('logo', data.logo);
    if (data.family_id) formData.append('family_id', data.family_id.toString());

    post(update(category.id).url, {
      forceFormData: true,
      onSuccess: () => {
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
    setLogoPreview(category.logo ? `/storage/${category.logo}` : null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Modifica los datos de la categoría "{category.name}".
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
                  {logoPreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
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
              {processing ? 'Actualizando...' : 'Actualizar Categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}