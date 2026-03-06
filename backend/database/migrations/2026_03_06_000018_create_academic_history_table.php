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
        Schema::create('academic_history', function (Blueprint $table) {
            $table->id('academic_id');
            $table->unsignedBigInteger('student_id');
            $table->string('school_name', 255);
            $table->string('program_course', 255);
            $table->string('academic_level', 100);
            $table->string('honors_awards', 255)->nullable();
            $table->decimal('gpa', 3, 2)->nullable();
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
        Schema::dropIfExists('academic_history');
    }
};
