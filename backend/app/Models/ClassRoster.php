<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassRoster extends Model
{
    use HasFactory;

    protected $table = 'class_roster';
    protected $primaryKey = 'roster_id';
    public $timestamps = false;

    protected $fillable = [
        'class_id',
        'student_id',
        'enrollment_status',
        'attendance_rate',
    ];

    // Relationships
    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id', 'class_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
