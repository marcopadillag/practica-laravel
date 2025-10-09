import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangleIcon, TrashIcon, XIcon, Loader2 } from 'lucide-react';
import products from '@/routes/products';
import { Product } from '@/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

interface DeletionCheckResponse {
  canDelete: boolean;
  photoCount: number;
  message: string;
}

export default function ProductDeleteModal({ open, onOpenChange, product }: Props) {
  const [checkingDeletion, setCheckingDeletion] = useState(false);
  const [deletionCheck, setDeletionCheck] = useState<DeletionCheckResponse | null>(null);
  
  const { delete: deleteProduct, processing } = useForm();

  useEffect(() => {
    if (open && product) {
      checkCanDelete();
    } else {
      setDeletionCheck(null);
    }
  }, [open, product]);

  const checkCanDelete = async () => {
    if (!product) return;
    
    setCheckingDeletion(true);
    try {
      const response = await fetch(`/products/${product.id}/check-deletion`);
      const data = await response.json();
      setDeletionCheck(data);
    } catch (error) {
      console.error('Error checking deletion:', error);
      setDeletionCheck({
        canDelete: false,
        photoCount: 0,
        message: 'Error al verificar si el producto puede ser eliminado.'
      });
    } finally {
      setCheckingDeletion(false);
    }
  };

  const handleDelete = () => {
    if (!product || !deletionCheck?.canDelete) return;

    deleteProduct(products.destroy(product.id).url, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success('Producto eliminado exitosamente');
      },
      onError: () => {
        toast.error('Error al eliminar el producto');
      },
    });
  };

  const handleClose = () => {
    setDeletionCheck(null);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el producto "{product.name}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Deletion Check Status */}
          {checkingDeletion && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Verificando...</span>
            </div>
          )}

          {deletionCheck && !checkingDeletion && deletionCheck.message && (
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                {deletionCheck.message}
                {deletionCheck.photoCount > 0 && (
                  <span className="block mt-2 font-medium">
                    Fotos asociadas: {deletionCheck.photoCount}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {deletionCheck?.canDelete && (
            <Alert>
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                Esta acción no se puede deshacer. El producto será eliminado permanentemente.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={processing || checkingDeletion}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={processing || checkingDeletion || !deletionCheck?.canDelete}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <TrashIcon className="w-4 h-4" />
                Eliminar Producto
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}