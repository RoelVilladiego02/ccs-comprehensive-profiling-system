<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecords extends Model
{
    use HasFactory;

    protected $table = 'medical_records';
    protected $primaryKey = 'medical_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'blood_type',
        'allergies',
        'medical_conditions',
        'medications',
        'disability',
        'last_medical_checkup',
        'emergency_contact_name',
        'emergency_contact_number',
        'notes',
    ];

    protected $casts = [
        'last_medical_checkup' => 'date',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
