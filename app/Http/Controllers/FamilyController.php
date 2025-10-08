<?php

namespace App\Http\Controllers;

use App\Models\Family;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FamilyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('families/index', [
            'families' => Family::with('categories', 'products')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('families/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        Family::create($validated);

        return to_route('families.index')->with('success', 'Familia creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Family $family): Response
    {
        return Inertia::render('families/show', [
            'family' => $family->load('categories', 'products'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Family $family): Response
    {
        return Inertia::render('families/edit', [
            'family' => $family,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Family $family): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $family->update($validated);

        return to_route('families.index')->with('success', 'Familia actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Family $family): RedirectResponse
    {
        $family->delete();

        return to_route('families.index')->with('success', 'Familia eliminada exitosamente.');
    }
}