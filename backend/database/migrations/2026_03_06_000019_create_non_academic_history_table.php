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
        Schema::create('non_academic_history', function (Blueprint $table) {
            $table->id('nonacad_id');
            $table->unsignedBigInteger('student_id');
            $table->string('activity_name', 255);
            $table->string('activity_type', 100);
            $table->string('organization', 255);
            $table->string('role_position', 100);
            $table->string('achievement', 255)->nullable();
            $table->text('description')->nullable();
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
        Schema::dropIfExists('non_academic_history');
    }
};
