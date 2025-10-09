import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { AlertTriangleIcon, TrashIcon, XIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Category } from '@/types';
import { destroy as destroyRoute } from '@/routes/categories';
import { categories } from '@/routes';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

interface DeletionCheckResponse {
  canDelete: boolean;
  productCount: number;
  message: string;
}

export default function CategoryDeleteModal({ open, onOpenChange, category }: Props) {
  const [checkingDeletion, setCheckingDeletion] = useState(false);
  const [deletionCheck, setDeletionCheck] = useState<DeletionCheckResponse | null>(null);
  
  const { delete: destroy, processing } = useForm();

  useEffect(() => {
    if (open && category) {
      checkCanDelete();
    } else {
      setDeletionCheck(null);
    }
  }, [open, category]);

  const checkCanDelete = async () => {
    if (!category) return;
    
    setCheckingDeletion(true);
    try {
      const response = await fetch(`/categories/${category.id}/check-deletion`);
      const data = await response.json();
      setDeletionCheck(data);
    } catch (error) {
      console.error('Error checking deletion:', error);
      setDeletionCheck({
        canDelete: false,
        productCount: 0,
        message: 'Error al verificar si la categoría puede ser eliminada.'
      });
    } finally {
      setCheckingDeletion(false);
    }
  };

  const handleDelete = () => {
        if (!category || !deletionCheck?.canDelete) return;

        destroy(destroyRoute(category.id).url, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Categoría eliminada exitosamente');
            },
            onError: () => {
                toast.error('Error al eliminar la categoría');
            },
        });
    };

  const handleClose = () => {
    setDeletionCheck(null);
    onOpenChange(false);
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la categoría "{category.name}"?
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
                {deletionCheck.productCount > 0 && (
                  <span className="block mt-2 font-medium">
                    Productos asociados: {deletionCheck.productCount}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {deletionCheck?.canDelete && (
            <Alert>
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
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
                Eliminar Categoría
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}