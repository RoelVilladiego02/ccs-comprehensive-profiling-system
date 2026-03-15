<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $table = 'roles';
    protected $primaryKey = 'role_id';
    public $timestamps = true;

    protected $fillable = [
        'role_name',
        'role_description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'role_user',
            'role_id',
            'id'
        )->withTimestamps();
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            Permission::class,
            'role_permission',
            'role_id',
            'permission_id'
        )->withTimestamps();
    }

    /**
     * Check if role has permission
     */
    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions()->where('permission_name', $permissionName)->exists();
    }

    /**
     * Assign permission to role
     */
    public function grantPermission(Permission $permission): void
    {
        $this->permissions()->attach($permission->permission_id);
    }

    /**
     * Remove permission from role
     */
    public function revokePermission(Permission $permission): void
    {
        $this->permissions()->detach($permission->permission_id);
    }
}
