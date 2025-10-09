import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Product } from "@/types"

interface ColumnActionsProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const ColumnActions = ({ product, onEdit, onDelete }: ColumnActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(product)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(product)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const createColumns = (
    onEdit: (product: Product) => void,
    onDelete: (product: Product) => void,
    onViewPhotos?: (product: Product) => void
): ColumnDef<Product>[] => [
    {
        accessorKey: "code",
        header: "Código",
        cell: ({ row }) => {
            const code = row.getValue("code") as string
            return <Badge variant="outline">{code}</Badge>
        },
    },
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "profile_photo",
        header: "Fotos",
        cell: ({ row }) => {
            const photo = row.original.profile_photo;
            const hasPhotos = row.original.photos && row.original.photos.length > 0;
            
            if (!photo) return <span className="text-muted-foreground">Sin foto</span>;
            
            return (
                <img
                    src={`/storage/${photo.url_photo}`}
                    alt={row.getValue("name")}
                    className="h-12 w-12 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => hasPhotos && onViewPhotos?.(row.original)}
                />
            );
        },
    },
    {
        accessorKey: "family",
        header: "Familia",
        cell: ({ row }) => {
            const product = row.original
            return product.family ? (
                <Badge variant="secondary">{product.family.name}</Badge>
            ) : (
                <span className="text-muted-foreground text-sm">Sin familia</span>
            )
        },
    },
    {
        accessorKey: "category",
        header: "Categoría",
        cell: ({ row }) => {
            const product = row.original
            return product.category ? (
                <Badge variant="secondary">{product.category.name}</Badge>
            ) : (
                <span className="text-muted-foreground text-sm">Sin categoría</span>
            )
        },
    },
    {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => {
            const price = row.getValue("price") as string
            return (
                <div className="font-medium">
                    ${parseFloat(price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
            )
        },
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => {
            const description = row.getValue("description") as string
            return (
                <div className="max-w-[300px] truncate" title={description}>
                    {description || "Sin descripción"}
                </div>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const product = row.original
            return (
                <ColumnActions
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )
        },
     },
]