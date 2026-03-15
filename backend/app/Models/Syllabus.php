<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Syllabus extends Model
{
    use HasFactory;

    protected $table = 'syllabus';
    protected $primaryKey = 'syllabus_id';
    public $timestamps = true;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'objectives',
        'prerequisites',
        'total_hours',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lessons::class, 'syllabus_id', 'syllabus_id');
    }
}
