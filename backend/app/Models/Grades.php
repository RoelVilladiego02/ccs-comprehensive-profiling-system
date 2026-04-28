<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grades extends Model
{
    use HasFactory;

    protected $table = 'grades';
    protected $primaryKey = 'grade_id';
    public $timestamps = false;

    protected $fillable = [
        'student_id',
        'class_id',
        'midterm_grade',
        'final_grade_numeric',
        'grade_letter',
        'is_passed',
        'remarks',
        // Legacy columns (kept for backwards compatibility)
        'assessment_type',
        'assessment_name',
        'score',
        'max_score',
        'percentage',
        'grade_date',
        'final_grade',
    ];

    protected $casts = [
        'midterm_grade' => 'float',
        'final_grade_numeric' => 'float',
        'is_passed' => 'boolean',
    ];

    // Accessors for API responses
    protected $appends = ['final_grade'];

    /**
     * Get the final_grade attribute for API responses
     * Maps final_grade_numeric to final_grade for API consistency
     */
    public function getFinalGradeAttribute(): ?float
    {
        return $this->getAttribute('final_grade_numeric');
    }

    /**
     * Set the final_grade attribute when saving
     * Maps final_grade to final_grade_numeric
     */
    public function setFinalGradeAttribute($value): void
    {
        $this->attributes['final_grade_numeric'] = $value;
    }

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id', 'class_id');
    }
}
