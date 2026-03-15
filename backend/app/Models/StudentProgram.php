<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProgram extends Model
{
    use HasFactory;

    protected $table = 'student_program';
    protected $primaryKey = 'program_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'program_name',
        'program_code',
        'enrollment_date',
        'completion_date',
        'status',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'completion_date' => 'date',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
