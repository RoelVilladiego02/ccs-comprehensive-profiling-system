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
        Schema::create('grades', function (Blueprint $table) {
            $table->id('grade_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('class_id');
            $table->string('assessment_type', 50);
            $table->string('assessment_name', 100);
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->date('grade_date')->nullable();
            $table->text('remarks')->nullable();
            $table->string('final_grade', 5)->nullable();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            $table->foreign('class_id')
                ->references('class_id')
                ->on('class')
                ->onDelete('cascade');
            $table->index(['student_id', 'class_id'], 'idx_student_class');
            $table->index('student_id', 'idx_grades_student');
            $table->index('class_id', 'idx_grades_class');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
