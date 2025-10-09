import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Product, Auth, PaginatedData, BreadcrumbItem, SharedData, Family } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import ProductCreateModal from './Partials/ProductCreateModal';
import ProductEditModal from './Partials/ProductEditModal';
import ProductDeleteModal from './Partials/ProductDeleteModal';
import ProductPhotoPreview from './Partials/ProductPhotoPreview';
import { products } from '@/routes';

interface Props {
    auth: Auth;
    products: PaginatedData<Product>;
    families: Family[];
    filters: {
        search?: string;
        family_id?: number | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: products().url,
    },
];

export default function Index({ auth, products: productsData, families, filters }: Props) {
  const { flash } = usePage<SharedData>().props;
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setDeleteModalOpen(true);
    };

    const handleViewPhotos = (product: Product) => {
        setSelectedProduct(product);
        setPreviewOpen(true);
    };

    const columns = createColumns(handleEdit, handleDelete, handleViewPhotos);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />
            
            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-end">
                                <Button type="button" onClick={() => setCreateModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Producto
                                </Button>
                            </div>

                            {/* DataTable */}
                            <DataTable
                                columns={columns}
                                data={productsData.data}
                                searchKey="name"
                                searchPlaceholder="Buscar productos..."
                                filterOptions={{
                                    filterKey: 'family_id',
                                    filterLabel: 'Familia',
                                    options: families.map(family => ({
                                        value: family.id,
                                        label: family.name
                                    })),
                                    currentValue: filters.family_id
                                }}
                                pagination={{
                                    current_page: productsData.current_page,
                                    last_page: productsData.last_page,
                                    per_page: productsData.per_page,
                                    total: productsData.total,
                                    links: productsData.links,
                                }}
                            />
                        </div>
                </div>
            </div>

            {/* Modals */}
            <ProductCreateModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                families={families}
            />

            {selectedProduct && (
                <>
                    <ProductEditModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        product={selectedProduct}
                        families={families}
                    />
                    <ProductDeleteModal
                        open={deleteModalOpen}
                        onOpenChange={setDeleteModalOpen}
                        product={selectedProduct}
                    />
                    <ProductPhotoPreview
                        open={previewOpen}
                        onOpenChange={setPreviewOpen}
                        photos={selectedProduct.photos || []}
                        initialIndex={0}
                    />
                </>
            )}
        </AppLayout>
    );
}