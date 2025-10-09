<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Family;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['family', 'category', 'photos', 'profilePhoto']);
        
        // Búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('family', function($familyQuery) use ($search) {
                      $familyQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('category', function($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Filtro por familia
        if ($request->has('family_id') && $request->family_id) {
            $query->where('family_id', $request->family_id);
        }
        
        // Paginación
        $products = $query->paginate(10)->withQueryString();
        
        // Agregar la foto de perfil a cada producto usando la relación profilePhoto
        $products->getCollection()->transform(function ($product) {
            $product->profile_photo = $product->profilePhoto;
            return $product;
        });
        
        $families = Family::all();
        $categories = Category::all();
        
        return Inertia::render('Products/Index', [
            'products' => $products,
            'families' => $families,
            'categories' => $categories,
            'filters' => $request->only(['search', 'family_id'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Debug: Ver qué está llegando
        \Log::info('Request data:', [
            'has_photos' => $request->has('photos'),
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
        ]);

        $validated = $request->validate([
            'code' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'code')
            ],
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'family_id' => 'nullable|exists:families,id',
            'category_id' => 'nullable|exists:categories,id',
            'photos' => 'nullable|array',
            'photos.*.file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'photos.*.is_profile' => 'nullable|boolean',
        ]);

        // Generar código automático si no se proporciona
        if (empty($validated['code'])) {
            $validated['code'] = $this->generateProductCode();
        }

        // Crear el producto
        $product = Product::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'family_id' => $validated['family_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
        ]);

        // Guardar las fotos si existen
        if ($request->has('photos')) {
            $hasProfilePhoto = false;
            $photos = $request->input('photos', []);
            
            foreach ($photos as $index => $photoData) {
                // Verificar si hay un archivo para este índice
                if ($request->hasFile("photos.{$index}.file")) {
                    $file = $request->file("photos.{$index}.file");
                    
                    // Guardar la imagen en storage
                    $path = $file->store('products', 'public');
                    
                    // Determinar si es foto de perfil
                    $isProfile = isset($photoData['is_profile']) && 
                                ($photoData['is_profile'] == '1' || $photoData['is_profile'] == true);
                    
                    // Solo puede haber una foto de perfil
                    if ($isProfile && !$hasProfilePhoto) {
                        $hasProfilePhoto = true;
                    } else {
                        $isProfile = false;
                    }
                    
                    // Crear el registro de la foto
                    $product->photos()->create([
                        'url_photo' => $path,
                        'profile' => $isProfile ? 1 : 0,
                    ]);
                }
            }
            
            // Si no se marcó ninguna foto como perfil, marcar la primera
            if (!$hasProfilePhoto && $product->photos()->count() > 0) {
                $product->photos()->first()->update(['profile' => 1]);
            }
        }

        return redirect()->route('products.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['family', 'category', 'photos']);
        
        return Inertia::render('Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('products', 'code')->ignore($product->id)
            ],
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'family_id' => 'nullable|exists:families,id',
            'category_id' => 'nullable|exists:categories,id',
            'new_photos' => 'nullable|array',
            'new_photos.*.file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'new_photos.*.is_profile' => 'nullable|boolean',
            'delete_photos' => 'nullable|array',
            'delete_photos.*' => 'nullable|exists:photos,id',
            'profile_photo_id' => 'nullable|exists:photos,id',
        ]);

        // Actualizar información del producto
        $product->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'family_id' => $validated['family_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
        ]);

        // Eliminar fotos marcadas para eliminar
        if ($request->has('delete_photos') && is_array($request->delete_photos)) {
            foreach ($request->delete_photos as $photoId) {
                $photo = $product->photos()->find($photoId);
                if ($photo) {
                    // Eliminar archivo del storage
                    Storage::disk('public')->delete($photo->url_photo);
                    $photo->delete();
                }
            }
        }

        // Actualizar foto de perfil de fotos existentes
        if ($request->has('profile_photo_id')) {
            // Primero, quitar el perfil de todas las fotos
            $product->photos()->update(['profile' => 0]);
            // Marcar la foto seleccionada como perfil
            $product->photos()->where('id', $request->profile_photo_id)->update(['profile' => 1]);
        }

        // Agregar nuevas fotos
        if ($request->has('new_photos')) {
            $hasProfilePhoto = $product->photos()->where('profile', 1)->exists();
            $newPhotos = $request->input('new_photos', []);
            
            foreach ($newPhotos as $index => $photoData) {
                // Verificar si hay un archivo para este índice
                if ($request->hasFile("new_photos.{$index}.file")) {
                    $file = $request->file("new_photos.{$index}.file");
                    
                    // Guardar la imagen en storage
                    $path = $file->store('products', 'public');
                    
                    // Determinar si es foto de perfil
                    $isProfile = isset($photoData['is_profile']) && 
                                ($photoData['is_profile'] == '1' || $photoData['is_profile'] == true);
                    
                    // Si esta foto debe ser perfil, quitar perfil de las demás
                    if ($isProfile && !$hasProfilePhoto) {
                        $product->photos()->update(['profile' => 0]);
                        $hasProfilePhoto = true;
                    } else {
                        $isProfile = false;
                    }
                    
                    // Crear el registro de la foto
                    $product->photos()->create([
                        'url_photo' => $path,
                        'profile' => $isProfile ? 1 : 0,
                    ]);
                }
            }
            
            // Si no hay foto de perfil después de todos los cambios, marcar la primera
            if (!$product->photos()->where('profile', 1)->exists() && $product->photos()->count() > 0) {
                $product->photos()->first()->update(['profile' => 1]);
            }
        }

        return redirect()->route('products.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Eliminar todas las fotos asociadas del storage
        foreach ($product->photos as $photo) {
            Storage::disk('public')->delete($photo->url_photo);
        }
        
        // Eliminar el producto (las fotos se eliminarán en cascada si está configurado,
        // o manualmente si no)
        $product->photos()->delete();
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    /**
     * Check if product can be deleted (for frontend validation)
     */
    public function checkDeletion(Product $product)
    {
        $photosCount = $product->photos()->count();
        
        return response()->json([
            'canDelete' => true,
            'photoCount' => $photosCount,
            'message' => $photosCount > 0 
                ? "Este producto tiene {$photosCount} foto(s) asociada(s). Se eliminarán junto con el producto."
                : null
        ]);
    }

    /**
     * Get categories by family
     */
    public function getCategoriesByFamily(Request $request)
    {
        $familyId = $request->get('family_id');
        
        if (!$familyId) {
            return response()->json([]);
        }
        
        $categories = Category::where('family_id', $familyId)->get();
        
        return response()->json($categories);
    }

    /**
     * Generate automatic product code
     */
    private function generateProductCode()
    {
        $lastProduct = Product::orderBy('id', 'desc')->first();
        
        if (!$lastProduct) {
            return 'P001';
        }
        
        // Extraer el número del último código
        $lastCode = $lastProduct->code;
        if (preg_match('/P(\d+)/', $lastCode, $matches)) {
            $number = intval($matches[1]) + 1;
        } else {
            // Si no sigue el patrón, contar todos los productos
            $number = Product::count() + 1;
        }
        
        return 'P' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }
}