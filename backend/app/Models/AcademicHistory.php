<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicHistory extends Model
{
    use HasFactory;

    protected $table = 'academic_history';
    protected $primaryKey = 'history_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'previous_school',
        'degree_obtained',
        'graduation_date',
        'honors',
        'gpa',
    ];

    protected $casts = [
        'graduation_date' => 'date',
        'gpa' => 'float',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
