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
        Schema::create('affiliation', function (Blueprint $table) {
            $table->id('affiliation_id');
            $table->unsignedBigInteger('student_id');
            $table->string('organization_name', 255);
            $table->string('organization_type', 100);
            $table->string('position_role', 100);
            $table->string('achievements', 255)->nullable();
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
        Schema::dropIfExists('affiliation');
    }
};
