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
        Schema::create('student_event', function (Blueprint $table) {
            $table->id('enrollment_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('event_id');
            $table->enum('participation_status', ['Registered', 'Attended', 'Absent', 'Cancelled'])->default('Registered');
            $table->integer('points_earned')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            
            $table->foreign('event_id')
                ->references('event_id')
                ->on('event')
                ->onDelete('cascade');

            // Indexes
            $table->unique(['student_id', 'event_id'], 'unique_student_event');
            $table->index('student_id', 'idx_student_event_student');
            $table->index('event_id', 'idx_student_event_event');
            $table->index('participation_status', 'idx_participation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_event');
    }
};
