<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample event data
        $events = [
            // Curricular Events
            [
                'event_name' => 'Annual Science and Technology Conference 2026',
                'event_type' => 'Curricular',
                'description' => 'A comprehensive conference showcasing the latest advancements in science and technology.',
                'objectives' => 'Promote scientific knowledge, foster innovation, and encourage student participation in academic discussions.',
                'event_date' => Carbon::now()->addDays(30)->toDateString(),
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'location' => 'Main Auditorium, Science Building',
                'capacity' => 500,
                'event_status' => 'Pending',
                'requirements' => 'Valid student ID, comfortable clothing for outdoor sessions',
                'is_active' => true,
            ],
            [
                'event_name' => 'Mathematics Olympiad Preliminary Round',
                'event_type' => 'Curricular',
                'description' => 'The preliminary round of the annual Mathematics Olympiad for high school and college students.',
                'objectives' => 'Identify and nurture mathematical talent, promote problem-solving skills.',
                'event_date' => Carbon::now()->addDays(15)->toDateString(),
                'start_time' => '10:00:00',
                'end_time' => '12:30:00',
                'location' => 'Physics Laboratory Building, Room 101-105',
                'capacity' => 100,
                'event_status' => 'Active',
                'requirements' => 'Basic calculator (non-programmable), pencils and erasers',
                'is_active' => true,
            ],
            [
                'event_name' => 'Programming Challenge and Hackathon',
                'event_type' => 'Curricular',
                'description' => 'A 24-hour programming challenge where students compete to solve real-world problems using code.',
                'objectives' => 'Develop coding skills, encourage teamwork, and promote innovation in software development.',
                'event_date' => Carbon::now()->addDays(45)->toDateString(),
                'start_time' => '08:00:00',
                'end_time' => '08:00:00', // Next day
                'location' => 'Computer Science Building, Labs 1 and 2',
                'capacity' => 200,
                'event_status' => 'Pending',
                'requirements' => 'Laptop with programming environment, internet connection',
                'is_active' => true,
            ],
            [
                'event_name' => 'Foreign Language and Cultural Exchange Fair',
                'event_type' => 'Curricular',
                'description' => 'An exhibition showcasing various cultures through language demonstrations, traditional foods, and cultural artifacts.',
                'objectives' => 'Promote cultural awareness, encourage language learning, and foster international understanding.',
                'event_date' => Carbon::now()->addDays(20)->toDateString(),
                'start_time' => '13:00:00',
                'end_time' => '17:00:00',
                'location' => 'University Grounds and Student Center',
                'capacity' => 800,
                'event_status' => 'Pending',
                'requirements' => 'Comfortable walking shoes',
                'is_active' => true,
            ],
            [
                'event_name' => 'Research Presentation Symposium',
                'event_type' => 'Curricular',
                'description' => 'Student researchers present their independent and collaborative research projects to faculty and peers.',
                'objectives' => 'Share research findings, receive feedback, and promote scholarly communication among students.',
                'event_date' => Carbon::now()->addDays(60)->toDateString(),
                'start_time' => '10:00:00',
                'end_time' => '16:00:00',
                'location' => 'Convention Center',
                'capacity' => 300,
                'event_status' => 'Pending',
                'requirements' => 'Research paper or presentation materials (optional for attendees)',
                'is_active' => true,
            ],
            // Extra-Curricular Events
            [
                'event_name' => 'Inter-School Sports Festival 2026',
                'event_type' => 'Extra-Curricular',
                'description' => 'Annual sports event featuring basketball, volleyball, badminton, track and field competitions.',
                'objectives' => 'Promote physical fitness, sportsmanship, and school spirit among students.',
                'event_date' => Carbon::now()->addDays(50)->toDateString(),
                'start_time' => '07:00:00',
                'end_time' => '18:00:00',
                'location' => 'University Sports Complex',
                'capacity' => 1000,
                'event_status' => 'Pending',
                'requirements' => 'Athletic wear, water bottle, sports ID',
                'is_active' => true,
            ],
            [
                'event_name' => 'Annual Student Art Exhibition',
                'event_type' => 'Extra-Curricular',
                'description' => 'Showcase of student artwork including paintings, sculptures, digital art, and photography.',
                'objectives' => 'Celebrate student creativity, provide exposure for aspiring artists, and foster appreciation for visual arts.',
                'event_date' => Carbon::now()->addDays(25)->toDateString(),
                'start_time' => '16:00:00',
                'end_time' => '20:00:00',
                'location' => 'Art Gallery and Exhibition Hall',
                'capacity' => 400,
                'event_status' => 'Active',
                'requirements' => 'None - open to all students and faculty',
                'is_active' => true,
            ],
            [
                'event_name' => 'Student Organization Fair',
                'event_type' => 'Extra-Curricular',
                'description' => 'Meet and join various student clubs and organizations on campus.',
                'objectives' => 'Connect students with clubs matching their interests and promote student engagement.',
                'event_date' => Carbon::now()->addDays(10)->toDateString(),
                'start_time' => '11:00:00',
                'end_time' => '15:00:00',
                'location' => 'Student Center Plaza',
                'capacity' => 600,
                'event_status' => 'Active',
                'requirements' => 'Comfortable shoes for walking',
                'is_active' => true,
            ],
            [
                'event_name' => 'Leadership Development Workshop Series',
                'event_type' => 'Extra-Curricular',
                'description' => 'A series of workshops focused on developing leadership skills, teamwork, and decision-making abilities.',
                'objectives' => 'Build leadership competencies among students for future career success.',
                'event_date' => Carbon::now()->addDays(35)->toDateString(),
                'start_time' => '09:00:00',
                'end_time' => '12:00:00',
                'location' => 'Auditorium, Training Room A',
                'capacity' => 150,
                'event_status' => 'Pending',
                'requirements' => 'Notebook and pen for note-taking',
                'is_active' => true,
            ],
            [
                'event_name' => 'Music and Performing Arts Festival',
                'event_type' => 'Extra-Curricular',
                'description' => 'Concert featuring student bands, orchestras, dance performances, and theatrical productions.',
                'objectives' => 'Showcase student talents in music and performing arts, promote artistic expression.',
                'event_date' => Carbon::now()->addDays(40)->toDateString(),
                'start_time' => '18:00:00',
                'end_time' => '22:00:00',
                'location' => 'Main Campus Theater',
                'capacity' => 800,
                'event_status' => 'Pending',
                'requirements' => 'General admission tickets (nominal fee)',
                'is_active' => true,
            ],
            [
                'event_name' => 'Environmental Sustainability Awareness Seminar',
                'event_type' => 'Extra-Curricular',
                'description' => 'Educational seminar on environmental conservation, climate change, and sustainable practices.',
                'objectives' => 'Raise awareness on environmental issues and promote sustainable living among students.',
                'event_date' => Carbon::now()->addDays(22)->toDateString(),
                'start_time' => '14:00:00',
                'end_time' => '17:00:00',
                'location' => 'Environmental Science Building, Auditorium',
                'capacity' => 250,
                'event_status' => 'Pending',
                'requirements' => 'Reusable water bottle and eco-friendly bags encouraged',
                'is_active' => true,
            ],
        ];

        // Create events and randomly enroll some students
        foreach ($events as $eventData) {
            $event = Event::create($eventData);

            // Randomly enroll 10-50 students in each event
            $students = Student::inRandomOrder()->limit(rand(10, 50))->get();

            foreach ($students as $student) {
                $event->students()->attach($student->student_id, [
                    'participation_status' => $this->randomParticipationStatus(),
                    'points_earned' => rand(0, 100),
                    'notes' => $this->randomNotes(),
                ]);
            }

            // Update enrolled_count
            $event->update(['enrolled_count' => $event->students()->count()]);
        }
    }

    /**
     * Get random participation status
     */
    private function randomParticipationStatus(): string
    {
        $statuses = ['Registered', 'Attended', 'Absent', 'Cancelled'];
        return $statuses[array_rand($statuses)];
    }

    /**
     * Get random notes
     */
    private function randomNotes(): ?string
    {
        $notes = [
            'Excellent performance',
            'Good participation',
            'Needs improvement',
            'Great effort',
            'Outstanding contribution',
            null,
            'Active participant',
            'Arrived late',
            'Left early',
        ];
        return $notes[array_rand($notes)];
    }
}
