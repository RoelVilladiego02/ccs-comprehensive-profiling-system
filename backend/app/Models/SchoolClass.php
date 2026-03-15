<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'class';
    protected $primaryKey = 'class_id';
    public $timestamps = false;

    protected $fillable = [
        'course_id',
        'faculty_id',
        'section',
        'academic_year',
        'semester',
        'schedule_day',
        'schedule_time',
        'schedule_end_time',
        'room',
        'max_students',
        'enrolled_students',
        'class_status',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class, 'faculty_id', 'faculty_id');
    }

    public function studentClassStatuses(): HasMany
    {
        return $this->hasMany(StudentClassStatus::class, 'class_id', 'class_id');
    }

    public function students()
    {
        return $this->hasManyThrough(
            Student::class,
            StudentClassStatus::class,
            'class_id',
            'student_id',
            'class_id',
            'student_id'
        );
    }

    public function classRoster(): HasMany
    {
        return $this->hasMany(ClassRoster::class, 'class_id', 'class_id');
    }
}
