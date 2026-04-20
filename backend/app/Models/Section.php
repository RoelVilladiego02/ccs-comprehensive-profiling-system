<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @deprecated This model and section table are no longer used.
 * All section data is now stored in the SchoolClass model's 'section' field.
 * This model is kept for backwards compatibility but should not be used for new code.
 * The section table will be dropped in a future migration (2026_04_21_000001_drop_section_table.php)
 */
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
