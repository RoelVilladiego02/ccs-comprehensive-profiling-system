<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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

        // Fix skill category mappings for existing data
        $this->fixSkillCategories();
    }

    /**
     * Fix skill-to-category mappings for all existing records
     */
    private function fixSkillCategories(): void
    {
        // Define proper skill-to-category mappings
        $skillMapping = [
            'Programming' => ['PHP', 'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Kotlin', 'Swift'],
            'Framework' => ['React', 'Vue.js', 'Angular', 'Laravel', 'Django', 'Spring Boot', 'Express.js', 'ASP.NET'],
            'Database' => ['SQL', 'MongoDB', 'Firebase', 'PostgreSQL', 'MySQL'],
            'DevOps' => ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'CI/CD', 'Jenkins', 'GitHub Actions'],
            'Sports' => ['Basketball', 'Volleyball', 'Football', 'Tennis', 'Badminton', 'Swimming', 'Table Tennis', 'Martial Arts', 'Gymnastics', 'Cricket', 'Baseball', 'Soccer', 'Handball', 'Track and Field', 'Archery'],
            'Soft Skills' => ['Public Speaking', 'Problem Solving', 'Teamwork', 'Critical Thinking', 'Time Management', 'Presentation Skills', 'Project Management', 'Negotiation', 'Decision Making'],
            'Leadership' => ['Leadership', 'Mentoring'],
            'Communication' => ['Communication'],
            'Technical' => ['Business Intelligence', 'Statistics', 'Data Analysis'],
            'Data & Analytics' => ['Machine Learning', 'Data Science', 'Tableau', 'Power BI', 'Big Data'],
            'Design' => ['UI/UX Design', 'Graphic Design', 'Animation'],
            'Creative' => ['Video Production', 'Photography', 'Digital Marketing', 'Content Writing', 'Copywriting'],
        ];

        // Update each skill to its correct category
        foreach ($skillMapping as $category => $skills) {
            foreach ($skills as $skillName) {
                DB::table('skills')
                    ->where('skill_name', $skillName)
                    ->update(['skill_category' => $category]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
