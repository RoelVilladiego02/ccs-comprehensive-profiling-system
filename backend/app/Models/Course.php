<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $table = 'course';
    protected $primaryKey = 'course_id';
    public $timestamps = true;

    protected $fillable = [
        'course_code',
        'course_title',
        'course_description',
        'units_lecture',
        'units_lab',
        'department',
        'is_active',
    ];

    protected $casts = [
        'units_lecture' => 'float',
        'units_lab' => 'float',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'course_id', 'course_id');
    }

    public function syllabus(): HasMany
    {
        return $this->hasMany(Syllabus::class, 'course_id', 'course_id');
    }

    public function curriculum(): HasMany
    {
        return $this->hasMany(Curriculum::class, 'course_id', 'course_id');
    }
}
