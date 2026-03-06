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
        Schema::create('attendance', function (Blueprint $table) {
            $table->id('attendance_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('class_id');
            $table->date('attendance_date');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Excused']);
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->text('remarks')->nullable();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            $table->foreign('class_id')
                ->references('class_id')
                ->on('class')
                ->onDelete('cascade');
            $table->unique(['student_id', 'class_id', 'attendance_date'], 'unique_attendance');
            $table->index('attendance_date', 'idx_attendance_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
