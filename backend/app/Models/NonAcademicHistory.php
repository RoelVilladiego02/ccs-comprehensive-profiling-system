<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NonAcademicHistory extends Model
{
    use HasFactory;

    protected $table = 'non_academic_history';
    protected $primaryKey = 'nonacad_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'activity_name',
        'activity_type',
        'organization',
        'role_position',
        'achievement',
        'description',
    ];

    protected $casts = [];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
