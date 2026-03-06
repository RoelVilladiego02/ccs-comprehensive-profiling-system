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
        Schema::create('student_program', function (Blueprint $table) {
            $table->id('program_id');
            $table->unsignedBigInteger('student_id');
            $table->string('program_name', 100);
            $table->integer('year_level');
            $table->integer('semester');
            $table->string('academic_year', 20);

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            $table->index('student_id');
            $table->index(['program_name', 'year_level'], 'idx_student_program');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_program');
    }
};
