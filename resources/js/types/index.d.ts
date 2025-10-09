import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash?: {
        success?: string;
        error?: string;
    };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Family {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    categories?: Category[];
    products?: Product[];
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    logo?: string;
    family_id?: number;
    created_at: string;
    updated_at: string;
    family?: Family;
    products?: Product[];
}

export interface Product {
    id: number;
    code: string;
    name: string;
    price: string;
    description?: string;
    family_id?: number;
    category_id?: number;
    created_at: string;
    updated_at: string;
    family?: Family;
    category?: Category;
    photos?: Photo[];
    profile_photo?: Photo;
}

export interface Photo {
    id: number;
    url_photo: string;
    profile?: number;
    product_id?: number;
    created_at: string;
    updated_at: string;
    product?: Product;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface CategoryFormData {
    name: string;
    description?: string;
    logo?: File | null;
    family_id?: number;
}

export interface CategoryFilters {
    search?: string;
}

export interface ProductFormData {
    code: string;
    name: string;
    price: string;
    description?: string;
    family_id?: number;
    category_id?: number;
}

export interface ProductFilters {
    search?: string;
}
