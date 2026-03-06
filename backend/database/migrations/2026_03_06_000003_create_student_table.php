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
        Schema::create('student', function (Blueprint $table) {
            $table->id('student_id');
            $table->string('student_number', 20)->unique();
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50);
            $table->string('suffix', 10)->nullable();
            $table->enum('gender', ['Male', 'Female', 'Prefer not to say']);
            $table->string('email', 100)->unique();
            $table->string('phone_number', 20)->nullable();
            $table->enum('student_identification', ['Regular', 'Irregular', 'Graduated', 'On Leave', 'Dropped']);
            $table->string('curriculum', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student');
    }
};
