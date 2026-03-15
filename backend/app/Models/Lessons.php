<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lessons extends Model
{
    use HasFactory;

    protected $table = 'lessons';
    protected $primaryKey = 'lesson_id';
    public $timestamps = true;

    protected $fillable = [
        'syllabus_id',
        'lesson_title',
        'lesson_number',
        'duration_hours',
        'learning_outcomes',
        'materials',
        'description',
    ];

    protected $casts = [
        'duration_hours' => 'float',
    ];

    // Relationships
    public function syllabus(): BelongsTo
    {
        return $this->belongsTo(Syllabus::class, 'syllabus_id', 'syllabus_id');
    }
}
