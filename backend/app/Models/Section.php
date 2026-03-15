<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Section extends Model
{
    use HasFactory;

    protected $table = 'section';
    protected $primaryKey = 'section_id';
    public $timestamps = true;

    protected $fillable = [
        'section_name',
        'section_code',
        'description',
        'capacity',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];
}
