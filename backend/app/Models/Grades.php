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
        'final_grade',
        'grade_letter',
        'is_passed',
        'remarks',
    ];

    protected $casts = [
        'midterm_grade' => 'float',
        'final_grade' => 'float',
        'is_passed' => 'boolean',
    ];

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
