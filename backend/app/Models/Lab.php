<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lab extends Model
{
    use HasFactory;

    protected $table = 'lab';
    protected $primaryKey = 'lab_id';
    public $timestamps = true;

    protected $fillable = [
        'lab_name',
        'lab_code',
        'location',
        'equipment',
        'capacity',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'is_active' => 'boolean',
    ];
}
