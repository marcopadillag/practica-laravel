import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Category, Auth, PaginatedData, BreadcrumbItem, SharedData } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CategoryCreateModal from './Partials/CategoryCreateModal';
import CategoryEditModal from './Partials/CategoryEditModal';
import CategoryDeleteModal from './Partials/CategoryDeleteModal';
import { categories } from '@/routes';

interface Props {
    auth: Auth;
    categories: PaginatedData<Category>;
    families: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categorías',
        href: categories().url,
    },
];

export default function Index({ auth, categories, families }: Props) {
  const { flash } = usePage<SharedData>().props;
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        setDeleteModalOpen(true);
    };

    const columns = createColumns(handleEdit, handleDelete);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />
            
            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-end">
                                <Button type="button" onClick={() => setCreateModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nueva Categoría
                                </Button>
                            </div>



                            {/* DataTable */}
                            <DataTable
                                columns={columns}
                                data={categories.data}
                                searchKey="name"
                                searchPlaceholder="Buscar categorías..."
                            />
                        </div>
                </div>
            </div>

            {/* Modals */}
            <CategoryCreateModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                families={families}
            />

            {selectedCategory && (
                <>
                    <CategoryEditModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        category={selectedCategory}
                        families={families}
                    />
                    <CategoryDeleteModal
                        open={deleteModalOpen}
                        onOpenChange={setDeleteModalOpen}
                        category={selectedCategory}
                    />
                </>
            )}
        </AppLayout>
    );
}