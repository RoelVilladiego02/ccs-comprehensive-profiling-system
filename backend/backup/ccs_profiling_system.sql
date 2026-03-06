-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2026 at 08:02 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ccs_profiling_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('Present','Absent','Late','Excused') NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class`
--

CREATE TABLE `class` (
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `section` varchar(20) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` int(11) NOT NULL,
  `schedule_day` varchar(50) DEFAULT NULL,
  `schedule_time` time DEFAULT NULL,
  `schedule_end_time` time DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `max_students` int(11) NOT NULL,
  `enrolled_students` int(11) DEFAULT 0,
  `class_status` enum('Open','Closed','Cancelled') DEFAULT 'Open'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `class_roster`
-- (See below for the actual view)
--
CREATE TABLE `class_roster` (
`class_id` int(11)
,`course_code` varchar(20)
,`course_title` varchar(255)
,`section` varchar(20)
,`academic_year` varchar(20)
,`semester` int(11)
,`student_id` int(11)
,`student_number` varchar(20)
,`student_name` varchar(101)
,`enrollment_status` enum('Enrolled','Dropped','Completed')
,`enrollment_date` date
);

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `course_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_title` varchar(255) NOT NULL,
  `course_description` text DEFAULT NULL,
  `units_lecture` decimal(3,1) NOT NULL,
  `units_lab` decimal(3,1) DEFAULT 0.0,
  `total_units` decimal(3,1) GENERATED ALWAYS AS (`units_lecture` + `units_lab`) STORED,
  `department` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` int(11) NOT NULL,
  `faculty_number` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `gender` enum('Male','Female','Prefer not to say') NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `employment_status` enum('Full-Time','Part-Time','Probationary','Contractual') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `faculty_class_load`
-- (See below for the actual view)
--
CREATE TABLE `faculty_class_load` (
`faculty_id` int(11)
,`faculty_name` varchar(101)
,`class_id` int(11)
,`course_code` varchar(20)
,`course_title` varchar(255)
,`section` varchar(20)
,`academic_year` varchar(20)
,`semester` int(11)
,`schedule_day` varchar(50)
,`schedule_time` time
,`room` varchar(50)
,`enrolled_students` int(11)
,`max_students` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `faculty_profile_summary`
-- (See below for the actual view)
--
CREATE TABLE `faculty_profile_summary` (
`faculty_id` int(11)
,`faculty_number` varchar(20)
,`full_name` varchar(101)
,`email` varchar(100)
,`employment_status` enum('Full-Time','Part-Time','Probationary','Contractual')
,`department` varchar(100)
,`specializations_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_specialization`
--

CREATE TABLE `faculty_specialization` (
  `specialization_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `specialization_area` varchar(100) NOT NULL,
  `proficiency_level` enum('Beginner','Intermediate','Advanced','Expert') NOT NULL,
  `years_of_experience` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `grade_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `assessment_type` varchar(50) NOT NULL,
  `assessment_name` varchar(100) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `max_score` decimal(5,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `grade_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `final_grade` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` int(11) NOT NULL,
  `student_number` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `gender` enum('Male','Female','Prefer not to say') NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `student_identification` enum('Regular','Irregular','Graduated','On Leave','Dropped') NOT NULL,
  `curriculum` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_class_status`
--

CREATE TABLE `student_class_status` (
  `status_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `enrollment_date` date NOT NULL,
  `enrollment_status` enum('Enrolled','Dropped','Completed') DEFAULT 'Enrolled',
  `completion_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `student_class_status`
--
DELIMITER $$
CREATE TRIGGER `update_class_completion_date` BEFORE UPDATE ON `student_class_status` FOR EACH ROW BEGIN
    IF NEW.enrollment_status = 'Completed' AND OLD.enrollment_status != 'Completed' THEN
        SET NEW.completion_date = CURDATE();
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_class_enrollment_delete` AFTER DELETE ON `student_class_status` FOR EACH ROW BEGIN
    IF OLD.enrollment_status = 'Enrolled' THEN
        UPDATE class 
        SET enrolled_students = enrolled_students - 1 
        WHERE class_id = OLD.class_id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_class_enrollment_insert` AFTER INSERT ON `student_class_status` FOR EACH ROW BEGIN
    IF NEW.enrollment_status = 'Enrolled' THEN
        UPDATE class 
        SET enrolled_students = enrolled_students + 1 
        WHERE class_id = NEW.class_id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_class_enrollment_update` AFTER UPDATE ON `student_class_status` FOR EACH ROW BEGIN
    -- If status changed from not Enrolled to Enrolled
    IF NEW.enrollment_status = 'Enrolled' AND OLD.enrollment_status != 'Enrolled' THEN
        UPDATE class 
        SET enrolled_students = enrolled_students + 1 
        WHERE class_id = NEW.class_id;
    END IF;
    
    -- If status changed from Enrolled to something else (Dropped/Completed)
    IF OLD.enrollment_status = 'Enrolled' AND NEW.enrollment_status != 'Enrolled' THEN
        UPDATE class 
        SET enrolled_students = enrolled_students - 1 
        WHERE class_id = NEW.class_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_profile_summary`
-- (See below for the actual view)
--
CREATE TABLE `student_profile_summary` (
`student_id` int(11)
,`student_number` varchar(20)
,`full_name` varchar(101)
,`email` varchar(100)
,`student_status` enum('Regular','Irregular','Graduated','On Leave','Dropped')
,`program_name` varchar(100)
,`year_level` int(11)
,`enrolled_classes` bigint(21)
,`current_classes` bigint(21)
,`completed_classes` bigint(21)
,`total_violations` bigint(21)
,`pending_violations` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `student_program`
--

CREATE TABLE `student_program` (
  `program_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `program_name` varchar(100) NOT NULL,
  `year_level` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_violations`
--

CREATE TABLE `student_violations` (
  `violation_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `violation_date` date NOT NULL,
  `violation_type` varchar(100) NOT NULL,
  `violation_description` text NOT NULL,
  `offense_level` enum('Minor','Moderate','Major','Grave') NOT NULL,
  `reported_by` varchar(100) DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `penalty` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Resolved','Dismissed') DEFAULT 'Pending',
  `resolution_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `supporting_document` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `student_violations`
--
DELIMITER $$
CREATE TRIGGER `update_violation_resolution` BEFORE UPDATE ON `student_violations` FOR EACH ROW BEGIN
    IF NEW.status = 'Resolved' AND OLD.status != 'Resolved' THEN
        SET NEW.resolution_date = CURDATE();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_violation_summary`
-- (See below for the actual view)
--
CREATE TABLE `student_violation_summary` (
`student_id` int(11)
,`student_number` varchar(20)
,`full_name` varchar(101)
,`violation_id` int(11)
,`violation_date` date
,`violation_type` varchar(100)
,`offense_level` enum('Minor','Moderate','Major','Grave')
,`status` enum('Pending','Resolved','Dismissed')
,`penalty` varchar(255)
,`action_taken` text
);

-- --------------------------------------------------------

--
-- Structure for view `class_roster`
--
DROP TABLE IF EXISTS `class_roster`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `class_roster`  AS SELECT `c`.`class_id` AS `class_id`, `co`.`course_code` AS `course_code`, `co`.`course_title` AS `course_title`, `c`.`section` AS `section`, `c`.`academic_year` AS `academic_year`, `c`.`semester` AS `semester`, `s`.`student_id` AS `student_id`, `s`.`student_number` AS `student_number`, concat(`s`.`first_name`,' ',`s`.`last_name`) AS `student_name`, `scs`.`enrollment_status` AS `enrollment_status`, `scs`.`enrollment_date` AS `enrollment_date` FROM (((`class` `c` join `course` `co` on(`c`.`course_id` = `co`.`course_id`)) join `student_class_status` `scs` on(`c`.`class_id` = `scs`.`class_id`)) join `student` `s` on(`scs`.`student_id` = `s`.`student_id`)) ORDER BY `c`.`class_id` ASC, `s`.`last_name` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `faculty_class_load`
--
DROP TABLE IF EXISTS `faculty_class_load`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `faculty_class_load`  AS SELECT `f`.`faculty_id` AS `faculty_id`, concat(`f`.`first_name`,' ',`f`.`last_name`) AS `faculty_name`, `c`.`class_id` AS `class_id`, `co`.`course_code` AS `course_code`, `co`.`course_title` AS `course_title`, `c`.`section` AS `section`, `c`.`academic_year` AS `academic_year`, `c`.`semester` AS `semester`, `c`.`schedule_day` AS `schedule_day`, `c`.`schedule_time` AS `schedule_time`, `c`.`room` AS `room`, `c`.`enrolled_students` AS `enrolled_students`, `c`.`max_students` AS `max_students` FROM ((`faculty` `f` join `class` `c` on(`f`.`faculty_id` = `c`.`faculty_id`)) join `course` `co` on(`c`.`course_id` = `co`.`course_id`)) ORDER BY `f`.`last_name` ASC, `c`.`academic_year` ASC, `c`.`semester` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `faculty_profile_summary`
--
DROP TABLE IF EXISTS `faculty_profile_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `faculty_profile_summary`  AS SELECT `f`.`faculty_id` AS `faculty_id`, `f`.`faculty_number` AS `faculty_number`, concat(`f`.`first_name`,' ',`f`.`last_name`) AS `full_name`, `f`.`email` AS `email`, `f`.`employment_status` AS `employment_status`, `f`.`department` AS `department`, count(distinct `fs`.`specialization_id`) AS `specializations_count` FROM (`faculty` `f` left join `faculty_specialization` `fs` on(`f`.`faculty_id` = `fs`.`faculty_id`)) GROUP BY `f`.`faculty_id` ;

-- --------------------------------------------------------

--
-- Structure for view `student_profile_summary`
--
DROP TABLE IF EXISTS `student_profile_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `student_profile_summary`  AS SELECT `s`.`student_id` AS `student_id`, `s`.`student_number` AS `student_number`, concat(`s`.`first_name`,' ',`s`.`last_name`) AS `full_name`, `s`.`email` AS `email`, `s`.`student_identification` AS `student_status`, `sp`.`program_name` AS `program_name`, `sp`.`year_level` AS `year_level`, count(distinct `scs`.`class_id`) AS `enrolled_classes`, count(distinct case when `scs`.`enrollment_status` = 'Enrolled' then `scs`.`class_id` end) AS `current_classes`, count(distinct case when `scs`.`enrollment_status` = 'Completed' then `scs`.`class_id` end) AS `completed_classes`, count(distinct `sv`.`violation_id`) AS `total_violations`, count(distinct case when `sv`.`status` = 'Pending' then `sv`.`violation_id` end) AS `pending_violations` FROM (((`student` `s` left join `student_program` `sp` on(`s`.`student_id` = `sp`.`student_id`)) left join `student_class_status` `scs` on(`s`.`student_id` = `scs`.`student_id`)) left join `student_violations` `sv` on(`s`.`student_id` = `sv`.`student_id`)) GROUP BY `s`.`student_id` ;

-- --------------------------------------------------------

--
-- Structure for view `student_violation_summary`
--
DROP TABLE IF EXISTS `student_violation_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `student_violation_summary`  AS SELECT `s`.`student_id` AS `student_id`, `s`.`student_number` AS `student_number`, concat(`s`.`first_name`,' ',`s`.`last_name`) AS `full_name`, `sv`.`violation_id` AS `violation_id`, `sv`.`violation_date` AS `violation_date`, `sv`.`violation_type` AS `violation_type`, `sv`.`offense_level` AS `offense_level`, `sv`.`status` AS `status`, `sv`.`penalty` AS `penalty`, `sv`.`action_taken` AS `action_taken` FROM (`student` `s` join `student_violations` `sv` on(`s`.`student_id` = `sv`.`student_id`)) ORDER BY `sv`.`violation_date` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `unique_attendance` (`student_id`,`class_id`,`attendance_date`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `idx_attendance_date` (`attendance_date`);

--
-- Indexes for table `class`
--
ALTER TABLE `class`
  ADD PRIMARY KEY (`class_id`),
  ADD UNIQUE KEY `unique_class_section` (`course_id`,`section`,`academic_year`,`semester`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `idx_class_schedule` (`academic_year`,`semester`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `course_code` (`course_code`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `faculty_number` (`faculty_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_faculty_department` (`department`),
  ADD KEY `idx_faculty_status` (`employment_status`);

--
-- Indexes for table `faculty_specialization`
--
ALTER TABLE `faculty_specialization`
  ADD PRIMARY KEY (`specialization_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD KEY `idx_student_class` (`student_id`,`class_id`),
  ADD KEY `idx_grades_student` (`student_id`),
  ADD KEY `idx_grades_class` (`class_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `student_class_status`
--
ALTER TABLE `student_class_status`
  ADD PRIMARY KEY (`status_id`),
  ADD UNIQUE KEY `unique_student_class` (`student_id`,`class_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `idx_student_class_status` (`student_id`,`class_id`,`enrollment_status`);

--
-- Indexes for table `student_program`
--
ALTER TABLE `student_program`
  ADD PRIMARY KEY (`program_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `idx_student_program` (`program_name`,`year_level`);

--
-- Indexes for table `student_violations`
--
ALTER TABLE `student_violations`
  ADD PRIMARY KEY (`violation_id`),
  ADD KEY `idx_violations_student` (`student_id`,`violation_date`),
  ADD KEY `idx_violations_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class`
--
ALTER TABLE `class`
  MODIFY `class_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_specialization`
--
ALTER TABLE `faculty_specialization`
  MODIFY `specialization_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_class_status`
--
ALTER TABLE `student_class_status`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_program`
--
ALTER TABLE `student_program`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_violations`
--
ALTER TABLE `student_violations`
  MODIFY `violation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE;

--
-- Constraints for table `class`
--
ALTER TABLE `class`
  ADD CONSTRAINT `class_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  ADD CONSTRAINT `class_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `faculty_specialization`
--
ALTER TABLE `faculty_specialization`
  ADD CONSTRAINT `faculty_specialization_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_class_status`
--
ALTER TABLE `student_class_status`
  ADD CONSTRAINT `student_class_status_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_class_status_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_program`
--
ALTER TABLE `student_program`
  ADD CONSTRAINT `student_program_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_violations`
--
ALTER TABLE `student_violations`
  ADD CONSTRAINT `student_violations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
