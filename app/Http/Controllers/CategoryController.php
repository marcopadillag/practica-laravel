<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Family;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('categories/index', [
            'categories' => Category::with('family', 'products')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('categories/create', [
            'families' => Family::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'logo' => 'nullable|string|max:100',
            'family_id' => 'nullable|exists:families,id',
        ]);

        Category::create($validated);

        return to_route('categories.index')->with('success', 'Categoría creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category): Response
    {
        return Inertia::render('categories/show', [
            'category' => $category->load('family', 'products'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('categories/edit', [
            'category' => $category,
            'families' => Family::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'logo' => 'nullable|string|max:100',
            'family_id' => 'nullable|exists:families,id',
        ]);

        $category->update($validated);

        return to_route('categories.index')->with('success', 'Categoría actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        return to_route('categories.index')->with('success', 'Categoría eliminada exitosamente.');
    }
}