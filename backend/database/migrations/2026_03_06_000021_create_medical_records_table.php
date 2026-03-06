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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id('medical_id');
            $table->unsignedBigInteger('student_id')->unique();
            $table->string('blood_type', 10)->nullable();
            $table->string('allergies', 255)->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('medications')->nullable();
            $table->string('disability', 255)->nullable();
            $table->date('last_medical_checkup')->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_number', 20)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
