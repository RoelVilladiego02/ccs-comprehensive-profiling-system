<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends Model
{
    use HasFactory;

    protected $table = 'lessons';
    protected $primaryKey = 'lesson_id';
    public $timestamps = true;

    protected $fillable = [
        'syllabus_id',
        'lesson_number',
        'title',
        'content',
        'objectives',
        'duration_hours',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function syllabus(): BelongsTo
    {
        return $this->belongsTo(Syllabus::class, 'syllabus_id', 'syllabus_id');
    }
}
