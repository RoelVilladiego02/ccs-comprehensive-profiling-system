<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drop the unused section table - all section data is stored in the class table's 'section' field
     */
    public function up(): void
    {
        // Only drop if it exists
        if (Schema::hasTable('section')) {
            Schema::dropIfExists('section');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate if needed (though not recommended since this table was never used)
        Schema::create('section', function (Blueprint $table) {
            $table->id('section_id');
            $table->foreignId('course_id')->constrained('course', 'course_id')->onDelete('cascade');
            $table->string('section_code', 20);
            $table->integer('capacity')->nullable();
            $table->enum('schedule_type', ['Lecture', 'Lab', 'Seminar'])->default('Lecture');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('course_id', 'idx_section_course');
            $table->unique(['course_id', 'section_code'], 'unique_course_section');
        });
    }
};
