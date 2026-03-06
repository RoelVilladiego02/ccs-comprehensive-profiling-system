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
        Schema::create('faculty_specialization', function (Blueprint $table) {
            $table->id('specialization_id');
            $table->unsignedBigInteger('faculty_id');
            $table->string('specialization_area', 100);
            $table->enum('proficiency_level', ['Beginner', 'Intermediate', 'Advanced', 'Expert']);
            $table->integer('years_of_experience')->nullable();

            $table->foreign('faculty_id')
                ->references('faculty_id')
                ->on('faculty')
                ->onDelete('cascade');
            $table->index('faculty_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculty_specialization');
    }
};
