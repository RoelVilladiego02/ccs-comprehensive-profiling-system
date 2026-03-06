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
        Schema::create('student_class_status', function (Blueprint $table) {
            $table->id('status_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('class_id');
            $table->date('enrollment_date');
            $table->enum('enrollment_status', ['Enrolled', 'Dropped', 'Completed'])->default('Enrolled');
            $table->date('completion_date')->nullable();
            $table->text('remarks')->nullable();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            $table->foreign('class_id')
                ->references('class_id')
                ->on('class')
                ->onDelete('cascade');
            $table->unique(['student_id', 'class_id'], 'unique_student_class');
            $table->index(['student_id', 'class_id', 'enrollment_status'], 'idx_student_class_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_class_status');
    }
};
