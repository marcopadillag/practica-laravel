<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PhotoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('photos/index', [
            'photos' => Photo::with('product')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('photos/create', [
            'products' => Product::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'url_photo' => 'required|string|max:255',
            'profile' => 'nullable|integer|in:0,1',
            'product_id' => 'nullable|exists:products,id',
        ]);

        // Si esta foto es marcada como perfil (profile = 1), 
        // actualizar todas las demás fotos del mismo producto a profile = 0
        if (isset($validated['profile']) && $validated['profile'] == 1 && isset($validated['product_id'])) {
            Photo::where('product_id', $validated['product_id'])
                ->update(['profile' => 0]);
        }

        Photo::create($validated);

        return to_route('photos.index')->with('success', 'Foto creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Photo $photo): Response
    {
        return Inertia::render('photos/show', [
            'photo' => $photo->load('product'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Photo $photo): Response
    {
        return Inertia::render('photos/edit', [
            'photo' => $photo,
            'products' => Product::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Photo $photo): RedirectResponse
    {
        $validated = $request->validate([
            'url_photo' => 'required|string|max:255',
            'profile' => 'nullable|integer|in:0,1',
            'product_id' => 'nullable|exists:products,id',
        ]);

        // Si esta foto es marcada como perfil (profile = 1), 
        // actualizar todas las demás fotos del mismo producto a profile = 0
        if (isset($validated['profile']) && $validated['profile'] == 1 && isset($validated['product_id'])) {
            Photo::where('product_id', $validated['product_id'])
                ->where('id', '!=', $photo->id)
                ->update(['profile' => 0]);
        }

        $photo->update($validated);

        return to_route('photos.index')->with('success', 'Foto actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Photo $photo): RedirectResponse
    {
        $photo->delete();

        return to_route('photos.index')->with('success', 'Foto eliminada exitosamente.');
    }
}