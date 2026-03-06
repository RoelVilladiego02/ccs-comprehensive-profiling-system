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
        Schema::create('course', function (Blueprint $table) {
            $table->id('course_id');
            $table->string('course_code', 20)->unique();
            $table->string('course_title', 255);
            $table->text('course_description')->nullable();
            $table->decimal('units_lecture', 3, 1);
            $table->decimal('units_lab', 3, 1)->default(0.0);
            $table->decimal('total_units', 3, 1)->storedAs('units_lecture + units_lab');
            $table->string('department', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course');
    }
};
