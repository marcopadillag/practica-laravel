<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Family;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('products/index', [
            'products' => Product::with('family', 'category', 'photos')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('products/create', [
            'families' => Family::all(),
            'categories' => Category::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:100',
            'name' => 'required|string|max:100',
            'price' => 'required|string|max:100',
            'description' => 'nullable|string',
            'family_id' => 'nullable|exists:families,id',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        Product::create($validated);

        return to_route('products.index')->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): Response
    {
        return Inertia::render('products/show', [
            'product' => $product->load('family', 'category', 'photos'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('products/edit', [
            'product' => $product,
            'families' => Family::all(),
            'categories' => Category::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:100',
            'name' => 'required|string|max:100',
            'price' => 'required|string|max:100',
            'description' => 'nullable|string',
            'family_id' => 'nullable|exists:families,id',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $product->update($validated);

        return to_route('products.index')->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return to_route('products.index')->with('success', 'Producto eliminado exitosamente.');
    }
}