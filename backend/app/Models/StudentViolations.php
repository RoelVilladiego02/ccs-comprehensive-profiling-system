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
    public $timestamps = false;

    protected $fillable = [
        'student_id',
        'violation_type',
        'description',
        'violation_date',
        'status',
        'resolution_date',
        'penalty',
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
