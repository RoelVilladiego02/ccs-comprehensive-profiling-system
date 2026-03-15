<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Curriculum extends Model
{
    use HasFactory;

    protected $table = 'curriculum';
    protected $primaryKey = 'curriculum_id';
    public $timestamps = true;

    protected $fillable = [
        'course_id',
        'version',
        'effective_date',
        'status',
    ];

    protected $casts = [
        'effective_date' => 'date',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}
