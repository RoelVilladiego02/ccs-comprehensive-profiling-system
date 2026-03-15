<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use HasFactory;

    protected $table = 'student';
    protected $primaryKey = 'student_id';
    public $timestamps = true;

    protected $fillable = [
        'student_number',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'gender',
        'email',
        'phone_number',
        'student_identification',
        'curriculum',
    ];

    // Relationships
    public function classStatuses(): HasMany
    {
        return $this->hasMany(StudentClassStatus::class, 'student_id', 'student_id');
    }

    public function programs(): HasMany
    {
        return $this->hasMany(StudentProgram::class, 'student_id', 'student_id');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(Attendance::class, 'student_id', 'student_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grades::class, 'student_id', 'student_id');
    }

    public function violations(): HasMany
    {
        return $this->hasMany(StudentViolations::class, 'student_id', 'student_id');
    }

    public function medicalRecords(): HasOne
    {
        return $this->hasOne(MedicalRecords::class, 'student_id', 'student_id');
    }

    public function affiliations(): HasMany
    {
        return $this->hasMany(Affiliation::class, 'student_id', 'student_id');
    }

    public function academicHistory(): HasMany
    {
        return $this->hasMany(AcademicHistory::class, 'student_id', 'student_id');
    }

    public function nonAcademicHistory(): HasMany
    {
        return $this->hasMany(NonAcademicHistory::class, 'student_id', 'student_id');
    }

    public function skills(): HasMany
    {
        return $this->hasMany(Skills::class, 'student_id', 'student_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
            $this->suffix,
        ])));
    }
}
