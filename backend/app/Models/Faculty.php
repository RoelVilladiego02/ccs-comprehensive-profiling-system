<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';
    protected $primaryKey = 'faculty_id';
    public $timestamps = true;

    protected $fillable = [
        'faculty_number',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'gender',
        'email',
        'phone_number',
        'employment_status',
        'department',
    ];

    // Relationships
    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'faculty_id', 'faculty_id');
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
