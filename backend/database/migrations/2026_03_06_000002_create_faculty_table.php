<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faculty', function (Blueprint $table) {
            $table->id('faculty_id');
            $table->string('faculty_number', 20)->unique();
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50);
            $table->string('suffix', 10)->nullable();
            $table->enum('gender', ['Male', 'Female', 'Prefer not to say']);
            $table->string('email', 100)->unique();
            $table->string('phone_number', 20)->nullable();
            $table->enum('employment_status', ['Full-Time', 'Part-Time', 'Probationary', 'Contractual']);
            $table->string('department', 100)->nullable();
            $table->timestamps();

            $table->index('department', 'idx_faculty_department');
            $table->index('employment_status', 'idx_faculty_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculty');
    }
};
