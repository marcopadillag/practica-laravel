<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'url_photo',
        'profile',
        'product_id',
    ];

    /**
     * Get the product that owns the photo.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}