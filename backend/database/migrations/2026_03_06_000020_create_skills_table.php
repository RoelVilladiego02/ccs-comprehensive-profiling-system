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
        Schema::create('skills', function (Blueprint $table) {
            $table->id('skill_id');
            $table->unsignedBigInteger('student_id');
            $table->string('skill_name', 255);
            $table->string('skill_category', 100);
            $table->enum('proficiency_level', ['Beginner', 'Intermediate', 'Advanced', 'Expert']);
            $table->integer('years_experience')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            $table->index('student_id');
            $table->index('skill_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
