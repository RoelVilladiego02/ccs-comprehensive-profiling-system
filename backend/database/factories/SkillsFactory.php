<?php

namespace Database\Factories;

use App\Models\Skills;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Skills>
 */
class SkillsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
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

        // Randomly select a category, then randomly select a skill from that category
        $category = $this->faker->randomElement(array_keys($skillMapping));
        $skillName = $this->faker->randomElement($skillMapping[$category]);

        return [
            'student_id' => Student::factory(),
            'skill_name' => $skillName,
            'skill_category' => $category,
            'proficiency_level' => $this->faker->randomElement([
                'Beginner',
                'Intermediate',
                'Advanced',
                'Expert'
            ]),
            'years_experience' => $this->faker->numberBetween(0, 10),
            'description' => $this->faker->sentence(),
        ];
    }
}
