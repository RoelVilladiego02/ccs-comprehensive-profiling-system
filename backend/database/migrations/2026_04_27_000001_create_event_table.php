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
        Schema::create('event', function (Blueprint $table) {
            $table->id('event_id');
            $table->string('event_name', 255)->unique();
            $table->enum('event_type', ['Curricular', 'Extra-Curricular']);
            $table->text('description')->nullable();
            $table->text('objectives')->nullable();
            $table->date('event_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location', 255)->nullable();
            $table->integer('capacity')->nullable();
            $table->integer('enrolled_count')->default(0);
            $table->enum('event_status', ['Pending', 'Active', 'Ongoing', 'Completed', 'Cancelled'])->default('Pending');
            $table->text('requirements')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('event_type', 'idx_event_type');
            $table->index('event_date', 'idx_event_date');
            $table->index('event_status', 'idx_event_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event');
    }
};
