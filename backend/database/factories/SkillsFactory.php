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
        return [
            'student_id' => Student::factory(),
            'skill_name' => $this->faker->randomElement([
                // Programming Languages
                'PHP',
                'JavaScript',
                'Python',
                'Java',
                'C++',
                'C#',
                'Ruby',
                'Go',
                'Kotlin',
                'Swift',
                
                // Web Frameworks
                'React',
                'Vue.js',
                'Angular',
                'Laravel',
                'Django',
                'Spring Boot',
                'Express.js',
                'ASP.NET',
                
                // Database & DevOps
                'SQL',
                'MongoDB',
                'Firebase',
                'PostgreSQL',
                'MySQL',
                'Git',
                'Docker',
                'Kubernetes',
                'AWS',
                'Azure',
                'Google Cloud',
                'CI/CD',
                'Jenkins',
                'GitHub Actions',
                
                // Sports & Physical Activities
                'Basketball',
                'Volleyball',
                'Football',
                'Tennis',
                'Badminton',
                'Swimming',
                'Table Tennis',
                'Martial Arts',
                'Gymnastics',
                'Cricket',
                'Baseball',
                'Soccer',
                'Handball',
                'Track and Field',
                'Archery',
                
                // Soft Skills
                'Public Speaking',
                'Leadership',
                'Problem Solving',
                'Communication',
                'Teamwork',
                'Critical Thinking',
                'Time Management',
                'Presentation Skills',
                'Project Management',
                'Mentoring',
                'Negotiation',
                'Decision Making',
                
                // Creative & Design
                'UI/UX Design',
                'Graphic Design',
                'Video Production',
                'Photography',
                'Digital Marketing',
                'Content Writing',
                'Copywriting',
                'Animation',
                
                // Data & Analytics
                'Data Analysis',
                'Machine Learning',
                'Data Science',
                'Statistics',
                'Business Intelligence',
                'Tableau',
                'Power BI',
                'Big Data',
            ]),
            'skill_category' => $this->faker->randomElement([
                'Technical',
                'Programming',
                'Framework',
                'Database',
                'DevOps',
                'Soft Skills',
                'Leadership',
                'Communication',
                'Sports',
                'Design',
                'Data & Analytics',
                'Creative'
            ]),
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
