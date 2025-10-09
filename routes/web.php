<?php

use App\Http\Controllers\FamilyController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PhotoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Ruta individual para categories (genera función directa como dashboard)
    Route::get('categories-list', [CategoryController::class, 'index'])->name('categories');

    Route::get('products-list', [ProductController::class, 'index'])->name('products');

    Route::resource('families', FamilyController::class);
    Route::resource('categories', CategoryController::class);
    Route::get('/categories/{category}/check-deletion', [CategoryController::class, 'checkDeletion'])->name('categories.check-deletion');
    
    // Rutas específicas de productos (deben ir ANTES del resource)
    Route::get('/products/get-categories-by-family', [ProductController::class, 'getCategoriesByFamily'])->name('products.categories-by-family');
    Route::get('/products/{product}/check-deletion', [ProductController::class, 'checkDeletion'])->name('products.check-deletion');
    Route::resource('products', ProductController::class);
    
    Route::resource('photos', PhotoController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
