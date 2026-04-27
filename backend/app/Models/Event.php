<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    use HasFactory;

    protected $table = 'event';
    protected $primaryKey = 'event_id';
    public $timestamps = true;

    protected $fillable = [
        'event_name',
        'event_type',
        'description',
        'objectives',
        'event_date',
        'start_time',
        'end_time',
        'location',
        'capacity',
        'enrolled_count',
        'event_status',
        'requirements',
        'is_active',
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_active' => 'boolean',
        'capacity' => 'integer',
        'enrolled_count' => 'integer',
        'points_earned' => 'integer',
    ];

    // ====== RELATIONSHIPS ======

    /**
     * Get all students enrolled in this event
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            Student::class,
            'student_event',
            'event_id',
            'student_id',
            'event_id',
            'student_id'
        )
        ->withPivot('participation_status', 'points_earned', 'notes', 'created_at', 'updated_at')
        ->withTimestamps();
    }

    // ====== SCOPES ======

    /**
     * Scope: Get active events only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get events by type (Curricular or Extra-Curricular)
     */
    public function scopeByType($query, $type)
    {
        return $query->where('event_type', $type);
    }

    /**
     * Scope: Get upcoming events
     */
    public function scopeUpcoming($query)
    {
        return $query->whereDate('event_date', '>=', now())
                     ->orderBy('event_date', 'asc');
    }

    /**
     * Scope: Get past events
     */
    public function scopePast($query)
    {
        return $query->whereDate('event_date', '<', now())
                     ->orderBy('event_date', 'desc');
    }

    /**
     * Scope: Get events by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('event_status', $status);
    }

    /**
     * Scope: Get events with available capacity
     */
    public function scopeAvailableCapacity($query)
    {
        return $query->whereRaw('enrolled_count < capacity')
                     ->orWhereNull('capacity');
    }

    // ====== HELPER METHODS ======

    /**
     * Check if event has available capacity
     */
    public function hasAvailableCapacity(): bool
    {
        if (is_null($this->capacity)) {
            return true; // Unlimited capacity
        }
        return $this->enrolled_count < $this->capacity;
    }

    /**
     * Get remaining capacity
     */
    public function getRemainingCapacity(): ?int
    {
        if (is_null($this->capacity)) {
            return null; // Unlimited
        }
        return $this->capacity - $this->enrolled_count;
    }

    /**
     * Check if event is today
     */
    public function isToday(): bool
    {
        return $this->event_date->isToday();
    }

    /**
     * Check if event is upcoming
     */
    public function isUpcoming(): bool
    {
        return $this->event_date->isFuture();
    }

    /**
     * Check if event is past
     */
    public function isPast(): bool
    {
        return $this->event_date->isPast();
    }
}
