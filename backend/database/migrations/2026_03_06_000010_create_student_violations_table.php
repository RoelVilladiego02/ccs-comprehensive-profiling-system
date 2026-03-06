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
        Schema::create('student_violations', function (Blueprint $table) {
            $table->id('violation_id');
            $table->unsignedBigInteger('student_id');
            $table->date('violation_date');
            $table->string('violation_type', 100);
            $table->text('violation_description');
            $table->enum('offense_level', ['Minor', 'Moderate', 'Major', 'Grave']);
            $table->string('reported_by', 100)->nullable();
            $table->text('action_taken')->nullable();
            $table->string('penalty', 255)->nullable();
            $table->enum('status', ['Pending', 'Resolved', 'Dismissed'])->default('Pending');
            $table->date('resolution_date')->nullable();
            $table->text('remarks')->nullable();
            $table->string('supporting_document', 255)->nullable();
            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student')
                ->onDelete('cascade');
            $table->index(['student_id', 'violation_date'], 'idx_violations_student');
            $table->index('status', 'idx_violations_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_violations');
    }
};
