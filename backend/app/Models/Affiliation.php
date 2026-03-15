<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Affiliation extends Model
{
    use HasFactory;

    protected $table = 'affiliation';
    protected $primaryKey = 'affiliation_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'organization_name',
        'affiliation_type',
        'start_date',
        'end_date',
        'role',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
