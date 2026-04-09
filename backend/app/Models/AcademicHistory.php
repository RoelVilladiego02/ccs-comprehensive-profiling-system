<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicHistory extends Model
{
    use HasFactory;

    protected $table = 'academic_history';
    protected $primaryKey = 'academic_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'school_name',
        'program_course',
        'academic_level',
        'honors_awards',
        'gpa',
    ];

    protected $casts = [
        'gpa' => 'float',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
