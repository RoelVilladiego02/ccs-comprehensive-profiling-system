<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminCredentials extends Command
{
    protected $signature = 'admin:reset';
    protected $description = 'Reset admin credentials to default';

    public function handle()
    {
        $adminRole = Role::where('role_name', 'Admin')->first();

        if (!$adminRole) {
            $this->error('Admin role not found. Please run migrations first.');
            return 1;
        }

        // Find or create admin user
        $admin = User::where('email', 'admin@ccs.edu')->first();

        if (!$admin) {
            $admin = User::create([
                'name' => 'Administrator',
                'email' => 'admin@ccs.edu',
                'password' => Hash::make('admin123456'),
                'is_active' => true,
            ]);
            $this->info('✓ Admin user created');
        } else {
            $admin->update([
                'password' => Hash::make('admin123456'),
                'is_active' => true,
            ]);
            $this->info('✓ Admin password reset');
        }

        // Assign role if not already assigned
        if (!$admin->hasRole('Admin')) {
            $admin->assignRole($adminRole);
            $this->info('✓ Admin role assigned');
        }

        $this->info('✓ Admin credentials reset successfully');
        $this->info('  Email: admin@ccs.edu');
        $this->info('  Password: admin123456');

        return 0;
    }
}
