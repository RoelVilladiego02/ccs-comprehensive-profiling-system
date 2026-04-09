<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentViolations extends Model
{
    use HasFactory;

    protected $table = 'student_violations';
    protected $primaryKey = 'violation_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'violation_type',
        'violation_description',
        'violation_date',
        'offense_level',
        'reported_by',
        'action_taken',
        'penalty',
        'status',
        'resolution_date',
        'remarks',
        'supporting_document',
    ];

    protected $casts = [
        'violation_date' => 'date',
        'resolution_date' => 'date',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
