<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Family;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::with('family');
        
        // Búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('family', function($familyQuery) use ($search) {
                      $familyQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Paginación
        $categories = $query->paginate(10)->withQueryString();
        $families = Family::all();
        
        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'families' => $families,
            'filters' => $request->only(['search'])
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories', 'name')
            ],
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'family_id' => 'nullable|exists:families,id'
        ]);

        // Manejar la carga del logo
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('categories', 'public');
            $validated['logo'] = $logoPath;
        }

        Category::create($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Categoría creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load(['family', 'products']);
        
        return Inertia::render('Categories/Show', [
            'category' => $category
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories', 'name')->ignore($category->id)
            ],
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'family_id' => 'nullable|exists:families,id'
        ]);

        // Manejar la carga del logo
        if ($request->hasFile('logo')) {
            // Eliminar el logo anterior si existe
            if ($category->logo && Storage::disk('public')->exists($category->logo)) {
                Storage::disk('public')->delete($category->logo);
            }
            
            $logoPath = $request->file('logo')->store('categories', 'public');
            $validated['logo'] = $logoPath;
        }

        $category->update($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Categoría actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Verificar si la categoría tiene productos asociados
        if ($category->products()->count() > 0) {
            return redirect()->route('categories.index')
                ->with('error', 'No se puede eliminar la categoría porque tiene productos asociados.');
        }

        // Eliminar el logo si existe
        if ($category->logo && Storage::disk('public')->exists($category->logo)) {
            Storage::disk('public')->delete($category->logo);
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Categoría eliminada exitosamente.');
    }

    /**
     * Check if category can be deleted (for frontend validation)
     */
    public function checkDeletion(Category $category)
    {
        $productsCount = $category->products()->count();
        
        return response()->json([
            'canDelete' => $productsCount === 0,
            'productCount' => $productsCount,
            'message' => $productsCount > 0 
                ? "Esta categoría tiene {$productsCount} producto(s) asociado(s). No se puede eliminar."
                : null
        ]);
    }
}