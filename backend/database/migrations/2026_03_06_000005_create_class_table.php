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
        Schema::create('class', function (Blueprint $table) {
            $table->id('class_id');
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('faculty_id');
            $table->string('section', 20);
            $table->string('academic_year', 20);
            $table->integer('semester');
            $table->string('schedule_day', 50)->nullable();
            $table->time('schedule_time')->nullable();
            $table->time('schedule_end_time')->nullable();
            $table->string('room', 50)->nullable();
            $table->integer('max_students');
            $table->integer('enrolled_students')->default(0);
            $table->enum('class_status', ['Open', 'Closed', 'Cancelled'])->default('Open');

            $table->foreign('course_id')
                ->references('course_id')
                ->on('course');
            $table->foreign('faculty_id')
                ->references('faculty_id')
                ->on('faculty');
            $table->unique(['course_id', 'section', 'academic_year', 'semester'], 'unique_class_section');
            $table->index(['academic_year', 'semester'], 'idx_class_schedule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class');
    }
};
