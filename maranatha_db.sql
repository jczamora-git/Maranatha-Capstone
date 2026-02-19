-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 19, 2026 at 12:36 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `maranatha_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_periods`
--

CREATE TABLE `academic_periods` (
  `id` int UNSIGNED NOT NULL,
  `school_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., 2024-2025, 2025-2026',
  `quarter` enum('1st Quarter','2nd Quarter','3rd Quarter','4th Quarter') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1st Quarter',
  `start_date` date NOT NULL COMMENT 'Period start date',
  `end_date` date NOT NULL COMMENT 'Period end date',
  `status` enum('active','past','upcoming') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'upcoming' COMMENT 'Current status of the period',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional description or notes',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Global academic period tracking (school year + semester)';

--
-- Dumping data for table `academic_periods`
--

INSERT INTO `academic_periods` (`id`, `school_year`, `quarter`, `start_date`, `end_date`, `status`, `description`, `created_at`, `updated_at`) VALUES
(26, '2025-2026', '1st Quarter', '2025-08-01', '2025-10-15', 'past', NULL, '2026-01-26 13:16:23', '2026-02-15 09:19:32'),
(27, '2025-2026', '2nd Quarter', '2025-10-16', '2025-12-20', 'past', NULL, '2026-01-26 13:16:23', '2026-02-15 09:19:32'),
(28, '2025-2026', '3rd Quarter', '2026-01-05', '2026-03-20', 'past', NULL, '2026-01-26 13:16:23', '2026-02-15 09:19:32'),
(29, '2025-2026', '4th Quarter', '2026-03-21', '2026-05-30', 'past', NULL, '2026-01-26 13:16:23', '2026-02-15 09:19:32'),
(30, '2026-2027', '1st Quarter', '2026-08-01', '2026-10-15', 'active', '', '2026-01-26 13:16:23', '2026-02-15 09:19:32'),
(31, '2026-2027', '2nd Quarter', '2026-10-16', '2026-12-20', 'upcoming', NULL, '2026-01-26 13:16:23', '2026-02-11 12:07:42'),
(32, '2026-2027', '3rd Quarter', '2027-01-05', '2027-03-20', 'upcoming', NULL, '2026-01-26 13:16:23', '2026-02-11 12:07:42'),
(33, '2026-2027', '4th Quarter', '2027-03-21', '2027-05-30', 'upcoming', NULL, '2026-01-26 13:16:23', '2026-02-11 12:07:42'),
(34, '2027-2028', '1st Quarter', '2027-08-08', '2027-10-08', 'upcoming', 'August to October', '2026-02-08 08:39:20', '2026-02-11 12:07:42');

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` bigint UNSIGNED NOT NULL,
  `subject_id` int UNSIGNED NOT NULL,
  `academic_period_id` int UNSIGNED NOT NULL,
  `section_id` int UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('worksheet','quiz','exam','project','art','storytime','recitation','participation','other') NOT NULL DEFAULT 'worksheet',
  `description` text COMMENT 'Activity instructions/description',
  `max_score` int NOT NULL DEFAULT '100',
  `due_at` datetime DEFAULT NULL,
  `allow_late_submission` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `subject_id`, `academic_period_id`, `section_id`, `title`, `type`, `description`, `max_score`, `due_at`, `allow_late_submission`, `created_at`) VALUES
(4, 47, 28, 10, 'Basic English', 'quiz', NULL, 5, '2026-02-04 00:00:00', 1, '2026-01-31 11:38:02'),
(5, 47, 28, 10, 'Draw an apple', 'art', NULL, 20, '2026-02-18 00:00:00', 1, '2026-01-31 23:20:50'),
(6, 47, 28, 10, 'Long Quiz', 'quiz', NULL, 25, '2026-02-05 00:00:00', 1, '2026-01-31 23:59:31');

-- --------------------------------------------------------

--
-- Table structure for table `activity_grades`
--

CREATE TABLE `activity_grades` (
  `id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `status` enum('Pending','Passed','Failed') NOT NULL DEFAULT 'Pending',
  `feedback` text COMMENT 'Teacher feedback',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `activity_grades`
--

INSERT INTO `activity_grades` (`id`, `activity_id`, `student_id`, `grade`, `status`, `feedback`, `created_at`, `updated_at`) VALUES
(1, 6, 93, 9.00, 'Pending', NULL, '2026-02-01 02:47:24', '2026-02-01 06:01:44');

-- --------------------------------------------------------

--
-- Table structure for table `activity_questions`
--

CREATE TABLE `activity_questions` (
  `id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL COMMENT 'References activities.id',
  `question_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The actual question',
  `question_type` enum('multiple_choice','true_false','short_answer','essay','matching','fill_blank','multiple_select') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'multiple_choice' COMMENT 'Type of question',
  `points` int NOT NULL DEFAULT '1' COMMENT 'Points awarded for correct answer',
  `order_number` int NOT NULL DEFAULT '1' COMMENT 'Display order in quiz',
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional question image path',
  `correct_answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Correct answer for true/false, short_answer, fill_blank',
  `sample_answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Sample answer for grading reference (short_answer, essay)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Questions for quizzes and exams';

--
-- Dumping data for table `activity_questions`
--

INSERT INTO `activity_questions` (`id`, `activity_id`, `question_text`, `question_type`, `points`, `order_number`, `image_url`, `correct_answer`, `sample_answer`, `created_at`) VALUES
(18, 4, '<h3>What letter comes after B in the alphabet?</h3><p><br></p>', 'multiple_choice', 1, 4, NULL, NULL, NULL, '2026-01-31 11:38:30'),
(19, 4, '<h3>Which word rhymes with \"cat\"?</h3>', 'multiple_choice', 1, 2, NULL, NULL, NULL, '2026-01-31 11:39:03'),
(20, 4, '<h3>What is the beginning sound of \"apple\"?</h3><p><br></p>', 'multiple_choice', 1, 3, NULL, NULL, NULL, '2026-01-31 11:40:14'),
(21, 4, '<h3>Which word is spelled correctly?</h3><p><br></p>', 'multiple_choice', 1, 1, NULL, NULL, NULL, '2026-01-31 11:40:43'),
(22, 4, '<h3>Choose the correct word to complete the sentence:</h3><p>\"I see a ___ in the sky.\"</p>', 'multiple_choice', 1, 5, NULL, NULL, NULL, '2026-01-31 11:41:25'),
(23, 6, '<p>What letter comes AFTER \"B\"?</p>', 'multiple_choice', 1, 1, NULL, NULL, NULL, '2026-01-31 23:59:50'),
(24, 6, '<p>How many legs does a dog have?<span class=\"ql-cursor\">﻿</span></p>', 'multiple_choice', 1, 2, NULL, NULL, NULL, '2026-02-01 00:00:06'),
(25, 6, '<p>What color is the sun?</p>', 'multiple_choice', 1, 3, NULL, NULL, NULL, '2026-02-01 00:00:28'),
(26, 6, '<p>What do you drink when you are thirsty?</p>', 'multiple_choice', 1, 4, NULL, NULL, NULL, '2026-02-01 00:00:50'),
(27, 6, '<p>What animal says \"meow\"?</p>', 'multiple_choice', 1, 5, NULL, NULL, NULL, '2026-02-01 00:01:18'),
(28, 6, '<p>A bird can fly. ______</p>', 'true_false', 1, 6, NULL, 'True', NULL, '2026-02-01 00:01:43'),
(29, 6, '<p>A fish lives on land. ______</p><p><br></p>', 'true_false', 1, 7, NULL, 'False', NULL, '2026-02-01 00:02:05'),
(30, 6, '<p>The sky is green. ______</p>', 'true_false', 1, 8, NULL, 'False', NULL, '2026-02-01 00:02:22'),
(31, 6, '<p>We use a pencil to write. ______</p><p><br></p>', 'true_false', 1, 9, NULL, 'True', NULL, '2026-02-01 00:02:37'),
(32, 6, '<p>A banana is a vegetable. ______</p><p><br></p>', 'true_false', 1, 10, NULL, 'False', NULL, '2026-02-01 00:02:50'),
(33, 6, '<p>I am red and round. I am a fruit. What am I? ________________</p>', 'short_answer', 1, 11, NULL, NULL, 'Apple', '2026-02-01 00:03:22'),
(34, 6, '<p>I have a trunk and big ears. What animal am I? ________________</p>', 'short_answer', 1, 12, NULL, NULL, 'Elephant', '2026-02-01 00:03:35'),
(35, 6, '<p>I am used to tell time. What am I? ________________</p>', 'short_answer', 1, 13, NULL, NULL, 'Clock', '2026-02-01 00:03:44'),
(36, 6, '<p>I am a yellow fruit. Monkeys love me. What am I? ________________</p>', 'short_answer', 1, 14, NULL, NULL, 'Banana', '2026-02-01 00:03:52'),
(37, 6, '<p>I am a small insect with six legs. I say \"buzz\". What am I? ________________</p>', 'short_answer', 1, 15, NULL, NULL, 'Bee', '2026-02-01 00:04:03'),
(38, 6, '<p>Draw a line to match the animal to its sound.</p>', 'matching', 5, 16, NULL, NULL, NULL, '2026-02-01 00:05:31'),
(39, 6, '<p>What is your favorite animal? Why?</p>', 'essay', 5, 17, NULL, NULL, '<ul><li><em>\"My favorite animal is a dog because it is my friend.\"</em></li><li><em>\"I like cats because they are soft and cute.\"</em></li></ul><p><br></p>', '2026-02-01 00:05:49');

-- --------------------------------------------------------

--
-- Table structure for table `activity_question_choices`
--

CREATE TABLE `activity_question_choices` (
  `id` bigint UNSIGNED NOT NULL,
  `question_id` bigint UNSIGNED NOT NULL COMMENT 'References activity_questions.id',
  `choice_text` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The choice option text',
  `is_correct` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 if this is the correct answer',
  `order_number` int NOT NULL DEFAULT '1' COMMENT 'Display order of choice',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Multiple choice options for quiz questions';

--
-- Dumping data for table `activity_question_choices`
--

INSERT INTO `activity_question_choices` (`id`, `question_id`, `choice_text`, `is_correct`, `order_number`, `created_at`) VALUES
(17, 18, 'A', 0, 1, '2026-01-31 11:38:30'),
(18, 18, 'C', 1, 2, '2026-01-31 11:38:30'),
(19, 18, 'D', 0, 3, '2026-01-31 11:38:30'),
(20, 18, 'E', 0, 4, '2026-01-31 11:38:30'),
(21, 19, 'dog', 0, 1, '2026-01-31 11:39:03'),
(22, 19, 'hat', 1, 2, '2026-01-31 11:39:03'),
(23, 19, 'fish', 0, 3, '2026-01-31 11:39:03'),
(24, 19, 'tree', 0, 4, '2026-01-31 11:39:03'),
(25, 20, 'B', 0, 1, '2026-01-31 11:40:14'),
(26, 20, 'C', 0, 2, '2026-01-31 11:40:14'),
(27, 20, 'A', 1, 3, '2026-01-31 11:40:14'),
(28, 20, 'D', 0, 4, '2026-01-31 11:40:14'),
(29, 21, 'houze', 0, 1, '2026-01-31 11:40:43'),
(30, 21, 'hous', 0, 2, '2026-01-31 11:40:43'),
(31, 21, 'house', 1, 3, '2026-01-31 11:40:43'),
(32, 21, 'houze', 0, 4, '2026-01-31 11:40:43'),
(33, 22, 'car', 0, 1, '2026-01-31 11:41:25'),
(34, 22, 'boat', 0, 2, '2026-01-31 11:41:25'),
(35, 22, 'bird', 1, 3, '2026-01-31 11:41:25'),
(36, 22, 'book', 0, 4, '2026-01-31 11:41:25'),
(37, 23, 'A', 0, 1, '2026-01-31 23:59:50'),
(38, 23, 'C', 1, 2, '2026-01-31 23:59:50'),
(39, 23, 'D', 0, 3, '2026-01-31 23:59:50'),
(40, 24, '2', 0, 1, '2026-02-01 00:00:06'),
(41, 24, '4', 1, 2, '2026-02-01 00:00:06'),
(42, 24, '6', 0, 3, '2026-02-01 00:00:06'),
(43, 25, 'Blue', 0, 1, '2026-02-01 00:00:28'),
(44, 25, 'Yellow', 1, 2, '2026-02-01 00:00:28'),
(45, 25, 'Green', 0, 3, '2026-02-01 00:00:28'),
(46, 26, 'Food', 0, 1, '2026-02-01 00:00:50'),
(47, 26, 'Water', 1, 2, '2026-02-01 00:00:50'),
(48, 26, 'Book', 0, 3, '2026-02-01 00:00:50'),
(49, 27, 'Dog', 0, 1, '2026-02-01 00:01:18'),
(50, 27, 'Cat', 1, 2, '2026-02-01 00:01:18'),
(51, 27, 'Pig', 0, 3, '2026-02-01 00:01:18'),
(52, 38, 'Cat::Meow', 0, 1, '2026-02-01 00:05:31'),
(53, 38, 'Dog::Bark', 0, 2, '2026-02-01 00:05:31'),
(54, 38, 'Cow::Moo', 0, 3, '2026-02-01 00:05:31'),
(55, 38, 'Pig::Oink', 0, 4, '2026-02-01 00:05:31'),
(56, 38, 'Duck::Quack', 0, 5, '2026-02-01 00:05:31');

-- --------------------------------------------------------

--
-- Table structure for table `activity_settings`
--

CREATE TABLE `activity_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL COMMENT 'References activities.id',
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Setting name (e.g., time_limit, shuffle_questions)',
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Setting value (JSON or plain text)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Activity-specific settings and configurations';

-- --------------------------------------------------------

--
-- Table structure for table `activity_student_answers`
--

CREATE TABLE `activity_student_answers` (
  `id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL COMMENT 'References activities.id',
  `question_id` bigint UNSIGNED NOT NULL COMMENT 'References activity_questions.id',
  `student_id` int UNSIGNED NOT NULL COMMENT 'References students.id',
  `choice_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Selected choice for multiple choice questions',
  `answer_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Text answer for essay/short answer questions',
  `is_correct` tinyint(1) DEFAULT NULL COMMENT 'Auto-graded for MC, manual for essay',
  `points_earned` decimal(5,2) DEFAULT '0.00' COMMENT 'Points earned for this answer',
  `answered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Student answers to quiz/exam questions';

--
-- Dumping data for table `activity_student_answers`
--

INSERT INTO `activity_student_answers` (`id`, `activity_id`, `question_id`, `student_id`, `choice_id`, `answer_text`, `is_correct`, `points_earned`, `answered_at`) VALUES
(1, 6, 23, 93, 37, NULL, 0, 0.00, '2026-02-01 09:47:23'),
(2, 6, 24, 93, 41, NULL, 1, 1.00, '2026-02-01 09:47:23'),
(3, 6, 25, 93, 45, NULL, 0, 0.00, '2026-02-01 09:47:23'),
(4, 6, 26, 93, 47, NULL, 1, 1.00, '2026-02-01 09:47:23'),
(5, 6, 27, 93, 50, NULL, 1, 1.00, '2026-02-01 09:47:23'),
(6, 6, 28, 93, NULL, 'True', 1, 1.00, '2026-02-01 09:47:23'),
(7, 6, 29, 93, NULL, 'True', 0, 0.00, '2026-02-01 09:47:23'),
(8, 6, 30, 93, NULL, 'False', 1, 1.00, '2026-02-01 09:47:23'),
(9, 6, 31, 93, NULL, 'False', 0, 0.00, '2026-02-01 09:47:23'),
(10, 6, 32, 93, NULL, 'True', 0, 0.00, '2026-02-01 09:47:23'),
(11, 6, 33, 93, NULL, 'Apple', 1, 1.00, '2026-02-01 09:47:23'),
(12, 6, 34, 93, NULL, 'Banana', 0, 0.00, '2026-02-01 09:47:23'),
(13, 6, 35, 93, NULL, 'cow', 0, 0.00, '2026-02-01 09:47:23'),
(14, 6, 36, 93, NULL, 'mango', 1, 1.00, '2026-02-01 09:47:23'),
(15, 6, 37, 93, NULL, 'bee', 1, 1.00, '2026-02-01 09:47:23'),
(16, 6, 38, 93, NULL, '[3,1,4,0,2]', 0, 1.00, '2026-02-01 09:47:23'),
(17, 6, 39, 93, NULL, 'Dog', 0, 0.00, '2026-02-01 09:47:23');

-- --------------------------------------------------------

--
-- Table structure for table `activity_submissions`
--

CREATE TABLE `activity_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL COMMENT 'References activities.id',
  `student_id` int UNSIGNED NOT NULL COMMENT 'References students.id',
  `submission_type` enum('file','text','link','none') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'file' COMMENT 'Type of submission',
  `submission_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'For text-based submissions',
  `submission_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'For link-based submissions',
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_late` tinyint(1) DEFAULT '0' COMMENT 'Submitted after due date',
  `attempt_number` int NOT NULL DEFAULT '1' COMMENT 'Attempt number (allow multiple attempts)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Student submissions for activities (files, text, links)';

--
-- Dumping data for table `activity_submissions`
--

INSERT INTO `activity_submissions` (`id`, `activity_id`, `student_id`, `submission_type`, `submission_text`, `submission_url`, `submitted_at`, `is_late`, `attempt_number`) VALUES
(2, 5, 93, 'file', 'test image\r\n', NULL, '2026-02-01 17:40:26', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `activity_submission_files`
--

CREATE TABLE `activity_submission_files` (
  `id` bigint UNSIGNED NOT NULL,
  `submission_id` bigint UNSIGNED NOT NULL COMMENT 'References activity_submissions.id',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Original file name',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Server storage path',
  `file_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'MIME type (e.g., image/jpeg, application/pdf)',
  `file_size` bigint DEFAULT NULL COMMENT 'File size in bytes',
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='File attachments for student submissions';

--
-- Dumping data for table `activity_submission_files`
--

INSERT INTO `activity_submission_files` (`id`, `submission_id`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_at`) VALUES
(1, 2, 'download (15).jpg', 'public/uploads/submissions/697ff27a4f4dc_1769992826.jpg', NULL, 59936, '2026-02-02 00:40:26');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `audience` enum('all','students','teachers') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `status` enum('draft','active','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `published_at` datetime DEFAULT NULL,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `message`, `audience`, `status`, `published_at`, `starts_at`, `ends_at`, `created_by`, `metadata`, `created_at`, `updated_at`) VALUES
(4, 'Semester Break Notice', 'The semester break starts December 1. Campus closed.', 'all', 'active', '2025-11-23 19:55:03', '2025-12-01 03:54:00', '2026-01-01 03:54:00', 3, NULL, '2025-11-23 12:55:03', '2025-11-23 19:56:44'),
(5, 'Grade Submission Deadline', 'All teachers must submit grades by Jan 18.', 'teachers', 'active', '2025-11-23 19:56:02', '2025-12-24 03:55:00', '2026-01-18 03:55:00', 3, NULL, '2025-11-23 12:56:02', '2025-11-23 19:58:07');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int UNSIGNED NOT NULL,
  `session_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `status` enum('present','late','absent','excused') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `broadcasts`
--

CREATE TABLE `broadcasts` (
  `id` bigint UNSIGNED NOT NULL,
  `teacher_id` bigint UNSIGNED NOT NULL,
  `teacher_subject_id` bigint UNSIGNED DEFAULT NULL,
  `section_id` bigint UNSIGNED DEFAULT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachments` json DEFAULT NULL,
  `status` enum('draft','pending','sent','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `recipients_count` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `broadcasts`
--

INSERT INTO `broadcasts` (`id`, `teacher_id`, `teacher_subject_id`, `section_id`, `body`, `attachments`, `status`, `recipients_count`, `created_at`, `sent_at`) VALUES
(7, 52, 6, 1, 'resr', NULL, 'sent', 21, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(8, 52, 6, 1, 'test', NULL, 'sent', 21, '2025-11-26 16:11:31', '2025-11-26 16:11:31');

-- --------------------------------------------------------

--
-- Table structure for table `campus`
--

CREATE TABLE `campus` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `geo_radius_m` int NOT NULL DEFAULT '50',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `campus`
--

INSERT INTO `campus` (`id`, `name`, `address`, `latitude`, `longitude`, `geo_radius_m`, `created_at`, `updated_at`) VALUES
(1, 'Marantha Christian Academy Foundation Calapan City', 'Ilaya, Calapan City, Oriental Mindoro', 13.3880969, 121.1622968, 200, '2025-11-20 12:26:33', '2026-02-08 03:34:13');

-- --------------------------------------------------------

--
-- Table structure for table `discount_templates`
--

CREATE TABLE `discount_templates` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('Scholarship','Sibling','Staff','Early Bird','Other') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `value_type` enum('Fixed Amount','Percentage') DEFAULT 'Percentage',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `discount_templates`
--

INSERT INTO `discount_templates` (`id`, `name`, `type`, `value`, `value_type`, `description`, `is_active`) VALUES
(3, 'Siblings Discount', 'Sibling', 5.00, 'Percentage', '', 1),
(4, 'Full Payment Discount', 'Other', 500.00, 'Fixed Amount', 'One-Time Payment Discount', 1);

-- --------------------------------------------------------

--
-- Table structure for table `document_requirements`
--

CREATE TABLE `document_requirements` (
  `id` int NOT NULL,
  `grade_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nursery 1, Nursery 2, Kinder, Grade 1, Grade 2, etc.',
  `enrollment_type` enum('New Student','Returning Student','Transferee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NULL means applies to all types',
  `document_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Birth Certificate, Form 137, SF-10, etc.',
  `is_required` tinyint(1) DEFAULT '1' COMMENT 'If false, document is optional',
  `display_order` int DEFAULT '0' COMMENT 'Order to display in UI',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Helper text for the document (e.g., "For age verification")',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Can be disabled without deleting',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_requirements`
--

INSERT INTO `document_requirements` (`id`, `grade_level`, `enrollment_type`, `document_name`, `is_required`, `display_order`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Nursery 1', NULL, 'Birth Certificate', 1, 1, 'For age verification (3-4 years old)', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(2, 'Nursery 2', NULL, 'Birth Certificate', 1, 1, 'For age verification (4-5 years old)', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(3, 'Kinder', NULL, 'Birth Certificate', 1, 1, 'For age verification (5-6 years old)', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(4, 'Grade 1', 'New Student', 'ECCD Checklist', 1, 1, 'Early Childhood Care and Development assessment', 1, '2026-02-04 10:00:04', '2026-02-06 10:28:18'),
(5, 'Grade 1', 'New Student', 'Birth Certificate', 1, 1, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-06 10:28:23'),
(6, 'Grade 1', 'Returning Student', 'Birth Certificate', 1, 1, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-06 10:28:23'),
(7, 'Grade 2', 'New Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(8, 'Grade 2', 'New Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(9, 'Grade 2', 'New Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(10, 'Grade 2', 'Returning Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(11, 'Grade 2', 'Returning Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(12, 'Grade 2', 'Returning Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(13, 'Grade 3', 'New Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(14, 'Grade 3', 'New Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(15, 'Grade 3', 'New Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(16, 'Grade 3', 'Returning Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(17, 'Grade 3', 'Returning Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(18, 'Grade 3', 'Returning Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(19, 'Grade 4', 'New Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(20, 'Grade 4', 'New Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(21, 'Grade 4', 'New Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(22, 'Grade 4', 'Returning Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(23, 'Grade 4', 'Returning Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(24, 'Grade 4', 'Returning Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(25, 'Grade 5', 'New Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 18:50:57'),
(26, 'Grade 5', 'New Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 18:22:18'),
(27, 'Grade 5', 'New Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 18:44:42'),
(28, 'Grade 5', 'Returning Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 18:50:57'),
(29, 'Grade 5', 'Returning Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 18:22:18'),
(30, 'Grade 5', 'Returning Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 18:44:42'),
(31, 'Grade 6', 'New Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(32, 'Grade 6', 'New Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(33, 'Grade 6', 'New Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(34, 'Grade 6', 'Returning Student', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(35, 'Grade 6', 'Returning Student', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(36, 'Grade 6', 'Returning Student', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(37, 'Grade 2', 'Transferee', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(38, 'Grade 2', 'Transferee', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(39, 'Grade 2', 'Transferee', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(41, 'Grade 3', 'Transferee', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(42, 'Grade 3', 'Transferee', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(43, 'Grade 3', 'Transferee', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(45, 'Grade 4', 'Transferee', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(46, 'Grade 4', 'Transferee', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(47, 'Grade 4', 'Transferee', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(49, 'Grade 5', 'Transferee', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 18:50:57'),
(50, 'Grade 5', 'Transferee', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 18:22:18'),
(51, 'Grade 5', 'Transferee', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 18:44:42'),
(53, 'Grade 6', 'Transferee', 'Parent\'s Agreement Form', 1, 1, 'Signed consent form', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(54, 'Grade 6', 'Transferee', 'Birth Certificate', 1, 2, 'Official birth record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(55, 'Grade 6', 'Transferee', 'Form 137', 1, 3, 'Permanent Academic Record', 1, '2026-02-04 10:00:04', '2026-02-04 10:00:04'),
(57, 'Grade 1', 'Transferee', 'ECCD Checklist', 1, 1, 'Early Childhood Care and Development assessment', 1, '2026-02-06 10:28:19', '2026-02-06 10:28:19'),
(58, 'Grade 1', 'Transferee', 'Birth Certificate', 1, 1, 'Official birth record', 1, '2026-02-06 10:28:23', '2026-02-06 10:28:23');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int UNSIGNED NOT NULL,
  `academic_period_id` int UNSIGNED NOT NULL COMMENT 'Links to academic_periods (determines school_year + quarter)',
  `enrollment_period_id` int UNSIGNED DEFAULT NULL COMMENT 'Which enrollment period this enrollment was submitted during',
  `created_user_id` int UNSIGNED DEFAULT NULL,
  `created_student_id` int UNSIGNED DEFAULT NULL,
  `enrollment_type` enum('New Student','Returning Student','Transferee','Continuing Student') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'New Student',
  `grade_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Pending','Under Review','Incomplete','Verified','Approved','Rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rejection_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `submitted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `first_reviewed_date` timestamp NULL DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `rejected_date` timestamp NULL DEFAULT NULL,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `last_reviewed_by` int UNSIGNED DEFAULT NULL,
  `last_review_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `academic_period_id`, `enrollment_period_id`, `created_user_id`, `created_student_id`, `enrollment_type`, `grade_level`, `status`, `rejection_reason`, `rejection_note`, `submitted_date`, `first_reviewed_date`, `approved_date`, `rejected_date`, `approved_by`, `last_reviewed_by`, `last_review_date`, `created_at`, `updated_at`) VALUES
(19, 30, 1, 429, 389, 'New Student', 'Grade 1', 'Approved', NULL, NULL, '2026-02-03 17:26:20', NULL, '2026-02-07 10:28:25', NULL, 3, 3, '2026-02-07 09:32:13', '2026-02-03 10:26:20', '2026-02-08 15:49:09'),
(20, 30, 1, 430, 390, 'New Student', 'Grade 1', 'Approved', NULL, NULL, '2026-02-07 19:46:43', NULL, '2026-02-07 14:31:49', NULL, 3, 3, '2026-02-07 12:49:21', '2026-02-07 12:46:43', '2026-02-08 15:49:22'),
(33, 30, 1, 432, 415, 'New Student', 'Nursery 1', 'Approved', NULL, NULL, '2026-02-11 12:09:22', NULL, '2026-02-15 02:12:47', NULL, 3, 3, '2026-02-12 03:56:12', '2026-02-11 05:09:22', '2026-02-15 09:12:47'),
(34, 30, 1, 398, NULL, 'Continuing Student', 'Grade 4', 'Pending', NULL, NULL, '2026-02-13 17:02:08', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-13 10:02:08', '2026-02-13 10:02:08'),
(35, 30, 1, 110, NULL, 'Continuing Student', 'Grade 3', 'Pending', NULL, NULL, '2026-02-14 08:22:16', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-14 01:22:16', '2026-02-14 01:22:16'),
(36, 26, 1, 431, 416, 'New Student', 'Nursery 1', 'Approved', NULL, NULL, '2026-02-15 09:16:06', NULL, '2026-02-15 02:16:40', NULL, 3, NULL, NULL, '2026-02-15 02:16:06', '2026-02-15 09:16:40'),
(44, 30, 1, 446, NULL, 'New Student', 'Grade 4', 'Pending', NULL, NULL, '2026-02-19 01:21:11', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-18 18:21:11', '2026-02-18 18:21:11');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_addresses`
--

CREATE TABLE `enrollment_addresses` (
  `id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `address_type` enum('Current','Permanent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barangay` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `municipality` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollment_addresses`
--

INSERT INTO `enrollment_addresses` (`id`, `enrollment_id`, `address_type`, `address`, `barangay`, `municipality`, `province`, `zip_code`, `phone`, `created_at`) VALUES
(16, 19, 'Current', 'Jjjjk', 'Balite', 'City of Calapan', 'Oriental Mindoro', '5200', '09123822727', '2026-02-03 10:26:20'),
(17, 20, 'Current', 'Jjjjk', 'Balite', 'City of Calapan', 'Oriental Mindoro', '5200', '09123822727', '2026-02-07 12:46:43'),
(31, 33, 'Current', 'Jjjjk', 'Bessang', 'Allacapan', 'Cagayan', 'AL11AA', '09123822727', '2026-02-11 05:09:22'),
(32, 34, 'Current', 'Jjjjk', 'Afusing Bato', 'Alcala', 'Cagayan', 'AL11AA', '09123822727', '2026-02-13 10:02:08'),
(33, 35, 'Current', 'Manila', 'Santa Maria', 'Itbayat', 'Batanes', '5200', '09123822727', '2026-02-14 01:22:16'),
(34, 36, 'Current', 'sf', 'Banbanaal', 'Banayoyo', 'Ilocos Sur', '', '09237894623663', '2026-02-15 02:16:06'),
(39, 44, 'Current', 'Jjjjk', 'Banalo', 'City of Bacoor', 'Cavite', 'AL11AA', '09123822727', '2026-02-18 18:21:11');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_discounts`
--

CREATE TABLE `enrollment_discounts` (
  `id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `template_id` int UNSIGNED DEFAULT NULL,
  `payment_id` int UNSIGNED DEFAULT NULL,
  `applied_amount` decimal(10,2) NOT NULL,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `enrollment_discounts`
--

INSERT INTO `enrollment_discounts` (`id`, `enrollment_id`, `template_id`, `payment_id`, `applied_amount`, `approved_by`, `created_at`) VALUES
(4, 20, 3, NULL, 500.00, NULL, '2026-02-07 14:11:06'),
(5, 20, 4, NULL, 500.00, NULL, '2026-02-07 14:11:06');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_documents`
--

CREATE TABLE `enrollment_documents` (
  `id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path or URL to stored file',
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type (e.g., application/pdf, image/jpeg)',
  `file_size` int UNSIGNED DEFAULT NULL COMMENT 'File size in bytes',
  `document_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g., PSA Birth Certificate, School Records, Vaccination Card',
  `submission_method` enum('Uploaded','Physical','Both') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Uploaded',
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_by` int UNSIGNED DEFAULT NULL COMMENT 'User ID of admin who verified',
  `physical_verified_by` int UNSIGNED DEFAULT NULL COMMENT 'Admin who verified physical document',
  `verification_status` enum('Pending','Verified','Rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `rejection_reason` enum('Wrong Document Type','Unclear/Illegible','Incomplete Information','Document Expired','Does Not Match Requirements','Invalid Format','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `physical_verification_status` enum('Not Required','Pending','Checked','Missing') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Not Required',
  `verification_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `verified_date` timestamp NULL DEFAULT NULL,
  `physical_verified_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resubmission_count` int UNSIGNED DEFAULT '0' COMMENT 'Number of times this document has been resubmitted',
  `previous_version_id` int UNSIGNED DEFAULT NULL COMMENT 'Links to previous version of this document if resubmitted',
  `is_current_version` tinyint(1) DEFAULT '1' COMMENT 'FALSE if this has been replaced by a resubmission',
  `resubmission_requested_date` timestamp NULL DEFAULT NULL COMMENT 'When admin requested resubmission',
  `resubmitted_date` timestamp NULL DEFAULT NULL COMMENT 'When student uploaded new version'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores documents uploaded during enrollment process';

--
-- Dumping data for table `enrollment_documents`
--

INSERT INTO `enrollment_documents` (`id`, `enrollment_id`, `file_name`, `file_path`, `file_type`, `file_size`, `document_type`, `submission_method`, `upload_date`, `verified_by`, `physical_verified_by`, `verification_status`, `rejection_reason`, `physical_verification_status`, `verification_notes`, `verified_date`, `physical_verified_date`, `created_at`, `updated_at`, `resubmission_count`, `previous_version_id`, `is_current_version`, `resubmission_requested_date`, `resubmitted_date`) VALUES
(7, 19, 'Physical Copy', '', 'N/A', NULL, 'Birth Certificate', 'Physical', '2026-02-07 10:11:17', 3, NULL, 'Verified', NULL, 'Not Required', NULL, '2026-02-07 10:11:17', NULL, '2026-02-07 17:11:17', '2026-02-07 17:11:17', 0, NULL, 1, NULL, NULL),
(8, 19, 'Physical Copy', '', 'N/A', NULL, 'ECCD Checklist', 'Physical', '2026-02-07 10:11:20', 3, NULL, 'Verified', NULL, 'Not Required', NULL, '2026-02-07 10:11:20', NULL, '2026-02-07 17:11:20', '2026-02-07 17:11:20', 0, NULL, 1, NULL, NULL),
(9, 20, 'Physical Copy', '', 'N/A', NULL, 'Birth Certificate', 'Physical', '2026-02-07 12:49:12', 3, NULL, 'Verified', NULL, 'Not Required', NULL, '2026-02-07 12:49:12', NULL, '2026-02-07 19:49:12', '2026-02-07 19:49:12', 0, NULL, 1, NULL, NULL),
(10, 20, 'Physical Copy', '', 'N/A', NULL, 'ECCD Checklist', 'Physical', '2026-02-07 12:49:13', 3, NULL, 'Verified', NULL, 'Not Required', NULL, '2026-02-07 12:49:13', NULL, '2026-02-07 19:49:13', '2026-02-07 19:49:13', 0, NULL, 1, NULL, NULL),
(19, 33, 'Physical Copy', '', 'N/A', NULL, 'Birth Certificate', 'Physical', '2026-02-12 03:56:10', 3, NULL, 'Verified', NULL, 'Not Required', NULL, '2026-02-12 03:56:10', NULL, '2026-02-12 10:56:10', '2026-02-12 10:56:10', 0, NULL, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_fee_items`
--

CREATE TABLE `enrollment_fee_items` (
  `id` bigint UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `package_id` int UNSIGNED DEFAULT NULL,
  `package_item_id` int UNSIGNED DEFAULT NULL,
  `year_level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_flags`
--

CREATE TABLE `enrollment_flags` (
  `id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `is_returning_student` tinyint(1) DEFAULT '0',
  `is_indigenous_ip` tinyint(1) DEFAULT '0',
  `is_4ps_beneficiary` tinyint(1) DEFAULT '0',
  `has_disability` tinyint(1) DEFAULT '0',
  `disability_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_language` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollment_flags`
--

INSERT INTO `enrollment_flags` (`id`, `enrollment_id`, `is_returning_student`, `is_indigenous_ip`, `is_4ps_beneficiary`, `has_disability`, `disability_type`, `special_language`, `created_at`) VALUES
(15, 19, 0, 0, 0, 0, '', '', '2026-02-03 10:26:20'),
(16, 20, 0, 0, 0, 0, '', '', '2026-02-07 12:46:43'),
(29, 33, 0, 0, 0, 0, '', '', '2026-02-11 05:09:22'),
(30, 34, 0, 0, 0, 0, '', '', '2026-02-13 10:02:08'),
(31, 35, 0, 0, 0, 0, '', '', '2026-02-14 01:22:16'),
(32, 36, 0, 0, 0, 0, '', '', '2026-02-15 02:16:06'),
(37, 44, 0, 0, 0, 0, '', NULL, '2026-02-18 18:21:11');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_learners`
--

CREATE TABLE `enrollment_learners` (
  `id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `birth_date` date NOT NULL,
  `gender` enum('Male','Female') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `psa_birth_cert_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollment_learners`
--

INSERT INTO `enrollment_learners` (`id`, `enrollment_id`, `first_name`, `middle_name`, `last_name`, `birth_date`, `gender`, `psa_birth_cert_number`, `created_at`) VALUES
(15, 19, 'Kairi', 'Madrigal', 'Dela Cruz', '2022-03-10', 'Male', '', '2026-02-03 10:26:20'),
(16, 20, 'JOHN CHRISTOPHER KING', 'VISAYA', 'ZAMORA', '2022-04-06', 'Male', '', '2026-02-07 12:46:43'),
(29, 33, 'Jordan', 'Evan', 'Clarkson', '2022-02-02', 'Male', '', '2026-02-11 05:09:22'),
(30, 34, 'JOHN CHRISTOPHER KING', 'V', 'ZAMORA', '2022-02-02', 'Male', '', '2026-02-13 10:02:08'),
(31, 35, 'Ana', 'Mendoza', 'Ortega', '2022-02-02', 'Female', '', '2026-02-14 01:22:16'),
(32, 36, 'Juan', 'moooo', 'Dela Cruz', '2022-02-02', 'Male', '', '2026-02-15 02:16:06'),
(37, 44, 'Jeizi', 'Production', 'Inc', '2022-02-02', 'Male', '', '2026-02-18 18:21:11');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_parent_contacts`
--

CREATE TABLE `enrollment_parent_contacts` (
  `id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `contact_type` enum('Father','Mother','Guardian') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollment_parent_contacts`
--

INSERT INTO `enrollment_parent_contacts` (`id`, `enrollment_id`, `contact_type`, `name`, `phone`, `email`, `is_primary`, `created_at`) VALUES
(17, 19, 'Father', 'Juan Dele Cruz', '0912372937', 'fatiher@gmail.com', 1, '2026-02-03 10:26:20'),
(18, 20, 'Father', 'ZAMORA, JOHN CHISTOPHER KING', '0912372937', 'jeizi.zamora@gmail.com', 1, '2026-02-07 12:46:43'),
(31, 33, 'Father', 'ZAMORA, JOHN CHRISTOPHER KING', '091274823', 'jeizi.zamora@gmail.com', 1, '2026-02-11 05:09:22'),
(32, 34, 'Father', 'ZAMORA, JOHN CHRISTOPHER KING', '09123822727', 'jeizi.zamora@gmail.com', 1, '2026-02-13 10:02:08'),
(33, 35, 'Father', 'ZAMORA, JOHN CHRISTOPHER KING', '09123822727', 'jeizi.zamora@gmail.com', 1, '2026-02-14 01:22:16'),
(34, 36, 'Father', 'Moasdhi', '0912379452737', 'asoomwu@gmail.com', 1, '2026-02-15 02:16:06'),
(39, 44, 'Father', 'Juan Dele Cruz', '091231249809', 'asddd@gmail.com', 1, '2026-02-18 18:21:11');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_periods`
--

CREATE TABLE `enrollment_periods` (
  `id` int UNSIGNED NOT NULL,
  `academic_period_id` int UNSIGNED NOT NULL COMMENT 'Which school year/quarter this enrollment is for',
  `enrollment_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., "S.Y. 2025-2026 Enrollment", "Mid-Year Enrollment"',
  `enrollment_type` enum('Regular','Mid-Year','Transferee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Regular',
  `start_date` date NOT NULL COMMENT 'When enrollment opens',
  `end_date` date NOT NULL COMMENT 'When enrollment closes',
  `status` enum('Upcoming','Open','Closed','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Upcoming',
  `max_slots` int UNSIGNED DEFAULT NULL COMMENT 'Maximum enrollees (optional)',
  `current_enrollees` int UNSIGNED DEFAULT '0',
  `allowed_grade_levels` json DEFAULT NULL COMMENT 'Array of grade levels allowed, NULL = all grades',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollment_periods`
--

INSERT INTO `enrollment_periods` (`id`, `academic_period_id`, `enrollment_name`, `enrollment_type`, `start_date`, `end_date`, `status`, `max_slots`, `current_enrollees`, `allowed_grade_levels`, `description`, `created_at`, `updated_at`) VALUES
(1, 30, '2026-2027 Enrollment', 'Regular', '2026-02-03', '2026-03-31', 'Open', NULL, 0, '[]', '', '2026-02-03 15:38:18', '2026-02-11 12:07:26'),
(2, 34, '2027-2028 Enrollment', 'Regular', '2026-03-03', '2026-04-08', 'Closed', NULL, 0, '[]', '', '2026-02-08 15:40:07', '2026-02-11 12:07:22');

-- --------------------------------------------------------

--
-- Table structure for table `final_grades`
--

CREATE TABLE `final_grades` (
  `id` bigint UNSIGNED NOT NULL,
  `student_id` bigint UNSIGNED NOT NULL,
  `subject_id` bigint UNSIGNED DEFAULT NULL,
  `section_id` bigint UNSIGNED DEFAULT NULL,
  `academic_period_id` bigint UNSIGNED DEFAULT NULL,
  `term` varchar(32) NOT NULL,
  `final_grade` varchar(10) NOT NULL,
  `final_grade_num` decimal(5,2) DEFAULT NULL,
  `status` enum('pending','submitted','approved','rejected') DEFAULT 'submitted',
  `submitted_by` bigint UNSIGNED DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `final_grades`
--

INSERT INTO `final_grades` (`id`, `student_id`, `subject_id`, `section_id`, `academic_period_id`, `term`, `final_grade`, `final_grade_num`, `status`, `submitted_by`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 347, 6, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(2, 336, 6, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(3, 324, 6, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(4, 326, 6, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(5, 265, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(6, 245, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(7, 240, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(8, 174, 6, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(9, 177, 6, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(10, 141, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(11, 140, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(12, 102, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(13, 93, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(14, 36, 6, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(15, 32, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(16, 31, 6, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(17, 30, 6, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(18, 28, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(19, 16, 6, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(20, 13, 6, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(21, 11, 6, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 52, '2025-11-23 14:09:31', '2025-11-23 14:09:31', '2025-11-23 14:09:31'),
(22, 347, 6, 1, 21, 'Final', '2.75', 76.00, 'submitted', 52, '2025-11-24 01:31:06', '2025-11-24 01:31:06', '2025-11-24 01:31:06'),
(23, 336, 6, 1, 21, 'Final', '2.25', 82.00, 'submitted', 52, '2025-11-24 01:31:06', '2025-11-24 01:31:06', '2025-11-24 01:31:06'),
(24, 324, 6, 1, 21, 'Final', '2.50', 79.00, 'submitted', 52, '2025-11-24 01:31:06', '2025-11-24 01:31:06', '2025-11-24 01:31:06'),
(25, 326, 6, 1, 21, 'Final', '2.00', 85.00, 'submitted', 52, '2025-11-24 01:31:06', '2025-11-24 01:31:06', '2025-11-24 01:31:06'),
(26, 265, 6, 1, 21, 'Final', '2.75', 76.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(27, 245, 6, 1, 21, 'Final', '5.00', 0.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(28, 240, 6, 1, 21, 'Final', '5.00', 0.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(29, 174, 6, 1, 21, 'Final', '5.00', 0.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(30, 177, 6, 1, 21, 'Final', '5.00', 0.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(31, 141, 6, 1, 21, 'Final', '2.75', 76.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(32, 140, 6, 1, 21, 'Final', '2.00', 85.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(33, 102, 6, 1, 21, 'Final', '2.50', 79.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(34, 93, 6, 1, 21, 'Final', '1.75', 88.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(35, 36, 6, 1, 21, 'Final', '2.25', 82.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(36, 32, 6, 1, 21, 'Final', '1.75', 88.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(37, 31, 6, 1, 21, 'Final', '5.00', 0.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(38, 30, 6, 1, 21, 'Final', '5.00', 0.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(39, 28, 6, 1, 21, 'Final', '5.00', 0.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(40, 16, 6, 1, 21, 'Final', '2.50', 79.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(41, 13, 6, 1, 21, 'Final', '2.75', 76.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(42, 11, 6, 1, 21, 'Final', '2.25', 82.00, 'submitted', 52, '2025-11-24 01:31:07', '2025-11-24 01:31:07', '2025-11-24 01:31:07'),
(43, 347, 1, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(44, 336, 1, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(45, 324, 1, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(46, 326, 1, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(47, 265, 1, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(48, 245, 1, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(49, 240, 1, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(50, 174, 1, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(51, 177, 1, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(52, 141, 1, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(53, 140, 1, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(54, 102, 1, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(55, 93, 1, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(56, 36, 1, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(57, 32, 1, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(58, 31, 1, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(59, 30, 1, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(60, 28, 1, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(61, 16, 1, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(62, 13, 1, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(63, 11, 1, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 410, '2025-11-24 01:31:31', '2025-11-24 01:31:31', '2025-11-24 01:31:31'),
(64, 347, 1, 1, 21, 'Final', '3.00', 75.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(65, 336, 1, 1, 21, 'Final', '2.25', 82.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(66, 324, 1, 1, 21, 'Final', '2.50', 79.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(67, 326, 1, 1, 21, 'Final', '1.75', 88.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(68, 265, 1, 1, 21, 'Final', '2.75', 76.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(69, 245, 1, 1, 21, 'Final', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(70, 240, 1, 1, 21, 'Final', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(71, 174, 1, 1, 21, 'Final', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(72, 177, 1, 1, 21, 'Final', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(73, 141, 1, 1, 21, 'Final', '2.75', 76.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(74, 140, 1, 1, 21, 'Final', '1.75', 88.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(75, 102, 1, 1, 21, 'Final', '2.50', 79.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(76, 93, 1, 1, 21, 'Final', '1.75', 88.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(77, 36, 1, 1, 21, 'Final', '2.00', 85.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(78, 32, 1, 1, 21, 'Final', '1.75', 88.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(79, 31, 1, 1, 21, 'Final', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(80, 30, 1, 1, 21, 'Final', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(81, 28, 1, 1, 21, 'Final', '5.00', 0.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(82, 16, 1, 1, 21, 'Final', '2.50', 79.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(83, 13, 1, 1, 21, 'Final', '2.75', 76.00, 'submitted', 410, '2025-11-24 01:31:35', '2025-11-24 01:31:35', '2025-11-24 01:31:35'),
(84, 11, 1, 1, 21, 'Final', '2.00', 85.00, 'submitted', 410, '2025-11-24 01:31:36', '2025-11-24 01:31:36', '2025-11-24 01:31:36'),
(85, 347, 4, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(86, 336, 4, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(87, 324, 4, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(88, 326, 4, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(89, 265, 4, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(90, 245, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(91, 240, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(92, 174, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(93, 177, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(94, 141, 4, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(95, 140, 4, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(96, 102, 4, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(97, 93, 4, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(98, 36, 4, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(99, 32, 4, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(100, 31, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(101, 30, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(102, 28, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(103, 16, 4, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(104, 13, 4, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(105, 11, 4, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 409, '2025-11-24 01:31:49', '2025-11-24 01:31:49', '2025-11-24 01:31:49'),
(106, 347, 4, 1, 21, 'Final', '2.25', 82.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(107, 336, 4, 1, 21, 'Final', '2.25', 82.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(108, 324, 4, 1, 21, 'Final', '2.50', 79.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(109, 326, 4, 1, 21, 'Final', '2.00', 85.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(110, 265, 4, 1, 21, 'Final', '2.50', 79.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(111, 245, 4, 1, 21, 'Final', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(112, 240, 4, 1, 21, 'Final', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(113, 174, 4, 1, 21, 'Final', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(114, 177, 4, 1, 21, 'Final', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(115, 141, 4, 1, 21, 'Final', '2.75', 76.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(116, 140, 4, 1, 21, 'Final', '2.00', 85.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(117, 102, 4, 1, 21, 'Final', '2.50', 79.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(118, 93, 4, 1, 21, 'Final', '1.75', 88.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(119, 36, 4, 1, 21, 'Final', '2.25', 82.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(120, 32, 4, 1, 21, 'Final', '1.75', 88.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(121, 31, 4, 1, 21, 'Final', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(122, 30, 4, 1, 21, 'Final', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(123, 28, 4, 1, 21, 'Final', '5.00', 0.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(124, 16, 4, 1, 21, 'Final', '2.50', 79.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(125, 13, 4, 1, 21, 'Final', '2.75', 76.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(126, 11, 4, 1, 21, 'Final', '2.25', 82.00, 'submitted', 409, '2025-11-24 01:31:53', '2025-11-24 01:31:53', '2025-11-24 01:31:53'),
(127, 347, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(128, 336, 5, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(129, 324, 5, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(130, 326, 5, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(131, 265, 5, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(132, 245, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(133, 240, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(134, 174, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(135, 177, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(136, 141, 5, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(137, 140, 5, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(138, 102, 5, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(139, 93, 5, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(140, 36, 5, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(141, 32, 5, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(142, 31, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(143, 30, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(144, 28, 5, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(145, 16, 5, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(146, 13, 5, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(147, 11, 5, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 21, '2025-11-24 01:32:08', '2025-11-24 01:32:08', '2025-11-24 01:32:08'),
(148, 347, 5, 1, 21, 'Final', '3.00', 75.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(149, 336, 5, 1, 21, 'Final', '2.25', 82.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(150, 324, 5, 1, 21, 'Final', '2.50', 79.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(151, 326, 5, 1, 21, 'Final', '1.75', 88.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(152, 265, 5, 1, 21, 'Final', '2.75', 76.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(153, 245, 5, 1, 21, 'Final', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(154, 240, 5, 1, 21, 'Final', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(155, 174, 5, 1, 21, 'Final', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(156, 177, 5, 1, 21, 'Final', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(157, 141, 5, 1, 21, 'Final', '2.75', 76.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(158, 140, 5, 1, 21, 'Final', '1.75', 88.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(159, 102, 5, 1, 21, 'Final', '2.50', 79.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(160, 93, 5, 1, 21, 'Final', '1.75', 88.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(161, 36, 5, 1, 21, 'Final', '2.00', 85.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(162, 32, 5, 1, 21, 'Final', '1.75', 88.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(163, 31, 5, 1, 21, 'Final', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(164, 30, 5, 1, 21, 'Final', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(165, 28, 5, 1, 21, 'Final', '5.00', 0.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(166, 16, 5, 1, 21, 'Final', '2.50', 79.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(167, 13, 5, 1, 21, 'Final', '2.75', 76.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(168, 11, 5, 1, 21, 'Final', '2.00', 85.00, 'submitted', 21, '2025-11-24 01:32:12', '2025-11-24 01:32:12', '2025-11-24 01:32:12'),
(169, 347, 3, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(170, 336, 3, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(171, 324, 3, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(172, 326, 3, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(173, 265, 3, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(174, 245, 3, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(175, 240, 3, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(176, 174, 3, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(177, 177, 3, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(178, 141, 3, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(179, 140, 3, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(180, 102, 3, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(181, 93, 3, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(182, 36, 3, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(183, 32, 3, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(184, 31, 3, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(185, 30, 3, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(186, 28, 3, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(187, 16, 3, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(188, 13, 3, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(189, 11, 3, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 412, '2025-11-24 01:32:26', '2025-11-24 01:32:26', '2025-11-24 01:32:26'),
(190, 347, 3, 1, 21, 'Final', '3.00', 75.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(191, 336, 3, 1, 21, 'Final', '2.25', 82.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(192, 324, 3, 1, 21, 'Final', '2.50', 79.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(193, 326, 3, 1, 21, 'Final', '2.00', 85.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(194, 265, 3, 1, 21, 'Final', '2.75', 76.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(195, 245, 3, 1, 21, 'Final', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(196, 240, 3, 1, 21, 'Final', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(197, 174, 3, 1, 21, 'Final', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(198, 177, 3, 1, 21, 'Final', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(199, 141, 3, 1, 21, 'Final', '2.75', 76.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(200, 140, 3, 1, 21, 'Final', '1.75', 88.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(201, 102, 3, 1, 21, 'Final', '2.50', 79.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(202, 93, 3, 1, 21, 'Final', '1.75', 88.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(203, 36, 3, 1, 21, 'Final', '2.25', 82.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(204, 32, 3, 1, 21, 'Final', '1.75', 88.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(205, 31, 3, 1, 21, 'Final', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(206, 30, 3, 1, 21, 'Final', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(207, 28, 3, 1, 21, 'Final', '5.00', 0.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(208, 16, 3, 1, 21, 'Final', '2.50', 79.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(209, 13, 3, 1, 21, 'Final', '2.75', 76.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(210, 11, 3, 1, 21, 'Final', '2.00', 85.00, 'submitted', 412, '2025-11-24 01:32:31', '2025-11-24 01:32:31', '2025-11-24 01:32:31'),
(211, 347, 2, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(212, 336, 2, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(213, 324, 2, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(214, 326, 2, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(215, 265, 2, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(216, 245, 2, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(217, 240, 2, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(218, 174, 2, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(219, 177, 2, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(220, 141, 2, 1, 20, 'Midterm', '3.00', 75.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(221, 140, 2, 1, 20, 'Midterm', '2.00', 85.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(222, 102, 2, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(223, 93, 2, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 411, '2025-11-24 01:32:44', '2025-11-24 01:32:44', '2025-11-24 01:32:44'),
(224, 36, 2, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(225, 32, 2, 1, 20, 'Midterm', '1.75', 88.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(226, 31, 2, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(227, 30, 2, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(228, 28, 2, 1, 20, 'Midterm', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(229, 16, 2, 1, 20, 'Midterm', '2.50', 79.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(230, 13, 2, 1, 20, 'Midterm', '2.75', 76.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(231, 11, 2, 1, 20, 'Midterm', '2.25', 82.00, 'submitted', 411, '2025-11-24 01:32:45', '2025-11-24 01:32:45', '2025-11-24 01:32:45'),
(232, 347, 2, 1, 21, 'Final', '3.00', 75.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(233, 336, 2, 1, 21, 'Final', '2.25', 82.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(234, 324, 2, 1, 21, 'Final', '2.50', 79.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(235, 326, 2, 1, 21, 'Final', '2.00', 85.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(236, 265, 2, 1, 21, 'Final', '2.75', 76.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(237, 245, 2, 1, 21, 'Final', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(238, 240, 2, 1, 21, 'Final', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(239, 174, 2, 1, 21, 'Final', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(240, 177, 2, 1, 21, 'Final', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(241, 141, 2, 1, 21, 'Final', '2.75', 76.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(242, 140, 2, 1, 21, 'Final', '1.75', 88.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(243, 102, 2, 1, 21, 'Final', '2.50', 79.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(244, 93, 2, 1, 21, 'Final', '1.75', 88.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(245, 36, 2, 1, 21, 'Final', '2.25', 82.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(246, 32, 2, 1, 21, 'Final', '1.75', 88.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(247, 31, 2, 1, 21, 'Final', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(248, 30, 2, 1, 21, 'Final', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(249, 28, 2, 1, 21, 'Final', '5.00', 0.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(250, 16, 2, 1, 21, 'Final', '2.50', 79.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(251, 13, 2, 1, 21, 'Final', '2.75', 76.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49'),
(252, 11, 2, 1, 21, 'Final', '2.00', 85.00, 'submitted', 411, '2025-11-24 01:32:49', '2025-11-24 01:32:49', '2025-11-24 01:32:49');

-- --------------------------------------------------------

--
-- Table structure for table `installments`
--

CREATE TABLE `installments` (
  `id` int UNSIGNED NOT NULL,
  `payment_plan_id` int UNSIGNED NOT NULL COMMENT 'Links to parent payment plan',
  `installment_number` int NOT NULL COMMENT '1st, 2nd, 3rd, etc.',
  `amount_due` decimal(10,2) NOT NULL COMMENT 'Expected payment for this installment',
  `amount_paid` decimal(10,2) DEFAULT '0.00' COMMENT 'Actual amount paid (may be partial)',
  `balance` decimal(10,2) NOT NULL COMMENT 'Remaining for this installment',
  `due_date` date DEFAULT NULL COMMENT 'Payment deadline (NULL for Upon Enrollment - to be set later)',
  `paid_date` date DEFAULT NULL COMMENT 'When fully paid',
  `status` enum('Pending','Paid','Partial','Overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `late_fee` decimal(10,2) DEFAULT '0.00' COMMENT 'Penalty for late payment',
  `days_overdue` int DEFAULT '0' COMMENT 'Calculated: days past due_date',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Individual installment payment deadlines';

--
-- Dumping data for table `installments`
--

INSERT INTO `installments` (`id`, `payment_plan_id`, `installment_number`, `amount_due`, `amount_paid`, `balance`, `due_date`, `paid_date`, `status`, `late_fee`, `days_overdue`, `created_at`, `updated_at`) VALUES
(25, 9, 1, 1250.00, 1250.00, 0.00, '2026-08-15', '2026-02-07', 'Paid', 0.00, 0, '2026-02-07 09:23:32', '2026-02-07 09:23:36'),
(26, 9, 2, 1250.00, 1250.00, 0.00, '2026-11-15', '2026-02-12', 'Paid', 0.00, 0, '2026-02-07 09:23:32', '2026-02-12 04:55:54'),
(27, 9, 3, 1250.00, 0.00, 1250.00, '2027-02-15', NULL, 'Pending', 0.00, 0, '2026-02-07 09:23:32', '2026-02-07 09:23:32'),
(28, 9, 4, 1250.00, 0.00, 1250.00, '2027-05-15', NULL, 'Pending', 0.00, 0, '2026-02-07 09:23:32', '2026-02-07 09:23:32'),
(125, 27, 1, 1250.00, 1250.00, 0.00, '2026-08-15', '2026-02-13', 'Paid', 0.00, 0, '2026-02-13 10:03:36', '2026-02-13 10:03:40'),
(126, 27, 2, 1250.00, 0.00, 1250.00, '2026-11-15', NULL, 'Pending', 0.00, 0, '2026-02-13 10:03:36', '2026-02-13 10:03:36'),
(127, 27, 3, 1250.00, 0.00, 1250.00, '2027-02-15', NULL, 'Pending', 0.00, 0, '2026-02-13 10:03:36', '2026-02-13 10:03:36'),
(128, 27, 4, 1250.00, 0.00, 1250.00, '2027-05-15', NULL, 'Pending', 0.00, 0, '2026-02-13 10:03:36', '2026-02-13 10:03:36'),
(159, 31, 1, 1710.00, 0.00, 1710.00, '2026-02-19', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:47', '2026-02-19 04:50:47'),
(160, 31, 2, 1710.00, 0.00, 1710.00, '2026-08-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:47', '2026-02-19 04:50:47'),
(161, 31, 3, 1710.00, 0.00, 1710.00, '2026-09-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:47', '2026-02-19 04:50:47'),
(162, 31, 4, 1710.00, 0.00, 1710.00, '2026-10-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:47', '2026-02-19 04:50:47'),
(163, 31, 5, 1710.00, 0.00, 1710.00, '2026-11-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:47', '2026-02-19 04:50:47'),
(164, 31, 6, 1710.00, 0.00, 1710.00, '2026-12-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:47', '2026-02-19 04:50:47'),
(165, 31, 7, 1710.00, 0.00, 1710.00, '2027-01-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:47', '2026-02-19 04:50:47'),
(166, 31, 8, 1710.00, 0.00, 1710.00, '2027-02-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:48', '2026-02-19 04:50:48'),
(167, 31, 9, 1710.00, 0.00, 1710.00, '2027-03-05', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:48', '2026-02-19 04:50:48'),
(168, 31, 10, 1710.00, 0.00, 1710.00, '2027-04-12', NULL, 'Pending', 0.00, 0, '2026-02-19 04:50:48', '2026-02-19 04:50:48');

-- --------------------------------------------------------

--
-- Table structure for table `learning_materials`
--

CREATE TABLE `learning_materials` (
  `id` int UNSIGNED NOT NULL,
  `subject_id` int UNSIGNED NOT NULL COMMENT 'Reference to subjects table',
  `section_id` int UNSIGNED DEFAULT NULL COMMENT 'Optional: Reference to sections table',
  `type` enum('text','file','link') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Material type: text (composed), file (uploaded), link (shared URL)',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Material title',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Material description or composed text content (HTML)',
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Full URL to uploaded file (for type=file)',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Original filename (for type=file)',
  `file_size` int DEFAULT NULL COMMENT 'File size in bytes (for type=file)',
  `link_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Shared URL (for type=link)',
  `created_by` int UNSIGNED NOT NULL COMMENT 'Teacher user ID who created this material',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores learning materials for subjects/sections';

--
-- Dumping data for table `learning_materials`
--

INSERT INTO `learning_materials` (`id`, `subject_id`, `section_id`, `type`, `title`, `description`, `file_url`, `file_name`, `file_size`, `link_url`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 47, 10, 'text', 'try', '<p>try</p>', NULL, NULL, NULL, NULL, 52, '2026-01-26 10:28:58', '2026-01-31 11:33:30'),
(2, 47, 10, 'link', 'ReactJS Quill Rich Text Editor', '<p>A modern, customizable <strong>WYSIWYG </strong>editor that allows instructors to format learning materials with bold, italic, lists, links, images, and more — just like a word processor. Built with <strong>React</strong></p><p> and <strong>Quill.js </strong>, it ensures seamless integration, real-time editing, and clean HTML output. Ideal for writing instructions, notes, announcements, or lesson descriptions with rich formatting — all without needing HTML knowledge.</p>', NULL, NULL, NULL, 'https://www.youtube.com/watch?v=TsqTzSV7WJE', 52, '2026-01-26 10:30:54', '2026-01-31 11:33:48'),
(3, 47, 10, 'link', 'ReactJS Quill Rich Text Editor', '<p>A modern, customizable WYSIWYG editor that allows instructors to format learning materials with bold, italic, lists, links, images, and more — just like a word processor. Built with React and Quill.js ,it ensures seamless integration, real-time editing, and clean HTML output. Ideal for writing instructions, notes, announcements, or lesson descriptions with rich formatting — all without needing HTML knowledge.</p>', NULL, NULL, NULL, '[\"https://www.youtube.com/watch?v=TsqTzSV7WJE\",\"https://www.youtube.com/watch?v=QVffer2fRfg\",\"https://www.youtube.com/watch?v=BznhaB9No10&list=RDBznhaB9No10&start_radio=1&pp=oAcB\",\"https://www.facebook.com/photo/?fbid=122312199224030494&set=a.122103957980030494\"]', 52, '2026-01-26 11:00:02', '2026-01-31 11:33:51'),
(4, 47, 10, 'file', 'Jeizi Font', '', 'http://localhost:3000/uploads/learning-materials/47/A-X_20260126190629_6977ad25b7d17.pdf', 'A-X.pdf', 8524990, NULL, 52, '2026-01-26 11:06:29', '2026-01-31 11:33:54'),
(5, 47, 10, 'file', 'ReactJS Quill Rich Text Editor', '<p>https://www.youtube.com/watch?v=TsqTzSV7WJE</p>', '[\"http://localhost:3000/uploads/learning-materials/47/Y-0_20260126191226_6977ae8ac8848.pdf\",\"http://localhost:3000/uploads/learning-materials/47/A-X_20260126191227_6977ae8b9501b.pdf\"]', '[\"Y-0.pdf\",\"A-X.pdf\"]', 14116055, NULL, 52, '2026-01-26 11:12:27', '2026-01-31 11:33:56'),
(6, 47, 10, 'text', 'Test', '<p>test</p>', NULL, NULL, NULL, NULL, 52, '2026-01-31 04:35:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint UNSIGNED NOT NULL,
  `sender_id` bigint UNSIGNED NOT NULL,
  `receiver_id` bigint UNSIGNED NOT NULL,
  `broadcast_id` bigint UNSIGNED DEFAULT NULL,
  `teacher_subject_id` bigint UNSIGNED DEFAULT NULL,
  `section_id` bigint UNSIGNED DEFAULT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachments` json DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `broadcast_id`, `teacher_subject_id`, `section_id`, `body`, `attachments`, `is_read`, `created_at`, `updated_at`) VALUES
(85, 52, 364, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(86, 52, 353, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(87, 52, 341, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(88, 52, 343, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(89, 52, 282, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(90, 52, 262, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(91, 52, 257, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(92, 52, 191, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(93, 52, 194, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(94, 52, 158, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(95, 52, 157, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(96, 52, 119, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(97, 52, 110, 7, 6, 1, 'resr', NULL, 1, '2025-11-26 15:50:07', '2025-11-27 03:07:55'),
(98, 52, 53, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(99, 52, 49, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(100, 52, 48, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(101, 52, 47, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(102, 52, 45, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(103, 52, 33, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(104, 52, 30, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(105, 52, 28, 7, 6, 1, 'resr', NULL, 0, '2025-11-26 15:50:07', '2025-11-26 15:50:07'),
(106, 52, 364, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(107, 52, 353, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(108, 52, 341, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(109, 52, 343, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(110, 52, 282, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(111, 52, 262, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(112, 52, 257, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(113, 52, 191, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(114, 52, 194, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(115, 52, 158, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(116, 52, 157, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(117, 52, 119, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(118, 52, 110, 8, 6, 1, 'test', NULL, 1, '2025-11-26 16:11:31', '2025-11-27 03:07:55'),
(119, 52, 53, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(120, 52, 49, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(121, 52, 48, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(122, 52, 47, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(123, 52, 45, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(124, 52, 33, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(125, 52, 30, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(126, 52, 28, 8, 6, 1, 'test', NULL, 0, '2025-11-26 16:11:31', '2025-11-26 16:11:31'),
(127, 110, 52, NULL, 6, 1, 'hatdog', NULL, 1, '2025-11-26 16:35:39', '2025-11-27 03:15:55'),
(128, 364, 52, NULL, 6, 1, 'Hello teacher — test DM', NULL, 1, '2025-11-27 01:06:59', '2025-11-27 03:15:54'),
(129, 110, 52, NULL, 6, NULL, 'sed tehasdno uaosdop ', NULL, 1, '2025-11-26 18:19:11', '2025-11-27 03:15:55'),
(130, 110, 9, NULL, 4, NULL, 'demo', NULL, 0, '2025-11-26 19:32:41', '2025-11-26 19:32:41'),
(131, 52, 110, NULL, NULL, NULL, 'hello', NULL, 1, '2025-11-26 20:21:18', '2025-11-27 03:21:32'),
(132, 52, 110, NULL, NULL, NULL, 'test', NULL, 1, '2025-11-26 20:47:53', '2025-11-27 03:48:02'),
(133, 110, 52, NULL, 6, NULL, 'test reply', NULL, 1, '2025-11-26 20:48:10', '2025-11-27 03:48:39'),
(134, 110, 52, NULL, 6, NULL, 'test again', NULL, 1, '2025-11-26 21:03:49', '2025-11-27 04:03:56'),
(135, 52, 110, NULL, NULL, NULL, 'reply', NULL, 1, '2025-11-26 21:04:02', '2025-11-27 04:06:30'),
(136, 110, 52, NULL, 6, NULL, 'testt messaging 1', NULL, 1, '2025-11-26 21:06:37', '2025-11-27 04:06:41'),
(137, 52, 110, NULL, NULL, NULL, 'not realtime', NULL, 1, '2025-11-26 21:06:57', '2025-11-27 04:15:41'),
(138, 52, 110, NULL, NULL, NULL, 'test send', NULL, 1, '2025-11-26 21:15:56', '2025-11-27 04:28:57'),
(139, 110, 52, NULL, 6, NULL, 'send this ', NULL, 1, '2025-11-26 21:29:02', '2025-11-27 04:31:16'),
(140, 110, 52, NULL, 6, NULL, 'check ', NULL, 1, '2025-11-26 21:31:11', '2025-11-27 04:31:16'),
(141, 52, 110, NULL, NULL, NULL, 'send', NULL, 1, '2025-11-26 21:31:21', '2025-11-27 04:48:41'),
(142, 52, 110, NULL, NULL, NULL, 'try this', NULL, 1, '2025-11-26 21:32:51', '2025-11-27 04:48:41'),
(143, 110, 52, NULL, 6, NULL, 'hello ', NULL, 1, '2025-11-26 21:48:46', '2025-11-27 05:04:41'),
(144, 110, 52, NULL, 6, NULL, 'test message', NULL, 1, '2025-11-26 22:04:45', '2025-11-27 05:04:46'),
(145, 52, 110, NULL, NULL, NULL, 'realtime', NULL, 1, '2025-11-26 22:05:35', '2025-11-27 05:05:36'),
(146, 110, 52, NULL, 6, NULL, 'test', NULL, 1, '2025-11-28 15:43:24', '2026-01-28 14:31:05');

-- --------------------------------------------------------

--
-- Table structure for table `parent_contacts`
--

CREATE TABLE `parent_contacts` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `contact_type` enum('Father','Mother','Guardian','Legal Guardian') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `middle_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_primary` tinyint(1) DEFAULT '0',
  `relationship` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occupation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_authorized_pickup` tinyint(1) DEFAULT '1',
  `can_receive_communications` tinyint(1) DEFAULT '1',
  `preferred_contact_method` enum('Phone','Email','SMS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Phone',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int UNSIGNED NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int UNSIGNED DEFAULT NULL,
  `token` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('password','pin','account_setup') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'password',
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores reset tokens for password reset, PIN reset, and account setup';

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `email`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`, `updated_at`) VALUES
(1, 'jeizi.zamora@gmail.com', NULL, '49914175d667023585b982fdeb68cdf8', 'password', '2025-11-14 18:46:31', 0, '2025-11-13 18:46:31', '2025-11-13 18:46:31'),
(2, 'jeizi.zamora@gmail.com', NULL, 'aa611f39db859591b0190e20c3461ffb', 'password', '2025-11-14 18:51:12', 1, '2025-11-13 18:51:12', '2025-11-13 18:58:26'),
(3, 'jeizi.zamora@gmail.com', NULL, '175d5c005fdeb6bd13f40b27763c1d6b', 'password', '2025-11-14 18:58:42', 1, '2025-11-13 18:58:42', '2025-11-13 18:59:14'),
(4, 'jeizi.zamora@gmail.com', NULL, '5471a2746e57d88274012fe0391f9db1', 'password', '2025-11-14 19:00:32', 1, '2025-11-13 19:00:32', '2025-11-13 19:01:07'),
(5, 'jeizi.zamora@gmail.com', NULL, '728b832af7a577b8fd6c2d93ef852edb', 'password', '2025-11-14 19:07:04', 1, '2025-11-13 19:07:04', '2025-11-13 19:07:45'),
(6, 'jeizi.zamora@gmail.com', NULL, 'bad59a6be67d1b8ef8557342e0129e18', 'password', '2025-11-14 19:07:59', 1, '2025-11-13 19:07:59', '2025-11-13 19:08:51'),
(7, 'jeizi.zamora@gmail.com', NULL, '3b75ca40f369c25574a0ea8254bc06fd', 'password', '2025-11-14 19:10:49', 0, '2025-11-13 19:10:49', '2025-11-13 19:10:49'),
(8, 'jeizi.zamora@gmail.com', NULL, 'aea5455d7b4be67bb179b49fe699b3dc', 'password', '2025-11-14 19:16:28', 0, '2025-11-13 19:16:28', '2025-11-13 19:16:28'),
(9, 'jeizi.zamora@gmail.com', NULL, '5f4cc59b179f502dcca24e5d7dcaba09', 'password', '2025-11-14 19:17:16', 0, '2025-11-13 19:17:16', '2025-11-13 19:17:16'),
(10, 'jeizi.zamora@gmail.com', NULL, 'cb14f3504972d2500f67de7adac24378', 'password', '2025-11-14 19:27:30', 0, '2025-11-13 19:27:30', '2025-11-13 19:27:30'),
(11, 'jeizi.zamora@gmail.com', NULL, '0a9c71c005b71aefceea79bdc87f1e1b', 'password', '2025-11-14 19:28:33', 0, '2025-11-13 19:28:33', '2025-11-13 19:28:33'),
(12, 'jeizi.zamora@gmail.com', NULL, '9974828f35cb23d5edb69d159db4135c', 'password', '2025-11-14 19:30:02', 0, '2025-11-13 19:30:02', '2025-11-13 19:30:02'),
(13, 'jeizi.zamora@gmail.com', NULL, '5d06890675c2d764ee675f6ba96cc073', 'password', '2025-11-14 19:30:18', 0, '2025-11-13 19:30:18', '2025-11-13 19:30:18'),
(14, 'jeizi.zamora@gmail.com', NULL, 'bee2fe72269a4c10f472151f6b43db8d', 'password', '2025-11-14 19:30:28', 0, '2025-11-13 19:30:28', '2025-11-13 19:30:28'),
(15, 'jeizi.zamora@gmail.com', NULL, 'f537340b629c285391b61cb142d7ca84', 'password', '2025-11-14 19:31:48', 0, '2025-11-13 19:31:48', '2025-11-13 19:31:48'),
(16, 'jeizi.zamora@gmail.com', NULL, '0da38cec28f98b08ee0609aab5d523b2', 'password', '2025-11-14 19:32:06', 0, '2025-11-13 19:32:06', '2025-11-13 19:32:06'),
(17, 'jeizi.zamora@gmail.com', NULL, 'ee6f2ac1b07ddbc7f9aa844f6840ca85', 'password', '2025-11-14 19:33:18', 0, '2025-11-13 19:33:18', '2025-11-13 19:33:18'),
(18, 'iamchris.japan@gmail.com', NULL, 'c8e1114f849c840b567c20186147cc05', 'password', '2025-11-14 20:13:00', 0, '2025-11-13 20:13:00', '2025-11-13 20:13:00'),
(19, 'iamchris.japan@gmail.com', NULL, '67c0d65cfa9c226f065bd2f71b91934c', 'password', '2025-11-14 20:13:45', 0, '2025-11-13 20:13:45', '2025-11-13 20:13:45'),
(20, 'jeizi.zamora@gmail.com', NULL, 'e33b1af61c5caa1d5f90c23fd2f85b3b', 'password', '2026-02-14 13:58:24', 0, '2026-02-13 13:58:24', '2026-02-13 13:58:24'),
(21, 'jeizi.zamora@gmail.com', NULL, '85c60c5c560afaaf70c8ec5272c4f5e9', 'password', '2026-02-14 13:59:20', 0, '2026-02-13 13:59:20', '2026-02-13 13:59:20'),
(22, 'jeizi.zamora@gmail.com', NULL, '6dba4e63b82596ef5e81c27a17babe11', 'password', '2026-02-14 14:25:10', 0, '2026-02-13 14:25:10', '2026-02-13 14:25:10'),
(23, 'jeizi.zamora@gmail.com', NULL, 'd0cb1dac85f41112fc0fd3d97750a483', 'password', '2026-02-14 14:27:37', 0, '2026-02-13 14:27:37', '2026-02-13 14:27:37'),
(24, 'jeizi.zamora@gmail.com', NULL, '7d7df23cf76d0956ab071c4df16ce00f', 'password', '2026-02-14 14:35:43', 0, '2026-02-13 14:35:43', '2026-02-13 14:35:43'),
(25, 'jeizi.zamora@gmail.com', NULL, '4093b92ee16ba6825ba972b0c605502d', 'password', '2026-02-14 14:36:53', 0, '2026-02-13 14:36:53', '2026-02-13 14:36:53'),
(26, 'jeizi.zamora@gmail.com', NULL, 'b281a62727e32b0a5b0500e616952ba9', 'password', '2026-02-14 16:23:16', 0, '2026-02-13 16:23:16', '2026-02-13 16:23:16'),
(27, 'jeizi.zamora@gmail.com', NULL, '5d54bc6c97f6d39f1f621a560f1d17cf', 'password', '2026-02-14 16:29:10', 0, '2026-02-13 16:29:10', '2026-02-13 16:29:10'),
(28, 'jeizi.zamora@gmail.com', NULL, '6e0a94c4ea590974544780d89a0c87b1', 'password', '2026-02-14 16:29:34', 0, '2026-02-13 16:29:34', '2026-02-13 16:29:34'),
(29, 'jeizi.zamora@gmail.com', NULL, 'e0b14d1699ded6b1b709bb3bfc39b4d2', 'password', '2026-02-14 16:44:22', 0, '2026-02-13 16:44:22', '2026-02-13 16:44:22'),
(30, 'jeizi.zamora@gmail.com', NULL, 'f15ba794dfa4b35fec5ecaab805baa67', 'password', '2026-02-14 16:46:30', 0, '2026-02-13 16:46:30', '2026-02-13 16:46:30'),
(31, 'jeizi.zamora@gmail.com', NULL, '5e7cc440e42cb5fb17afa0b2338a5f19', 'password', '2026-02-14 17:01:45', 0, '2026-02-13 17:01:45', '2026-02-13 17:01:45'),
(32, 'jeizi.zamora@gmail.com', NULL, 'c3f156871f8c6c4fb6cb8158d4475376', 'password', '2026-02-14 17:42:05', 0, '2026-02-13 17:42:05', '2026-02-13 17:42:05'),
(33, 'jeizi.zamora@gmail.com', NULL, 'ece2b0da05d1d346454185b3b84fa898', 'password', '2026-02-14 17:47:22', 0, '2026-02-13 17:47:22', '2026-02-13 17:47:22'),
(40, 'jeizi.zamora@gmail.com', NULL, 'bf5bf456530920f589ba54a2a4c74582', 'pin', '2026-02-15 12:13:33', 1, '2026-02-14 12:13:33', '2026-02-14 12:50:46'),
(41, 'jeizi.zamora@gmail.com', NULL, 'de4311c42b5e5c6f97626d0b5b60fee8', 'password', '2026-02-16 07:26:00', 0, '2026-02-15 07:26:00', '2026-02-15 07:26:00'),
(42, 'jeizi.zamora@gmail.com', NULL, '0cc3d7053863585673554218ba0d0c51', 'password', '2026-02-19 14:08:07', 0, '2026-02-18 14:08:07', '2026-02-18 14:08:07'),
(44, 'johnchristopherkingzamora@gmail.com', 446, 'b984fe14f24434f57a9a2ac0eb4557004402dcab3f6599d9ff7d3d3977b79953', 'account_setup', '2026-02-19 03:21:05', 1, '2026-02-19 02:21:05', '2026-02-19 02:21:52'),
(45, 'studentg444@gmail.com', 449, 'fd6bf1e78e1659457a80b1cae6f962fdb5bffb80f56cea15a60a834232d8606b', 'account_setup', '2026-02-19 11:01:13', 0, '2026-02-19 10:01:13', '2026-02-19 10:01:13');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED DEFAULT NULL COMMENT 'References users.id - allows enrollees without student records to make payments',
  `enrollment_id` int UNSIGNED DEFAULT NULL COMMENT 'Links to enrollment if payment is enrollment-related',
  `academic_period_id` int UNSIGNED NOT NULL COMMENT 'Links to academic_periods (school_year + quarter)',
  `receipt_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_type` enum('Tuition Full Payment','Tuition Installment','Miscellaneous','Contribution','Event Fee','Book','Uniform','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Payment type - removed Enrollment Fee, added Tuition Full Payment',
  `payment_for` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Description: Enrollment S.Y. 2025-2026, 1st Quarter Tuition, Christmas Party, etc.',
  `amount` decimal(10,2) NOT NULL,
  `total_discount` decimal(10,2) DEFAULT '0.00' COMMENT 'Sum of all applied discounts',
  `net_amount` decimal(10,2) GENERATED ALWAYS AS ((`amount` - `total_discount`)) STORED COMMENT 'Final amount after discounts',
  `payment_method` enum('Cash','Check','Bank Transfer','GCash','PayMaya','Others') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_date` date NOT NULL,
  `reference_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Check number, Transaction ID, etc.',
  `installment_id` int UNSIGNED DEFAULT NULL COMMENT 'Links to installment ONLY if payment_type is Tuition Installment',
  `proof_of_payment_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Upload path for online payment screenshots/receipts',
  `status` enum('Pending','Verified','Approved','Rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Approved' COMMENT 'Payment verification status (for online payments)',
  `is_refund` tinyint(1) DEFAULT '0' COMMENT '1 if this is a refund transaction',
  `refund_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `original_payment_id` int UNSIGNED DEFAULT NULL COMMENT 'If refund, links to original payment being refunded',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes, partial payment info, etc.',
  `received_by` int UNSIGNED DEFAULT NULL COMMENT 'User ID of cashier/admin who received payment',
  `verified_by` int UNSIGNED DEFAULT NULL COMMENT 'User ID who verified online payment',
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Unified payment tracking for all fee types (enrollment, tuition, misc fees)';

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `student_id`, `enrollment_id`, `academic_period_id`, `receipt_number`, `payment_type`, `payment_for`, `amount`, `total_discount`, `payment_method`, `payment_date`, `reference_number`, `installment_id`, `proof_of_payment_url`, `status`, `is_refund`, `refund_reason`, `original_payment_id`, `remarks`, `received_by`, `verified_by`, `verified_at`, `created_at`, `updated_at`) VALUES
(16, 429, 19, 30, 'RCP-202602-2864', 'Tuition Installment', 'Installment #1 - 2026-2027 - 1st Quarter', 1250.00, 0.00, 'Cash', '2026-02-07', 'MCAFINV-20260208002334478', 25, NULL, 'Approved', 0, NULL, NULL, '', 3, NULL, NULL, '2026-02-07 09:23:36', '2026-02-07 09:23:36'),
(17, 430, 20, 30, 'RCP-202602-6223', 'Tuition Full Payment', 'Tuition Fee', 5000.00, 1000.00, 'Cash', '2026-02-07', 'MCAFINV-20260208041013725', NULL, NULL, 'Approved', 0, NULL, NULL, '', 3, NULL, NULL, '2026-02-07 13:10:22', '2026-02-07 14:20:42'),
(35, 429, 19, 30, 'RCP-202602-3491', 'Uniform', 'PE Uniform', 2000.00, 0.00, 'GCash', '2026-02-12', 'asdas8192397094203', NULL, 'uploads/payments/2026/02/Demo-Gcash_20260212124159_698dbc879b5d7.png', 'Pending', 0, NULL, NULL, '', NULL, NULL, NULL, '2026-02-12 04:41:59', '2026-02-12 04:41:59'),
(44, 432, 33, 30, 'RCP-202602-5524', 'Tuition Installment', 'Installment #1 - SY 2026-2027', 555.56, 0.00, 'Cash', '2026-02-12', NULL, NULL, NULL, 'Approved', 0, NULL, NULL, '', NULL, NULL, NULL, '2026-02-12 06:08:24', '2026-02-12 06:09:02'),
(45, 432, 33, 30, 'RCP-202602-2007', 'Tuition Installment', 'Installment #2 - SY 2026-2027', 555.56, 0.00, 'Cash', '2026-02-12', NULL, NULL, NULL, 'Pending', 0, NULL, NULL, '', NULL, NULL, NULL, '2026-02-12 06:09:12', '2026-02-12 06:09:12'),
(46, 398, 34, 30, 'RCP-202602-6942', 'Tuition Installment', 'Installment #1 - SY 2026-2027', 1250.00, 0.00, 'Cash', '2026-02-13', NULL, 125, NULL, 'Pending', 0, NULL, NULL, '', NULL, NULL, NULL, '2026-02-13 10:03:40', '2026-02-13 10:03:40');

-- --------------------------------------------------------

--
-- Table structure for table `payment_installment_penalties`
--

CREATE TABLE `payment_installment_penalties` (
  `id` int UNSIGNED NOT NULL,
  `installment_id` int UNSIGNED NOT NULL COMMENT 'References payment_plan_installments.id',
  `penalty_percentage` decimal(5,2) NOT NULL DEFAULT '5.00' COMMENT 'Penalty percentage (e.g., 5.00 for 5%)',
  `penalty_amount` decimal(10,2) NOT NULL COMMENT 'Calculated penalty amount',
  `original_amount` decimal(10,2) NOT NULL COMMENT 'Original installment amount',
  `days_overdue` int NOT NULL COMMENT 'Number of days overdue when penalty was calculated',
  `applied_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `waived` tinyint(1) DEFAULT '0' COMMENT 'If penalty was waived by admin',
  `waived_by` int UNSIGNED DEFAULT NULL COMMENT 'Admin user who waived it',
  `waived_at` timestamp NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_plans`
--

CREATE TABLE `payment_plans` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL COMMENT 'Which student this plan belongs to',
  `enrollment_id` int UNSIGNED DEFAULT NULL,
  `academic_period_id` int UNSIGNED NOT NULL COMMENT 'Which school year this plan covers (e.g., SY 2026-2027)',
  `total_tuition` decimal(10,2) NOT NULL COMMENT 'Total annual tuition amount',
  `total_paid` decimal(10,2) DEFAULT '0.00' COMMENT 'Sum of all payments received',
  `balance` decimal(10,2) NOT NULL COMMENT 'Remaining amount to be paid',
  `schedule_type` enum('Monthly','Quarterly','Semestral','Tri Semestral') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Quarterly' COMMENT 'Payment schedule chosen',
  `number_of_installments` int DEFAULT '4' COMMENT '10=monthly, 4=quarterly, 2=semestral, 3=tri semestral',
  `template_id` int UNSIGNED DEFAULT NULL COMMENT 'References payment_schedule_templates',
  `status` enum('Active','Completed','Overdue','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Special arrangements, payment terms, etc.',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Annual tuition payment plans per student per school year';

--
-- Dumping data for table `payment_plans`
--

INSERT INTO `payment_plans` (`id`, `student_id`, `enrollment_id`, `academic_period_id`, `total_tuition`, `total_paid`, `balance`, `schedule_type`, `number_of_installments`, `template_id`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(9, 429, 19, 30, 5000.00, 2500.00, 2500.00, 'Quarterly', 4, NULL, 'Active', NULL, '2026-02-07 09:23:32', '2026-02-12 04:55:54'),
(27, 398, 34, 30, 5000.00, 1250.00, 3750.00, 'Quarterly', 4, NULL, 'Active', NULL, '2026-02-13 10:03:36', '2026-02-13 10:03:40'),
(31, 446, 44, 30, 17100.00, 0.00, 17100.00, 'Monthly', 10, 2, 'Active', NULL, '2026-02-19 04:50:47', '2026-02-19 04:50:47');

-- --------------------------------------------------------

--
-- Table structure for table `payment_schedule_installment_templates`
--

CREATE TABLE `payment_schedule_installment_templates` (
  `id` int UNSIGNED NOT NULL,
  `template_id` int UNSIGNED NOT NULL,
  `installment_number` int NOT NULL,
  `month` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Month number 01-12, NULL for Upon Enrollment',
  `week_of_month` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Upon Enrollment, 1st week, 2nd week, 3rd week, 4th week, Last week',
  `label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Display text: e.g., "January - 2nd week"'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_schedule_installment_templates`
--

INSERT INTO `payment_schedule_installment_templates` (`id`, `template_id`, `installment_number`, `month`, `week_of_month`, `label`) VALUES
(1, 1, 1, NULL, 'Upon Enrollment', 'Upon Enrollment'),
(2, 1, 2, '01', '2nd week', 'January - 2nd week'),
(3, 2, 1, NULL, 'Upon Enrollment', 'Upon Enrollment'),
(4, 2, 2, '08', '2nd week', 'August - 2nd week'),
(5, 2, 3, '09', '2nd week', 'September - 2nd week'),
(6, 2, 4, '10', '2nd week', 'October - 2nd week'),
(7, 2, 5, '11', '2nd week', 'November - 2nd week'),
(8, 2, 6, '12', '2nd week', 'December - 2nd week'),
(9, 2, 7, '01', '2nd week', 'January - 2nd week'),
(10, 2, 8, '02', '2nd week', 'February - 2nd week'),
(11, 2, 9, '03', '1st week', 'March - 1st week'),
(12, 2, 10, '04', '2nd week', 'April - 2nd week'),
(13, 3, 1, NULL, 'Upon Enrollment', 'Upon Enrollment'),
(14, 3, 2, '09', '2nd week', 'September - 2nd week'),
(15, 3, 3, '12', '2nd week', 'December - 2nd week'),
(16, 3, 4, '03', '2nd week', 'March - 2nd week');

-- --------------------------------------------------------

--
-- Table structure for table `payment_schedule_templates`
--

CREATE TABLE `payment_schedule_templates` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `schedule_type` enum('Monthly','Quarterly','Semestral','Tri Semestral') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_of_installments` int NOT NULL,
  `is_default` tinyint(1) DEFAULT '0' COMMENT 'Deprecated - use status instead',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Deprecated - use status instead',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_schedule_templates`
--

INSERT INTO `payment_schedule_templates` (`id`, `name`, `description`, `schedule_type`, `number_of_installments`, `is_default`, `is_active`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Semestral Plan', 'Two installment payment plan for the academic year.', 'Semestral', 2, 0, 1, 'active', '2026-02-19 11:28:10', '2026-02-19 11:28:10'),
(2, 'Monthly Plan', 'Standard monthly plan for the academic year.', 'Monthly', 10, 0, 1, 'active', '2026-02-19 11:29:50', '2026-02-19 11:29:50'),
(3, 'Quarterly Plan', 'Four installment payment plan for the academic year.', 'Quarterly', 4, 0, 1, 'active', '2026-02-19 11:31:04', '2026-02-19 11:31:04');

-- --------------------------------------------------------

--
-- Table structure for table `school_fees`
--

CREATE TABLE `school_fees` (
  `id` int UNSIGNED NOT NULL,
  `year_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NULL=all grades, specific value matches students.year_level',
  `fee_type` enum('Tuition','Miscellaneous','Contribution','Event Fee','Book','Uniform','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Fee type - removed Enrollment Fee as not needed',
  `fee_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Display name: Christmas Party, Field Trip, Lab Materials, etc.',
  `amount` decimal(10,2) NOT NULL,
  `is_required` tinyint(1) DEFAULT '0' COMMENT '1=mandatory, 0=optional',
  `due_date` date DEFAULT NULL COMMENT 'When this fee should be paid (optional)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Set to 0 to archive old fees',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Fee catalog: defines all possible fees per academic period and grade level';

--
-- Dumping data for table `school_fees`
--

INSERT INTO `school_fees` (`id`, `year_level`, `fee_type`, `fee_name`, `amount`, `is_required`, `due_date`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
(18, NULL, 'Other', 'Service Fee', 1500.00, 1, NULL, 1, NULL, '2026-02-05 10:45:03', '2026-02-07 21:37:52'),
(19, NULL, 'Uniform', 'PE Uniform', 2000.00, 1, NULL, 1, NULL, '2026-02-09 11:01:55', '2026-02-09 11:01:55'),
(21, 'Nursery 2', 'Tuition', 'Tuition Package - Nursery 1, Nursery 2, Kinder', 16500.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 15:53:33', '2026-02-19 00:39:27'),
(22, 'Kinder', 'Tuition', 'Tuition Package - Nursery 1, Nursery 2, Kinder', 16500.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 15:53:33', '2026-02-19 00:39:27'),
(23, 'Grade 1', 'Tuition', 'Tuition Package - Grade 3, Grade 2, Grade 1', 17000.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 15:54:48', '2026-02-18 18:11:48'),
(24, 'Grade 2', 'Tuition', 'Tuition Package - Grade 3, Grade 2, Grade 1', 17000.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 15:54:48', '2026-02-18 18:11:48'),
(25, 'Grade 3', 'Tuition', 'Tuition Package - Grade 3, Grade 2, Grade 1', 17000.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 15:54:48', '2026-02-18 18:11:48'),
(26, 'Grade 4', 'Tuition', 'Tuition Package - Grade 4, Grade 5, Grade 6', 17100.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 16:19:47', '2026-02-18 18:08:32'),
(27, 'Grade 5', 'Tuition', 'Tuition Package - Grade 4, Grade 5, Grade 6', 17100.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 16:19:47', '2026-02-18 18:08:32'),
(28, 'Grade 6', 'Tuition', 'Tuition Package - Grade 4, Grade 5, Grade 6', 17100.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 16:19:47', '2026-02-18 18:08:32'),
(29, 'Nursery 1', 'Tuition', 'Tuition Package - Nursery 1, Nursery 2, Kinder', 16500.00, 1, NULL, 1, 'Tuition package total from tuition_packages', '2026-02-18 18:14:01', '2026-02-19 00:39:27'),
(30, 'Nursery 1', 'Book', 'Text Book N1', 4000.00, 1, NULL, 1, NULL, '2026-02-18 18:15:14', '2026-02-18 19:23:54'),
(31, 'Nursery 2', 'Book', 'Text Book N2-G2', 4200.00, 1, NULL, 1, NULL, '2026-02-18 18:16:00', '2026-02-18 19:23:38'),
(32, 'Kinder', 'Book', 'Text Book N2-G2', 4200.00, 1, NULL, 1, NULL, '2026-02-18 18:16:00', '2026-02-18 19:23:38'),
(33, 'Grade 1', 'Book', 'Text Book N2-G2', 4200.00, 1, NULL, 1, NULL, '2026-02-18 18:16:00', '2026-02-18 19:23:38'),
(34, 'Grade 2', 'Book', 'Text Book N2-G2', 4200.00, 1, NULL, 1, NULL, '2026-02-18 18:16:00', '2026-02-18 19:23:38'),
(35, 'Grade 3', 'Book', 'Text Book G3', 5100.00, 1, NULL, 1, NULL, '2026-02-18 18:16:35', '2026-02-18 19:23:25'),
(36, 'Grade 4', 'Book', 'Text Book G4-G6', 5700.00, 1, NULL, 1, NULL, '2026-02-18 18:17:08', '2026-02-18 19:23:13'),
(37, 'Grade 5', 'Book', 'Text Book G4-G6', 5700.00, 1, NULL, 1, NULL, '2026-02-18 18:17:08', '2026-02-18 19:23:13'),
(38, 'Grade 6', 'Book', 'Text Book G4-G6', 5700.00, 1, NULL, 1, NULL, '2026-02-18 18:17:08', '2026-02-18 19:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(7, 'Makabansa', 'Section for Nursery 1 students of Maranatha Christian Academy', 'active', '2026-01-17 09:22:38', '2026-01-17 17:32:46'),
(8, 'Matatag', 'Section for Nursery 2 students of Maranatha Christian Academy', 'active', '2026-01-17 09:22:48', '2026-01-17 09:22:48'),
(9, 'Mabait', 'Section for Kinder students of Maranatha Christian Academy', 'active', '2026-01-17 09:34:13', '2026-01-17 09:34:13'),
(10, 'Magalang', 'Section for Grade 1 students of Maranatha Christian Academy', 'active', '2026-01-17 10:27:28', '2026-01-17 10:27:28'),
(11, 'Mapagmahal', 'Section for Grade 2 students of Maranatha Christian Academy', 'active', '2026-01-17 10:27:37', '2026-01-17 10:27:37'),
(12, 'Masikap', 'Section for Grade 3 students of Maranatha Christian Academy', 'active', '2026-01-17 10:28:00', '2026-01-17 10:28:00'),
(13, 'Matiyaga', 'Section for Grade 4 students of Maranatha Christian Academy', 'active', '2026-01-17 10:28:08', '2026-01-17 10:28:08'),
(14, 'Mapagkalinga', 'Section for Grade 5 students of Maranatha Christian Academy', 'active', '2026-01-17 10:28:18', '2026-01-17 10:28:18'),
(15, 'Marangal', 'Section for Grade 6 students of Maranatha Christian Academy', 'active', '2026-01-17 10:28:26', '2026-01-17 10:28:26');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED DEFAULT NULL,
  `student_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `year_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_id` int UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `enrollment_date` date DEFAULT NULL,
  `enrollment_id` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `student_id`, `year_level`, `section_id`, `status`, `created_at`, `updated_at`, `enrollment_date`, `enrollment_id`) VALUES
(29, 46, 'MCAF2025-0001', NULL, NULL, 'active', '2025-11-10 01:47:05', '2026-02-06 06:25:56', NULL, NULL),
(30, 47, 'MCAF2025-0002', 'Grade 4', 13, 'active', '2025-11-10 01:47:14', '2026-02-06 06:25:56', NULL, NULL),
(31, 48, 'MCAF2025-0003', 'Nursery 1', 7, 'active', '2025-11-10 01:47:22', '2026-02-06 06:25:56', NULL, NULL),
(32, 49, 'MCAF2025-0004', 'Grade 3', 12, 'active', '2025-11-10 01:47:32', '2026-02-06 06:25:56', NULL, NULL),
(33, 50, 'MCAF2025-0005', 'Grade 4', 13, 'active', '2025-11-10 01:47:40', '2026-02-06 06:25:56', NULL, NULL),
(34, 51, 'MCAF2025-0006', 'Grade 5', 14, 'active', '2025-11-10 02:21:56', '2026-02-06 06:25:56', NULL, NULL),
(36, 53, 'MCAF2025-0007', NULL, NULL, 'active', '2025-11-10 02:46:50', '2026-02-06 06:25:56', NULL, NULL),
(37, 54, 'MCAF2025-0008', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-02-06 06:25:56', NULL, NULL),
(38, 55, 'MCAF2025-0009', 'Grade 6', 15, 'active', '2025-11-10 12:04:08', '2026-02-06 06:25:56', NULL, NULL),
(39, 56, 'MCAF2025-0010', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-02-06 06:25:56', NULL, NULL),
(40, 57, 'MCAF2025-0011', 'Nursery 1', 7, 'active', '2025-11-10 12:04:08', '2026-02-06 06:25:56', NULL, NULL),
(41, 58, 'MCAF2025-0012', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-02-06 06:25:56', NULL, NULL),
(42, 59, 'MCAF2025-0013', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-02-06 06:25:56', NULL, NULL),
(43, 60, 'MCAF2025-0014', 'Nursery 1', 7, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(44, 61, 'MCAF2025-0015', 'Nursery 1', 7, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(45, 62, 'MCAF2025-0016', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(46, 63, 'MCAF2025-0017', 'Grade 6', 15, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(47, 64, 'MCAF2025-0018', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(48, 65, 'MCAF2025-0019', 'Nursery 2', 8, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(49, 66, 'MCAF2025-0020', 'Nursery 2', 8, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(50, 67, 'MCAF2025-0021', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(51, 68, 'MCAF2025-0022', 'Grade 3', 12, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(52, 69, 'MCAF2025-0023', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(53, 70, 'MCAF2025-0024', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-02-06 06:25:56', NULL, NULL),
(54, 71, 'MCAF2025-0025', 'Nursery 1', 7, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(55, 72, 'MCAF2025-0026', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(56, 73, 'MCAF2025-0027', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(57, 74, 'MCAF2025-0028', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(58, 75, 'MCAF2025-0029', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(59, 76, 'MCAF2025-0030', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(60, 77, 'MCAF2025-0031', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(61, 78, 'MCAF2025-0032', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(62, 79, 'MCAF2025-0033', 'Grade 3', 12, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(63, 80, 'MCAF2025-0034', 'Grade 4', 13, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(64, 81, 'MCAF2025-0035', 'Grade 6', 15, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(65, 82, 'MCAF2025-0036', 'Grade 4', 13, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(66, 83, 'MCAF2025-0037', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(67, 84, 'MCAF2025-0038', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(68, 85, 'MCAF2025-0039', 'Grade 6', 15, 'active', '2025-11-10 12:15:40', '2026-02-06 06:25:56', NULL, NULL),
(69, 86, 'MCAF2025-0040', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(70, 87, 'MCAF2025-0041', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(71, 88, 'MCAF2025-0042', 'Nursery 2', 8, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(72, 89, 'MCAF2025-0043', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(73, 90, 'MCAF2025-0044', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(74, 91, 'MCAF2025-0045', 'Nursery 1', 7, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(75, 92, 'MCAF2025-0046', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(76, 93, 'MCAF2025-0047', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(77, 94, 'MCAF2025-0048', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(78, 95, 'MCAF2025-0049', 'Grade 3', 12, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(79, 96, 'MCAF2025-0050', 'Grade 3', 12, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(80, 97, 'MCAF2025-0051', 'Grade 3', 12, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(81, 98, 'MCAF2025-0052', 'Grade 5', 14, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(82, 99, 'MCAF2025-0053', 'Grade 2', 11, 'active', '2025-11-10 12:15:41', '2026-02-06 06:25:56', NULL, NULL),
(83, 100, 'MCAF2025-0054', 'Grade 1', 10, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(84, 101, 'MCAF2025-0055', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(85, 102, 'MCAF2025-0056', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(86, 103, 'MCAF2025-0057', 'Grade 4', 13, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(87, 104, 'MCAF2025-0058', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(88, 105, 'MCAF2025-0059', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(89, 106, 'MCAF2025-0060', 'Grade 3', 12, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(90, 107, 'MCAF2025-0061', 'Grade 3', 12, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(91, 108, 'MCAF2025-0062', 'Grade 5', 14, 'active', '2025-11-10 12:15:42', '2026-02-06 06:25:56', NULL, NULL),
(92, 109, 'MCAF2025-0063', 'Nursery 2', 7, 'active', '2025-11-10 12:15:42', '2026-02-09 05:11:19', '2026-02-09', NULL),
(93, 110, 'MCAF2025-0064', 'Grade 2', 10, 'active', '2025-11-10 12:30:35', '2026-02-09 05:25:10', '2026-02-09', NULL),
(94, 111, 'MCAF2025-0065', NULL, NULL, 'active', '2025-11-10 12:30:35', '2026-02-06 06:25:56', NULL, NULL),
(95, 112, 'MCAF2025-0066', 'Grade 2', 11, 'active', '2025-11-10 12:30:35', '2026-02-06 06:25:56', NULL, NULL),
(96, 113, 'MCAF2025-0067', NULL, NULL, 'active', '2025-11-10 12:30:35', '2026-02-06 06:25:56', NULL, NULL),
(97, 114, 'MCAF2025-0068', 'Grade 5', 14, 'active', '2025-11-10 12:30:35', '2026-02-06 06:25:56', NULL, NULL),
(98, 115, 'MCAF2025-0069', 'Grade 4', 13, 'active', '2025-11-10 12:30:35', '2026-02-06 06:25:56', NULL, NULL),
(99, 116, 'MCAF2025-0070', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(100, 117, 'MCAF2025-0071', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(101, 118, 'MCAF2025-0072', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(102, 119, 'MCAF2025-0073', 'Grade 6', 15, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(103, 120, 'MCAF2025-0074', 'Nursery 1', 7, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(104, 121, 'MCAF2025-0075', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(105, 122, 'MCAF2025-0076', 'Grade 2', 11, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(106, 123, 'MCAF2025-0077', 'Grade 4', 13, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(107, 124, 'MCAF2025-0078', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(108, 125, 'MCAF2025-0079', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(109, 126, 'MCAF2025-0080', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(110, 127, 'MCAF2025-0081', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(111, 128, 'MCAF2025-0082', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-02-06 06:25:56', NULL, NULL),
(112, 129, 'MCAF2025-0083', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(113, 130, 'MCAF2025-0084', 'Grade 3', 12, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(114, 131, 'MCAF2025-0085', 'Grade 4', 13, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(115, 132, 'MCAF2025-0086', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(116, 133, 'MCAF2025-0087', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(117, 134, 'MCAF2025-0088', 'Grade 5', 14, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(118, 135, 'MCAF2025-0089', 'Grade 1', 10, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(119, 136, 'MCAF2025-0090', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(120, 137, 'MCAF2025-0091', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(121, 138, 'MCAF2025-0092', 'Grade 3', 12, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(122, 139, 'MCAF2025-0093', 'Grade 6', 15, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(123, 140, 'MCAF2025-0094', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(124, 141, 'MCAF2025-0095', 'Nursery 1', 7, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(125, 142, 'MCAF2025-0096', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-02-06 06:25:56', NULL, NULL),
(126, 143, 'MCAF2025-0097', 'Grade 5', 14, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(127, 144, 'MCAF2025-0098', 'Grade 2', 11, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(128, 145, 'MCAF2025-0099', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(129, 146, 'MCAF2025-0100', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(130, 147, 'MCAF2025-0101', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(131, 148, 'MCAF2025-0102', 'Kinder', 9, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(132, 149, 'MCAF2025-0103', 'Grade 4', 13, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(133, 150, 'MCAF2025-0104', 'Kinder', 9, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(134, 151, 'MCAF2025-0105', 'Nursery 1', 7, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(135, 152, 'MCAF2025-0106', 'Grade 6', 15, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(136, 153, 'MCAF2025-0107', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(137, 154, 'MCAF2025-0108', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(138, 155, 'MCAF2025-0109', 'Nursery 1', 7, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(139, 156, 'MCAF2025-0110', 'Grade 3', 12, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(140, 157, 'MCAF2025-0111', 'Grade 6', 15, 'active', '2025-11-10 12:30:38', '2026-02-06 06:25:56', NULL, NULL),
(141, 158, 'MCAF2025-0112', 'Nursery 2', 8, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(142, 159, 'MCAF2025-0113', 'Kinder', 9, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(143, 160, 'MCAF2025-0114', 'Grade 4', 13, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(144, 161, 'MCAF2025-0115', 'Grade 6', 15, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(145, 162, 'MCAF2025-0116', 'Grade 2', 11, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(146, 163, 'MCAF2025-0117', 'Kinder', 9, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(147, 164, 'MCAF2025-0118', 'Nursery 1', 7, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(148, 165, 'MCAF2025-0119', 'Grade 2', 11, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(149, 166, 'MCAF2025-0120', 'Nursery 1', 7, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(150, 167, 'MCAF2025-0121', NULL, NULL, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(151, 168, 'MCAF2025-0122', NULL, NULL, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(152, 169, 'MCAF2025-0123', 'Grade 4', 13, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(153, 170, 'MCAF2025-0124', NULL, NULL, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(154, 171, 'MCAF2025-0125', 'Nursery 1', 7, 'active', '2025-11-10 12:30:39', '2026-02-06 06:25:56', NULL, NULL),
(155, 172, 'MCAF2025-0126', 'Kinder', 9, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(156, 173, 'MCAF2025-0127', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(157, 174, 'MCAF2025-0128', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(158, 175, 'MCAF2025-0129', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(159, 176, 'MCAF2025-0130', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(160, 177, 'MCAF2025-0131', 'Grade 5', 14, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(161, 178, 'MCAF2025-0132', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(162, 179, 'MCAF2025-0133', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(163, 180, 'MCAF2025-0134', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(164, 181, 'MCAF2025-0135', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(165, 182, 'MCAF2025-0136', 'Grade 5', 14, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(166, 183, 'MCAF2025-0137', 'Grade 1', 10, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(167, 184, 'MCAF2025-0138', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(168, 185, 'MCAF2025-0139', 'Nursery 2', 8, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(169, 186, 'MCAF2025-0140', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-02-06 06:25:56', NULL, NULL),
(170, 187, 'MCAF2025-0141', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(171, 188, 'MCAF2025-0142', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(172, 189, 'MCAF2025-0143', 'Grade 1', 10, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(173, 190, 'MCAF2025-0144', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(174, 191, 'MCAF2025-0145', 'Nursery 1', 7, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(175, 192, 'MCAF2025-0146', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(176, 193, 'MCAF2025-0147', 'Grade 5', 14, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(177, 194, 'MCAF2025-0148', 'Nursery 1', 7, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(178, 195, 'MCAF2025-0149', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(179, 196, 'MCAF2025-0150', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(180, 197, 'MCAF2025-0151', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(181, 198, 'MCAF2025-0152', 'Grade 5', 14, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(182, 199, 'MCAF2025-0153', 'Grade 4', 13, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(183, 200, 'MCAF2025-0154', 'Grade 5', 14, 'active', '2025-11-10 12:30:41', '2026-02-06 06:25:56', NULL, NULL),
(184, 201, 'MCAF2025-0155', 'Grade 5', 14, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(185, 202, 'MCAF2025-0156', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(186, 203, 'MCAF2025-0157', 'Grade 6', 15, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(187, 204, 'MCAF2025-0158', 'Grade 5', 14, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(188, 205, 'MCAF2025-0159', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(189, 206, 'MCAF2025-0160', 'Grade 4', 13, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(190, 207, 'MCAF2025-0161', 'Grade 6', 15, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(191, 208, 'MCAF2025-0162', 'Grade 5', 14, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(192, 209, 'MCAF2025-0163', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(193, 210, 'MCAF2025-0164', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(194, 211, 'MCAF2025-0165', 'Grade 6', 15, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(195, 212, 'MCAF2025-0166', 'Nursery 2', 8, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(196, 213, 'MCAF2025-0167', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(197, 214, 'MCAF2025-0168', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(198, 215, 'MCAF2025-0169', 'Kinder', 9, 'active', '2025-11-10 12:30:42', '2026-02-06 06:25:56', NULL, NULL),
(199, 216, 'MCAF2025-0170', 'Grade 3', 12, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(200, 217, 'MCAF2025-0171', 'Grade 4', 13, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(201, 218, 'MCAF2025-0172', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(202, 219, 'MCAF2025-0173', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(203, 220, 'MCAF2025-0174', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(204, 221, 'MCAF2025-0175', 'Grade 1', 10, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(205, 222, 'MCAF2025-0176', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(206, 223, 'MCAF2025-0177', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(207, 224, 'MCAF2025-0178', 'Kinder', 9, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(208, 225, 'MCAF2025-0179', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(209, 226, 'MCAF2025-0180', 'Grade 6', 15, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(210, 227, 'MCAF2025-0181', 'Kinder', 9, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(211, 228, 'MCAF2025-0182', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(212, 229, 'MCAF2025-0183', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-02-06 06:25:56', NULL, NULL),
(213, 230, 'MCAF2025-0184', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(214, 231, 'MCAF2025-0185', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(215, 232, 'MCAF2025-0186', 'Grade 6', 15, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(216, 233, 'MCAF2025-0187', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(217, 234, 'MCAF2025-0188', 'Grade 1', 10, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(218, 235, 'MCAF2025-0189', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(219, 236, 'MCAF2025-0190', 'Grade 1', 10, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(220, 237, 'MCAF2025-0191', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(221, 238, 'MCAF2025-0192', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(222, 239, 'MCAF2025-0193', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(223, 240, 'MCAF2025-0194', 'Grade 1', 10, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(224, 241, 'MCAF2025-0195', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(225, 242, 'MCAF2025-0196', 'Nursery 2', 8, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(226, 243, 'MCAF2025-0197', 'Grade 3', 12, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(227, 244, 'MCAF2025-0198', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-02-06 06:25:56', NULL, NULL),
(228, 245, 'MCAF2025-0199', 'Grade 3', 12, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(229, 246, 'MCAF2025-0200', 'Grade 6', 15, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(230, 247, 'MCAF2025-0201', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(231, 248, 'MCAF2025-0202', 'Grade 6', 15, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(232, 249, 'MCAF2025-0203', 'Grade 2', 11, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(233, 250, 'MCAF2025-0204', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(234, 251, 'MCAF2025-0205', 'Grade 4', 13, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(235, 252, 'MCAF2025-0206', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(236, 253, 'MCAF2025-0207', 'Grade 5', 14, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(237, 254, 'MCAF2025-0208', 'Grade 1', 10, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(238, 255, 'MCAF2025-0209', 'Grade 1', 10, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(239, 256, 'MCAF2025-0210', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(240, 257, 'MCAF2025-0211', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(241, 258, 'MCAF2025-0212', 'Grade 6', 15, 'active', '2025-11-10 12:30:45', '2026-02-06 06:25:56', NULL, NULL),
(242, 259, 'MCAF2025-0213', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(243, 260, 'MCAF2025-0214', 'Grade 3', 12, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(244, 261, 'MCAF2025-0215', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(245, 262, 'MCAF2025-0216', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(246, 263, 'MCAF2025-0217', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(247, 264, 'MCAF2025-0218', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(248, 265, 'MCAF2025-0219', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(249, 266, 'MCAF2025-0220', 'Nursery 1', 7, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(250, 267, 'MCAF2025-0221', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(251, 268, 'MCAF2025-0222', 'Nursery 1', 7, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(252, 269, 'MCAF2025-0223', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(253, 270, 'MCAF2025-0224', 'Grade 5', 14, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(254, 271, 'MCAF2025-0225', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(255, 272, 'MCAF2025-0226', 'Nursery 1', 7, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(256, 273, 'MCAF2025-0227', 'Grade 3', 12, 'active', '2025-11-10 12:30:46', '2026-02-06 06:25:56', NULL, NULL),
(257, 274, 'MCAF2025-0228', 'Nursery 1', 7, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(258, 275, 'MCAF2025-0229', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(259, 276, 'MCAF2025-0230', NULL, NULL, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(260, 277, 'MCAF2025-0231', 'Grade 3', 12, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(261, 278, 'MCAF2025-0232', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(262, 279, 'MCAF2025-0233', NULL, NULL, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(263, 280, 'MCAF2025-0234', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(264, 281, 'MCAF2025-0235', 'Kinder', 9, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(265, 282, 'MCAF2025-0236', 'Grade 2', 11, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(266, 283, 'MCAF2025-0237', 'Grade 4', 13, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(267, 284, 'MCAF2025-0238', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(268, 285, 'MCAF2025-0239', NULL, NULL, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(269, 286, 'MCAF2025-0240', 'Grade 2', 11, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(270, 287, 'MCAF2025-0241', 'Grade 4', 13, 'active', '2025-11-10 12:30:47', '2026-02-06 06:25:56', NULL, NULL),
(271, 288, 'MCAF2025-0242', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(272, 289, 'MCAF2025-0243', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(273, 290, 'MCAF2025-0244', 'Nursery 1', 7, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(274, 291, 'MCAF2025-0245', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(275, 292, 'MCAF2025-0246', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(276, 293, 'MCAF2025-0247', 'Grade 6', 15, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(277, 294, 'MCAF2025-0248', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(278, 295, 'MCAF2025-0249', 'Nursery 2', 8, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(279, 296, 'MCAF2025-0250', 'Grade 2', 11, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(280, 297, 'MCAF2025-0251', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(281, 298, 'MCAF2025-0252', 'Nursery 2', 8, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(282, 299, 'MCAF2025-0253', 'Grade 2', 11, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(283, 300, 'MCAF2025-0254', 'Grade 3', 12, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(284, 301, 'MCAF2025-0255', 'Kinder', 9, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(285, 302, 'MCAF2025-0256', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-02-06 06:25:56', NULL, NULL),
(286, 303, 'MCAF2025-0257', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(287, 304, 'MCAF2025-0258', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(288, 305, 'MCAF2025-0259', 'Grade 2', 11, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(289, 306, 'MCAF2025-0260', 'Grade 6', 15, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(290, 307, 'MCAF2025-0261', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(291, 308, 'MCAF2025-0262', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(292, 309, 'MCAF2025-0263', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(293, 310, 'MCAF2025-0264', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(294, 311, 'MCAF2025-0265', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(295, 312, 'MCAF2025-0266', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(296, 313, 'MCAF2025-0267', 'Grade 2', 11, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(297, 314, 'MCAF2025-0268', 'Nursery 1', 7, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(298, 315, 'MCAF2025-0269', 'Nursery 2', 8, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(299, 316, 'MCAF2025-0270', 'Kinder', 9, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(300, 317, 'MCAF2025-0271', 'Nursery 2', 8, 'active', '2025-11-10 12:30:49', '2026-02-06 06:25:56', NULL, NULL),
(301, 318, 'MCAF2025-0272', 'Grade 6', 15, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(302, 319, 'MCAF2025-0273', 'Grade 4', 13, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(303, 320, 'MCAF2025-0274', 'Kinder', 9, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(304, 321, 'MCAF2025-0275', 'Grade 4', 13, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(305, 322, 'MCAF2025-0276', 'Grade 6', 15, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(306, 323, 'MCAF2025-0277', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(307, 324, 'MCAF2025-0278', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(308, 325, 'MCAF2025-0279', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(309, 326, 'MCAF2025-0280', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(310, 327, 'MCAF2025-0281', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(311, 328, 'MCAF2025-0282', 'Nursery 2', 8, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(312, 329, 'MCAF2025-0283', 'Nursery 1', 7, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(313, 330, 'MCAF2025-0284', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(314, 331, 'MCAF2025-0285', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-02-06 06:25:56', NULL, NULL),
(315, 332, 'MCAF2025-0286', 'Nursery 2', 8, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(316, 333, 'MCAF2025-0287', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(317, 334, 'MCAF2025-0288', 'Grade 5', 14, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(318, 335, 'MCAF2025-0289', 'Kinder', 9, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(319, 336, 'MCAF2025-0290', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(320, 337, 'MCAF2025-0291', 'Grade 4', 13, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(321, 338, 'MCAF2025-0292', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(322, 339, 'MCAF2025-0293', 'Grade 1', 10, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(323, 340, 'MCAF2025-0294', 'Grade 4', 13, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(324, 341, 'MCAF2025-0295', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(325, 342, 'MCAF2025-0296', 'Grade 1', 10, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(326, 343, 'MCAF2025-0297', 'Grade 4', 13, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(327, 344, 'MCAF2025-0298', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(328, 345, 'MCAF2025-0299', 'Kinder', 9, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(329, 346, 'MCAF2025-0300', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-02-06 06:25:56', NULL, NULL),
(330, 347, 'MCAF2025-0301', 'Grade 3', 12, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(331, 348, 'MCAF2025-0302', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(332, 349, 'MCAF2025-0303', 'Grade 6', 15, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(333, 350, 'MCAF2025-0304', 'Nursery 1', 7, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(334, 351, 'MCAF2025-0305', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(335, 352, 'MCAF2025-0306', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(336, 353, 'MCAF2025-0307', 'Nursery 2', 8, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(337, 354, 'MCAF2025-0308', 'Grade 1', 10, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(338, 355, 'MCAF2025-0309', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(339, 356, 'MCAF2025-0310', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(340, 357, 'MCAF2025-0311', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(341, 358, 'MCAF2025-0312', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(342, 359, 'MCAF2025-0313', 'Nursery 2', 8, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(343, 360, 'MCAF2025-0314', 'Nursery 1', 7, 'active', '2025-11-10 12:30:52', '2026-02-06 06:25:56', NULL, NULL),
(344, 361, 'MCAF2025-0315', 'Grade 4', 13, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(345, 362, 'MCAF2025-0316', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(346, 363, 'MCAF2025-0317', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(347, 364, 'MCAF2025-0318', 'Grade 5', 14, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(348, 365, 'MCAF2025-0319', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(349, 366, 'MCAF2025-0320', 'Grade 6', 15, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(350, 367, 'MCAF2025-0321', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(351, 368, 'MCAF2025-0322', 'Nursery 2', 8, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(352, 369, 'MCAF2025-0323', 'Grade 1', 10, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(353, 370, 'MCAF2025-0324', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(354, 371, 'MCAF2025-0325', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(355, 372, 'MCAF2025-0326', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(356, 373, 'MCAF2025-0327', 'Grade 3', 12, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(357, 374, 'MCAF2025-0328', 'Grade 1', 10, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(358, 375, 'MCAF2025-0329', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-02-06 06:25:56', NULL, NULL),
(359, 376, 'MCAF2025-0330', 'Nursery 2', 8, 'active', '2025-11-10 12:30:54', '2026-02-06 06:25:56', NULL, NULL),
(360, 377, 'MCAF2026-0003', 'Nursery 2', 7, 'active', '2026-02-09 04:52:52', '2026-02-09 04:52:52', '2026-02-09', NULL),
(361, 378, 'MCAF2025-0332', NULL, NULL, 'active', '2025-11-10 12:30:54', '2026-02-06 06:25:56', NULL, NULL),
(362, 379, 'MCAF2025-0333', 'Grade 3', 12, 'active', '2025-11-10 12:30:54', '2026-02-06 06:25:56', NULL, NULL),
(363, 380, 'MCAF2025-0334', 'Kinder', 9, 'active', '2025-11-10 12:30:54', '2026-02-06 06:25:56', NULL, NULL),
(364, 381, 'MCAF2025-0335', 'Kinder', 9, 'active', '2025-11-10 12:30:54', '2026-02-06 06:25:56', NULL, NULL),
(379, 398, 'MCAF2025-0336', 'Grade 3', 12, 'active', '2025-11-13 10:28:17', '2026-02-06 06:25:56', NULL, NULL),
(386, 405, 'MCAF2025-0337', NULL, NULL, 'active', '2025-11-13 12:16:01', '2026-02-06 06:25:56', NULL, NULL),
(389, 429, 'MCAF2026-0001', 'Grade 1', NULL, 'active', '2026-02-07 10:28:25', '2026-02-07 10:28:25', '2026-02-07', 19),
(390, 430, 'MCAF2026-0002', 'Grade 1', NULL, 'active', '2026-02-07 14:31:49', '2026-02-07 14:31:49', '2026-02-07', 20),
(414, 441, 'MCAF2026-0004', 'Grade 1', NULL, 'active', '2026-02-15 02:04:06', '2026-02-15 09:04:06', NULL, NULL),
(415, 432, 'MCAF2026-0005', 'Nursery 1', NULL, 'active', '2026-02-15 02:12:47', '2026-02-15 02:12:47', '2026-02-15', 33),
(416, 431, 'MCAF2025-0338', 'Nursery 1', NULL, 'active', '2026-02-15 02:16:40', '2026-02-15 02:16:40', '2026-02-15', 36),
(417, 443, 'MCAF2026-0006', 'Nursery 2', NULL, 'active', '2026-02-15 02:28:02', '2026-02-15 09:28:02', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `students_backup`
--

CREATE TABLE `students_backup` (
  `id` int UNSIGNED NOT NULL DEFAULT '0',
  `user_id` int UNSIGNED DEFAULT NULL,
  `student_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `year_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_id` int UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `enrollment_date` date DEFAULT NULL,
  `enrollment_id` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `students_backup`
--

INSERT INTO `students_backup` (`id`, `user_id`, `student_id`, `year_level`, `section_id`, `status`, `created_at`, `updated_at`, `enrollment_date`, `enrollment_id`) VALUES
(29, 46, 'MCC2025-00028', NULL, NULL, 'active', '2025-11-10 01:47:05', '2026-01-17 16:36:13', NULL, NULL),
(30, 47, 'MCC2025-00029', 'Grade 4', 13, 'active', '2025-11-10 01:47:14', '2026-01-17 10:32:44', NULL, NULL),
(31, 48, 'MCC2025-00030', 'Nursery 1', 7, 'active', '2025-11-10 01:47:22', '2026-01-17 10:20:12', NULL, NULL),
(32, 49, 'MCC2025-00031', 'Grade 3', 12, 'active', '2025-11-10 01:47:32', '2026-01-17 10:30:26', NULL, NULL),
(33, 50, 'MCC2025-00032', 'Grade 4', 13, 'active', '2025-11-10 01:47:40', '2026-01-17 10:32:44', NULL, NULL),
(34, 51, 'MCC2025-00033', 'Grade 5', 14, 'active', '2025-11-10 02:21:56', '2026-01-17 10:30:52', NULL, NULL),
(36, 53, 'MCC2025-00035', NULL, NULL, 'active', '2025-11-10 02:46:50', '2026-01-17 16:36:13', NULL, NULL),
(37, 54, 'MCC2025-00036', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-01-17 16:36:13', NULL, NULL),
(38, 55, 'MCC2025-00037', 'Grade 6', 15, 'active', '2025-11-10 12:04:08', '2026-01-17 10:31:03', NULL, NULL),
(39, 56, 'MCC2025-00038', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-01-17 16:36:13', NULL, NULL),
(40, 57, 'MCC2025-00039', 'Nursery 1', 7, 'active', '2025-11-10 12:04:08', '2026-01-17 10:20:11', NULL, NULL),
(41, 58, 'MCC2025-00040', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-01-17 16:36:13', NULL, NULL),
(42, 59, 'MCC2025-00041', NULL, NULL, 'active', '2025-11-10 12:04:08', '2026-01-17 16:36:13', NULL, NULL),
(43, 60, 'MCC2025-00042', 'Nursery 1', 7, 'active', '2025-11-10 12:15:39', '2026-01-17 10:20:09', NULL, NULL),
(44, 61, 'MCC2025-00043', 'Nursery 1', 7, 'active', '2025-11-10 12:15:39', '2026-01-17 10:20:11', NULL, NULL),
(45, 62, 'MCC2025-00044', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-01-17 16:36:13', NULL, NULL),
(46, 63, 'MCC2025-00045', 'Grade 6', 15, 'active', '2025-11-10 12:15:39', '2026-01-17 10:31:03', NULL, NULL),
(47, 64, 'MCC2025-00046', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-01-17 16:36:13', NULL, NULL),
(48, 65, 'MCC2025-00047', 'Nursery 2', 8, 'active', '2025-11-10 12:15:39', '2026-01-17 10:24:59', NULL, NULL),
(49, 66, 'MCC2025-00048', 'Nursery 2', 8, 'active', '2025-11-10 12:15:39', '2026-01-17 10:24:59', NULL, NULL),
(50, 67, 'MCC2025-00049', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-01-17 16:36:13', NULL, NULL),
(51, 68, 'MCC2025-00050', 'Grade 3', 12, 'active', '2025-11-10 12:15:39', '2026-01-17 10:30:26', NULL, NULL),
(52, 69, 'MCC2025-00051', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-01-17 16:36:13', NULL, NULL),
(53, 70, 'MCC2025-00052', NULL, NULL, 'active', '2025-11-10 12:15:39', '2026-01-17 16:36:13', NULL, NULL),
(54, 71, 'MCC2025-00053', 'Nursery 1', 7, 'active', '2025-11-10 12:15:40', '2026-01-17 10:20:09', NULL, NULL),
(55, 72, 'MCC2025-00054', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(56, 73, 'MCC2025-00055', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(57, 74, 'MCC2025-00056', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(58, 75, 'MCC2025-00057', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(59, 76, 'MCC2025-00058', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(60, 77, 'MCC2025-00059', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(61, 78, 'MCC2025-00060', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(62, 79, 'MCC2025-00061', 'Grade 3', 12, 'active', '2025-11-10 12:15:40', '2026-01-17 10:30:26', NULL, NULL),
(63, 80, 'MCC2025-00062', 'Grade 4', 13, 'active', '2025-11-10 12:15:40', '2026-01-17 10:32:44', NULL, NULL),
(64, 81, 'MCC2025-00063', 'Grade 6', 15, 'active', '2025-11-10 12:15:40', '2026-01-17 10:31:03', NULL, NULL),
(65, 82, 'MCC2025-00064', 'Grade 4', 13, 'active', '2025-11-10 12:15:40', '2026-01-17 10:32:44', NULL, NULL),
(66, 83, 'MCC2025-00065', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(67, 84, 'MCC2025-00066', NULL, NULL, 'active', '2025-11-10 12:15:40', '2026-01-17 16:36:13', NULL, NULL),
(68, 85, 'MCC2025-00067', 'Grade 6', 15, 'active', '2025-11-10 12:15:40', '2026-01-17 10:31:03', NULL, NULL),
(69, 86, 'MCC2025-00068', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-01-17 16:36:13', NULL, NULL),
(70, 87, 'MCC2025-00069', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-01-17 16:36:13', NULL, NULL),
(71, 88, 'MCC2025-00070', 'Nursery 2', 8, 'active', '2025-11-10 12:15:41', '2026-01-17 10:24:59', NULL, NULL),
(72, 89, 'MCC2025-00071', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-01-17 16:36:13', NULL, NULL),
(73, 90, 'MCC2025-00072', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-01-17 16:36:13', NULL, NULL),
(74, 91, 'MCC2025-00073', 'Nursery 1', 7, 'active', '2025-11-10 12:15:41', '2026-01-17 10:20:08', NULL, NULL),
(75, 92, 'MCC2025-00074', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-01-17 16:36:13', NULL, NULL),
(76, 93, 'MCC2025-00075', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-01-17 16:36:13', NULL, NULL),
(77, 94, 'MCC2025-00076', NULL, NULL, 'active', '2025-11-10 12:15:41', '2026-01-17 16:36:13', NULL, NULL),
(78, 95, 'MCC2025-00077', 'Grade 3', 12, 'active', '2025-11-10 12:15:41', '2026-01-17 10:30:25', NULL, NULL),
(79, 96, 'MCC2025-00078', 'Grade 3', 12, 'active', '2025-11-10 12:15:41', '2026-01-17 10:30:25', NULL, NULL),
(80, 97, 'MCC2025-00079', 'Grade 3', 12, 'active', '2025-11-10 12:15:41', '2026-01-17 10:29:10', NULL, NULL),
(81, 98, 'MCC2025-00080', 'Grade 5', 14, 'active', '2025-11-10 12:15:41', '2026-01-17 10:32:53', NULL, NULL),
(82, 99, 'MCC2025-00081', 'Grade 2', 11, 'active', '2025-11-10 12:15:41', '2026-01-17 10:28:58', NULL, NULL),
(83, 100, 'MCC2025-00082', 'Grade 1', 10, 'active', '2025-11-10 12:15:42', '2026-01-17 10:28:47', NULL, NULL),
(84, 101, 'MCC2025-00083', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-01-17 16:36:13', NULL, NULL),
(85, 102, 'MCC2025-00084', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-01-17 16:36:13', NULL, NULL),
(86, 103, 'MCC2025-00085', 'Grade 4', 13, 'active', '2025-11-10 12:15:42', '2026-01-17 10:32:43', NULL, NULL),
(87, 104, 'MCC2025-00086', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-01-17 16:36:13', NULL, NULL),
(88, 105, 'MCC2025-00087', NULL, NULL, 'active', '2025-11-10 12:15:42', '2026-01-17 16:36:13', NULL, NULL),
(89, 106, 'MCC2025-00088', 'Grade 3', 12, 'active', '2025-11-10 12:15:42', '2026-01-17 10:30:25', NULL, NULL),
(90, 107, 'MCC2025-00089', 'Grade 3', 12, 'active', '2025-11-10 12:15:42', '2026-01-17 10:29:10', NULL, NULL),
(91, 108, 'MCC2025-00090', 'Grade 5', 14, 'active', '2025-11-10 12:15:42', '2026-01-17 10:30:52', NULL, NULL),
(92, 109, 'MCC2025-00091', 'Nursery 1', 7, 'active', '2025-11-10 12:15:42', '2026-01-17 10:20:08', NULL, NULL),
(93, 110, 'MCC2025-00092', 'Grade 1', 10, 'active', '2025-11-10 12:30:35', '2026-02-01 00:09:48', NULL, NULL),
(94, 111, 'MCC2025-00093', NULL, NULL, 'active', '2025-11-10 12:30:35', '2026-01-17 16:36:13', NULL, NULL),
(95, 112, 'MCC2025-00094', 'Grade 2', 11, 'active', '2025-11-10 12:30:35', '2026-01-17 10:28:58', NULL, NULL),
(96, 113, 'MCC2025-00095', NULL, NULL, 'active', '2025-11-10 12:30:35', '2026-01-17 16:36:13', NULL, NULL),
(97, 114, 'MCC2025-00096', 'Grade 5', 14, 'active', '2025-11-10 12:30:35', '2026-01-17 10:30:52', NULL, NULL),
(98, 115, 'MCC2025-00097', 'Grade 4', 13, 'active', '2025-11-10 12:30:35', '2026-01-17 10:32:43', NULL, NULL),
(99, 116, 'MCC2025-00098', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(100, 117, 'MCC2025-00099', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(101, 118, 'MCC2025-00100', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(102, 119, 'MCC2025-00101', 'Grade 6', 15, 'active', '2025-11-10 12:30:36', '2026-01-17 10:31:03', NULL, NULL),
(103, 120, 'MCC2025-00102', 'Nursery 1', 7, 'active', '2025-11-10 12:30:36', '2026-01-17 10:20:08', NULL, NULL),
(104, 121, 'MCC2025-00103', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(105, 122, 'MCC2025-00104', 'Grade 2', 11, 'active', '2025-11-10 12:30:36', '2026-01-17 10:28:58', NULL, NULL),
(106, 123, 'MCC2025-00105', 'Grade 4', 13, 'active', '2025-11-10 12:30:36', '2026-01-17 10:32:43', NULL, NULL),
(107, 124, 'MCC2025-00106', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(108, 125, 'MCC2025-00107', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(109, 126, 'MCC2025-00108', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(110, 127, 'MCC2025-00109', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(111, 128, 'MCC2025-00110', NULL, NULL, 'active', '2025-11-10 12:30:36', '2026-01-17 16:36:13', NULL, NULL),
(112, 129, 'MCC2025-00111', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-01-17 16:36:13', NULL, NULL),
(113, 130, 'MCC2025-00112', 'Grade 3', 12, 'active', '2025-11-10 12:30:37', '2026-01-17 10:30:25', NULL, NULL),
(114, 131, 'MCC2025-00113', 'Grade 4', 13, 'active', '2025-11-10 12:30:37', '2026-01-17 10:32:43', NULL, NULL),
(115, 132, 'MCC2025-00114', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-01-17 16:36:13', NULL, NULL),
(116, 133, 'MCC2025-00115', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-01-17 16:36:13', NULL, NULL),
(117, 134, 'MCC2025-00116', 'Grade 5', 14, 'active', '2025-11-10 12:30:37', '2026-01-17 10:32:52', NULL, NULL),
(118, 135, 'MCC2025-00117', 'Grade 1', 10, 'active', '2025-11-10 12:30:37', '2026-01-17 10:28:46', NULL, NULL),
(119, 136, 'MCC2025-00118', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-01-17 16:36:13', NULL, NULL),
(120, 137, 'MCC2025-00119', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-01-17 16:36:13', NULL, NULL),
(121, 138, 'MCC2025-00120', 'Grade 3', 12, 'active', '2025-11-10 12:30:37', '2026-01-17 10:30:25', NULL, NULL),
(122, 139, 'MCC2025-00121', 'Grade 6', 15, 'active', '2025-11-10 12:30:37', '2026-01-17 10:31:03', NULL, NULL),
(123, 140, 'MCC2025-00122', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-01-17 16:36:13', NULL, NULL),
(124, 141, 'MCC2025-00123', 'Nursery 1', 7, 'active', '2025-11-10 12:30:37', '2026-01-17 10:20:08', NULL, NULL),
(125, 142, 'MCC2025-00124', NULL, NULL, 'active', '2025-11-10 12:30:37', '2026-01-17 16:36:13', NULL, NULL),
(126, 143, 'MCC2025-00125', 'Grade 5', 14, 'active', '2025-11-10 12:30:38', '2026-01-17 10:32:52', NULL, NULL),
(127, 144, 'MCC2025-00126', 'Grade 2', 11, 'active', '2025-11-10 12:30:38', '2026-01-17 10:28:58', NULL, NULL),
(128, 145, 'MCC2025-00127', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-01-17 16:36:13', NULL, NULL),
(129, 146, 'MCC2025-00128', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-01-17 16:36:13', NULL, NULL),
(130, 147, 'MCC2025-00129', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-01-17 16:36:13', NULL, NULL),
(131, 148, 'MCC2025-00130', 'Kinder', 9, 'active', '2025-11-10 12:30:38', '2026-01-17 10:25:12', NULL, NULL),
(132, 149, 'MCC2025-00131', 'Grade 4', 13, 'active', '2025-11-10 12:30:38', '2026-01-17 10:32:43', NULL, NULL),
(133, 150, 'MCC2025-00132', 'Kinder', 9, 'active', '2025-11-10 12:30:38', '2026-01-17 10:25:12', NULL, NULL),
(134, 151, 'MCC2025-00133', 'Nursery 1', 7, 'active', '2025-11-10 12:30:38', '2026-01-17 10:20:07', NULL, NULL),
(135, 152, 'MCC2025-00134', 'Grade 6', 15, 'active', '2025-11-10 12:30:38', '2026-01-17 10:31:03', NULL, NULL),
(136, 153, 'MCC2025-00135', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-01-17 16:36:13', NULL, NULL),
(137, 154, 'MCC2025-00136', NULL, NULL, 'active', '2025-11-10 12:30:38', '2026-01-17 16:36:13', NULL, NULL),
(138, 155, 'MCC2025-00137', 'Nursery 1', 7, 'active', '2025-11-10 12:30:38', '2026-01-17 10:20:07', NULL, NULL),
(139, 156, 'MCC2025-00138', 'Grade 3', 12, 'active', '2025-11-10 12:30:38', '2026-01-17 10:30:25', NULL, NULL),
(140, 157, 'MCC2025-00139', 'Grade 6', 15, 'active', '2025-11-10 12:30:38', '2026-01-17 10:31:03', NULL, NULL),
(141, 158, 'MCC2025-00140', 'Nursery 2', 8, 'active', '2025-11-10 12:30:39', '2026-01-17 10:24:59', NULL, NULL),
(142, 159, 'MCC2025-00141', 'Kinder', 9, 'active', '2025-11-10 12:30:39', '2026-01-17 10:25:12', NULL, NULL),
(143, 160, 'MCC2025-00142', 'Grade 4', 13, 'active', '2025-11-10 12:30:39', '2026-01-17 10:32:43', NULL, NULL),
(144, 161, 'MCC2025-00143', 'Grade 6', 15, 'active', '2025-11-10 12:30:39', '2026-01-17 10:31:03', NULL, NULL),
(145, 162, 'MCC2025-00144', 'Grade 2', 11, 'active', '2025-11-10 12:30:39', '2026-01-17 10:28:57', NULL, NULL),
(146, 163, 'MCC2025-00145', 'Kinder', 9, 'active', '2025-11-10 12:30:39', '2026-01-17 10:25:12', NULL, NULL),
(147, 164, 'MCC2025-00146', 'Nursery 1', 7, 'active', '2025-11-10 12:30:39', '2026-01-17 10:20:06', NULL, NULL),
(148, 165, 'MCC2025-00147', 'Grade 2', 11, 'active', '2025-11-10 12:30:39', '2026-01-17 10:28:57', NULL, NULL),
(149, 166, 'MCC2025-00148', 'Nursery 1', 7, 'active', '2025-11-10 12:30:39', '2026-01-17 10:20:07', NULL, NULL),
(150, 167, 'MCC2025-00149', NULL, NULL, 'active', '2025-11-10 12:30:39', '2026-01-17 16:36:13', NULL, NULL),
(151, 168, 'MCC2025-00150', NULL, NULL, 'active', '2025-11-10 12:30:39', '2026-01-17 16:36:13', NULL, NULL),
(152, 169, 'MCC2025-00151', 'Grade 4', 13, 'active', '2025-11-10 12:30:39', '2026-01-17 10:32:43', NULL, NULL),
(153, 170, 'MCC2025-00152', NULL, NULL, 'active', '2025-11-10 12:30:39', '2026-01-17 16:36:13', NULL, NULL),
(154, 171, 'MCC2025-00153', 'Nursery 1', 7, 'active', '2025-11-10 12:30:39', '2026-01-17 10:20:07', NULL, NULL),
(155, 172, 'MCC2025-00154', 'Kinder', 9, 'active', '2025-11-10 12:30:40', '2026-01-17 10:25:12', NULL, NULL),
(156, 173, 'MCC2025-00155', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(157, 174, 'MCC2025-00156', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(158, 175, 'MCC2025-00157', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(159, 176, 'MCC2025-00158', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(160, 177, 'MCC2025-00159', 'Grade 5', 14, 'active', '2025-11-10 12:30:40', '2026-01-17 10:30:51', NULL, NULL),
(161, 178, 'MCC2025-00160', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(162, 179, 'MCC2025-00161', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(163, 180, 'MCC2025-00162', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(164, 181, 'MCC2025-00163', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(165, 182, 'MCC2025-00164', 'Grade 5', 14, 'active', '2025-11-10 12:30:40', '2026-01-17 10:32:52', NULL, NULL),
(166, 183, 'MCC2025-00165', 'Grade 1', 10, 'active', '2025-11-10 12:30:40', '2026-01-17 10:28:46', NULL, NULL),
(167, 184, 'MCC2025-00166', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(168, 185, 'MCC2025-00167', 'Nursery 2', 8, 'active', '2025-11-10 12:30:40', '2026-01-17 10:24:59', NULL, NULL),
(169, 186, 'MCC2025-00168', NULL, NULL, 'active', '2025-11-10 12:30:40', '2026-01-17 16:36:13', NULL, NULL),
(170, 187, 'MCC2025-00169', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-01-17 16:36:13', NULL, NULL),
(171, 188, 'MCC2025-00170', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-01-17 16:36:13', NULL, NULL),
(172, 189, 'MCC2025-00171', 'Grade 1', 10, 'active', '2025-11-10 12:30:41', '2026-01-17 10:28:46', NULL, NULL),
(173, 190, 'MCC2025-00172', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-01-17 16:36:13', NULL, NULL),
(174, 191, 'MCC2025-00173', 'Nursery 1', 7, 'active', '2025-11-10 12:30:41', '2026-01-17 10:20:06', NULL, NULL),
(175, 192, 'MCC2025-00174', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-01-17 16:36:13', NULL, NULL),
(176, 193, 'MCC2025-00175', 'Grade 5', 14, 'active', '2025-11-10 12:30:41', '2026-01-17 10:32:52', NULL, NULL),
(177, 194, 'MCC2025-00176', 'Nursery 1', 7, 'active', '2025-11-10 12:30:41', '2026-01-17 10:20:06', NULL, NULL),
(178, 195, 'MCC2025-00177', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-01-17 16:36:13', NULL, NULL),
(179, 196, 'MCC2025-00178', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-01-17 16:36:13', NULL, NULL),
(180, 197, 'MCC2025-00179', NULL, NULL, 'active', '2025-11-10 12:30:41', '2026-01-17 16:36:13', NULL, NULL),
(181, 198, 'MCC2025-00180', 'Grade 5', 14, 'active', '2025-11-10 12:30:41', '2026-01-17 10:30:51', NULL, NULL),
(182, 199, 'MCC2025-00181', 'Grade 4', 13, 'active', '2025-11-10 12:30:41', '2026-01-17 10:32:43', NULL, NULL),
(183, 200, 'MCC2025-00182', 'Grade 5', 14, 'active', '2025-11-10 12:30:41', '2026-01-17 10:30:51', NULL, NULL),
(184, 201, 'MCC2025-00183', 'Grade 5', 14, 'active', '2025-11-10 12:30:42', '2026-01-17 10:32:52', NULL, NULL),
(185, 202, 'MCC2025-00184', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-01-17 16:36:13', NULL, NULL),
(186, 203, 'MCC2025-00185', 'Grade 6', 15, 'active', '2025-11-10 12:30:42', '2026-01-17 10:31:02', NULL, NULL),
(187, 204, 'MCC2025-00186', 'Grade 5', 14, 'active', '2025-11-10 12:30:42', '2026-01-17 10:30:51', NULL, NULL),
(188, 205, 'MCC2025-00187', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-01-17 16:36:13', NULL, NULL),
(189, 206, 'MCC2025-00188', 'Grade 4', 13, 'active', '2025-11-10 12:30:42', '2026-01-17 10:32:43', NULL, NULL),
(190, 207, 'MCC2025-00189', 'Grade 6', 15, 'active', '2025-11-10 12:30:42', '2026-01-17 10:31:02', NULL, NULL),
(191, 208, 'MCC2025-00190', 'Grade 5', 14, 'active', '2025-11-10 12:30:42', '2026-01-17 10:32:52', NULL, NULL),
(192, 209, 'MCC2025-00191', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-01-17 16:36:13', NULL, NULL),
(193, 210, 'MCC2025-00192', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-01-17 16:36:13', NULL, NULL),
(194, 211, 'MCC2025-00193', 'Grade 6', 15, 'active', '2025-11-10 12:30:42', '2026-01-17 10:31:03', NULL, NULL),
(195, 212, 'MCC2025-00194', 'Nursery 2', 8, 'active', '2025-11-10 12:30:42', '2026-01-17 10:24:58', NULL, NULL),
(196, 213, 'MCC2025-00195', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-01-17 16:36:13', NULL, NULL),
(197, 214, 'MCC2025-00196', NULL, NULL, 'active', '2025-11-10 12:30:42', '2026-01-17 16:36:13', NULL, NULL),
(198, 215, 'MCC2025-00197', 'Kinder', 9, 'active', '2025-11-10 12:30:42', '2026-01-17 10:25:12', NULL, NULL),
(199, 216, 'MCC2025-00198', 'Grade 3', 12, 'active', '2025-11-10 12:30:43', '2026-01-17 10:29:09', NULL, NULL),
(200, 217, 'MCC2025-00199', 'Grade 4', 13, 'active', '2025-11-10 12:30:43', '2026-01-17 10:32:43', NULL, NULL),
(201, 218, 'MCC2025-00200', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(202, 219, 'MCC2025-00201', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(203, 220, 'MCC2025-00202', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(204, 221, 'MCC2025-00203', 'Grade 1', 10, 'active', '2025-11-10 12:30:43', '2026-01-17 10:28:46', NULL, NULL),
(205, 222, 'MCC2025-00204', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(206, 223, 'MCC2025-00205', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(207, 224, 'MCC2025-00206', 'Kinder', 9, 'active', '2025-11-10 12:30:43', '2026-01-17 10:25:12', NULL, NULL),
(208, 225, 'MCC2025-00207', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(209, 226, 'MCC2025-00208', 'Grade 6', 15, 'active', '2025-11-10 12:30:43', '2026-01-17 10:31:02', NULL, NULL),
(210, 227, 'MCC2025-00209', 'Kinder', 9, 'active', '2025-11-10 12:30:43', '2026-01-17 10:25:12', NULL, NULL),
(211, 228, 'MCC2025-00210', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(212, 229, 'MCC2025-00211', NULL, NULL, 'active', '2025-11-10 12:30:43', '2026-01-17 16:36:13', NULL, NULL),
(213, 230, 'MCC2025-00212', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(214, 231, 'MCC2025-00213', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(215, 232, 'MCC2025-00214', 'Grade 6', 15, 'active', '2025-11-10 12:30:44', '2026-01-17 10:31:02', NULL, NULL),
(216, 233, 'MCC2025-00215', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(217, 234, 'MCC2025-00216', 'Grade 1', 10, 'active', '2025-11-10 12:30:44', '2026-01-17 10:28:46', NULL, NULL),
(218, 235, 'MCC2025-00217', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(219, 236, 'MCC2025-00218', 'Grade 1', 10, 'active', '2025-11-10 12:30:44', '2026-01-17 10:28:46', NULL, NULL),
(220, 237, 'MCC2025-00219', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(221, 238, 'MCC2025-00220', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(222, 239, 'MCC2025-00221', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(223, 240, 'MCC2025-00222', 'Grade 1', 10, 'active', '2025-11-10 12:30:44', '2026-01-17 10:28:46', NULL, NULL),
(224, 241, 'MCC2025-00223', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(225, 242, 'MCC2025-00224', 'Nursery 2', 8, 'active', '2025-11-10 12:30:44', '2026-01-17 10:24:58', NULL, NULL),
(226, 243, 'MCC2025-00225', 'Grade 3', 12, 'active', '2025-11-10 12:30:44', '2026-01-17 10:30:25', NULL, NULL),
(227, 244, 'MCC2025-00226', NULL, NULL, 'active', '2025-11-10 12:30:44', '2026-01-17 16:36:13', NULL, NULL),
(228, 245, 'MCC2025-00227', 'Grade 3', 12, 'active', '2025-11-10 12:30:45', '2026-01-17 10:30:25', NULL, NULL),
(229, 246, 'MCC2025-00228', 'Grade 6', 15, 'active', '2025-11-10 12:30:45', '2026-01-17 10:31:02', NULL, NULL),
(230, 247, 'MCC2025-00229', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-01-17 16:36:13', NULL, NULL),
(231, 248, 'MCC2025-00230', 'Grade 6', 15, 'active', '2025-11-10 12:30:45', '2026-01-17 10:31:02', NULL, NULL),
(232, 249, 'MCC2025-00231', 'Grade 2', 11, 'active', '2025-11-10 12:30:45', '2026-01-17 10:28:57', NULL, NULL),
(233, 250, 'MCC2025-00232', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-01-17 16:36:13', NULL, NULL),
(234, 251, 'MCC2025-00233', 'Grade 4', 13, 'active', '2025-11-10 12:30:45', '2026-01-17 10:32:43', NULL, NULL),
(235, 252, 'MCC2025-00234', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-01-17 16:36:13', NULL, NULL),
(236, 253, 'MCC2025-00235', 'Grade 5', 14, 'active', '2025-11-10 12:30:45', '2026-01-17 10:30:51', NULL, NULL),
(237, 254, 'MCC2025-00236', 'Grade 1', 10, 'active', '2025-11-10 12:30:45', '2026-01-17 10:28:46', NULL, NULL),
(238, 255, 'MCC2025-00237', 'Grade 1', 10, 'active', '2025-11-10 12:30:45', '2026-01-17 10:28:46', NULL, NULL),
(239, 256, 'MCC2025-00238', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-01-17 16:36:13', NULL, NULL),
(240, 257, 'MCC2025-00239', NULL, NULL, 'active', '2025-11-10 12:30:45', '2026-01-17 16:36:13', NULL, NULL),
(241, 258, 'MCC2025-00240', 'Grade 6', 15, 'active', '2025-11-10 12:30:45', '2026-01-17 10:31:02', NULL, NULL),
(242, 259, 'MCC2025-00241', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(243, 260, 'MCC2025-00242', 'Grade 3', 12, 'active', '2025-11-10 12:30:46', '2026-01-17 10:29:09', NULL, NULL),
(244, 261, 'MCC2025-00243', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(245, 262, 'MCC2025-00244', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(246, 263, 'MCC2025-00245', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(247, 264, 'MCC2025-00246', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(248, 265, 'MCC2025-00247', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(249, 266, 'MCC2025-00248', 'Nursery 1', 7, 'active', '2025-11-10 12:30:46', '2026-01-17 10:20:05', NULL, NULL),
(250, 267, 'MCC2025-00249', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(251, 268, 'MCC2025-00250', 'Nursery 1', 7, 'active', '2025-11-10 12:30:46', '2026-01-17 10:20:05', NULL, NULL),
(252, 269, 'MCC2025-00251', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(253, 270, 'MCC2025-00252', 'Grade 5', 14, 'active', '2025-11-10 12:30:46', '2026-01-17 10:30:51', NULL, NULL),
(254, 271, 'MCC2025-00253', NULL, NULL, 'active', '2025-11-10 12:30:46', '2026-01-17 16:36:13', NULL, NULL),
(255, 272, 'MCC2025-00254', 'Nursery 1', 7, 'active', '2025-11-10 12:30:46', '2026-01-17 10:20:06', NULL, NULL),
(256, 273, 'MCC2025-00255', 'Grade 3', 12, 'active', '2025-11-10 12:30:46', '2026-01-17 10:29:09', NULL, NULL),
(257, 274, 'MCC2025-00256', 'Nursery 1', 7, 'active', '2025-11-10 12:30:47', '2026-01-17 10:20:05', NULL, NULL),
(258, 275, 'MCC2025-00257', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-01-17 10:32:52', NULL, NULL),
(259, 276, 'MCC2025-00258', NULL, NULL, 'active', '2025-11-10 12:30:47', '2026-01-17 16:36:13', NULL, NULL),
(260, 277, 'MCC2025-00259', 'Grade 3', 12, 'active', '2025-11-10 12:30:47', '2026-01-17 10:30:25', NULL, NULL),
(261, 278, 'MCC2025-00260', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-01-17 10:30:51', NULL, NULL),
(262, 279, 'MCC2025-00261', NULL, NULL, 'active', '2025-11-10 12:30:47', '2026-01-17 16:36:13', NULL, NULL),
(263, 280, 'MCC2025-00262', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-01-17 10:32:52', NULL, NULL),
(264, 281, 'MCC2025-00263', 'Kinder', 9, 'active', '2025-11-10 12:30:47', '2026-01-17 10:25:12', NULL, NULL),
(265, 282, 'MCC2025-00264', 'Grade 2', 11, 'active', '2025-11-10 12:30:47', '2026-01-17 10:28:57', NULL, NULL),
(266, 283, 'MCC2025-00265', 'Grade 4', 13, 'active', '2025-11-10 12:30:47', '2026-01-17 10:32:43', NULL, NULL),
(267, 284, 'MCC2025-00266', 'Grade 5', 14, 'active', '2025-11-10 12:30:47', '2026-01-17 10:30:51', NULL, NULL),
(268, 285, 'MCC2025-00267', NULL, NULL, 'active', '2025-11-10 12:30:47', '2026-01-17 16:36:13', NULL, NULL),
(269, 286, 'MCC2025-00268', 'Grade 2', 11, 'active', '2025-11-10 12:30:47', '2026-01-17 10:28:57', NULL, NULL),
(270, 287, 'MCC2025-00269', 'Grade 4', 13, 'active', '2025-11-10 12:30:47', '2026-01-17 10:32:43', NULL, NULL),
(271, 288, 'MCC2025-00270', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-01-17 16:36:13', NULL, NULL),
(272, 289, 'MCC2025-00271', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-01-17 16:36:13', NULL, NULL),
(273, 290, 'MCC2025-00272', 'Nursery 1', 7, 'active', '2025-11-10 12:30:48', '2026-01-17 10:20:05', NULL, NULL),
(274, 291, 'MCC2025-00273', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-01-17 16:36:13', NULL, NULL),
(275, 292, 'MCC2025-00274', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-01-17 16:36:13', NULL, NULL),
(276, 293, 'MCC2025-00275', 'Grade 6', 15, 'active', '2025-11-10 12:30:48', '2026-01-17 10:31:02', NULL, NULL),
(277, 294, 'MCC2025-00276', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-01-17 16:36:13', NULL, NULL),
(278, 295, 'MCC2025-00277', 'Nursery 2', 8, 'active', '2025-11-10 12:30:48', '2026-01-17 10:24:58', NULL, NULL),
(279, 296, 'MCC2025-00278', 'Grade 2', 11, 'active', '2025-11-10 12:30:48', '2026-01-17 10:28:57', NULL, NULL),
(280, 297, 'MCC2025-00279', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-01-17 16:36:13', NULL, NULL),
(281, 298, 'MCC2025-00280', 'Nursery 2', 8, 'active', '2025-11-10 12:30:48', '2026-01-17 10:24:58', NULL, NULL),
(282, 299, 'MCC2025-00281', 'Grade 2', 11, 'active', '2025-11-10 12:30:48', '2026-01-17 10:28:57', NULL, NULL),
(283, 300, 'MCC2025-00282', 'Grade 3', 12, 'active', '2025-11-10 12:30:48', '2026-01-17 10:30:25', NULL, NULL),
(284, 301, 'MCC2025-00283', 'Kinder', 9, 'active', '2025-11-10 12:30:48', '2026-01-17 10:25:12', NULL, NULL),
(285, 302, 'MCC2025-00284', NULL, NULL, 'active', '2025-11-10 12:30:48', '2026-01-17 16:36:13', NULL, NULL),
(286, 303, 'MCC2025-00285', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(287, 304, 'MCC2025-00286', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(288, 305, 'MCC2025-00287', 'Grade 2', 11, 'active', '2025-11-10 12:30:49', '2026-01-17 10:28:57', NULL, NULL),
(289, 306, 'MCC2025-00288', 'Grade 6', 15, 'active', '2025-11-10 12:30:49', '2026-01-17 10:31:02', NULL, NULL),
(290, 307, 'MCC2025-00289', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(291, 308, 'MCC2025-00290', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(292, 309, 'MCC2025-00291', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(293, 310, 'MCC2025-00292', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(294, 311, 'MCC2025-00293', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(295, 312, 'MCC2025-00294', NULL, NULL, 'active', '2025-11-10 12:30:49', '2026-01-17 16:36:13', NULL, NULL),
(296, 313, 'MCC2025-00295', 'Grade 2', 11, 'active', '2025-11-10 12:30:49', '2026-01-17 10:28:57', NULL, NULL),
(297, 314, 'MCC2025-00296', 'Nursery 1', 7, 'active', '2025-11-10 12:30:49', '2026-01-17 10:20:04', NULL, NULL),
(298, 315, 'MCC2025-00297', 'Nursery 2', 8, 'active', '2025-11-10 12:30:49', '2026-01-17 10:24:58', NULL, NULL),
(299, 316, 'MCC2025-00298', 'Kinder', 9, 'active', '2025-11-10 12:30:49', '2026-01-17 10:25:12', NULL, NULL),
(300, 317, 'MCC2025-00299', 'Nursery 2', 8, 'active', '2025-11-10 12:30:49', '2026-01-17 10:24:58', NULL, NULL),
(301, 318, 'MCC2025-00300', 'Grade 6', 15, 'active', '2025-11-10 12:30:50', '2026-01-17 10:31:02', NULL, NULL),
(302, 319, 'MCC2025-00301', 'Grade 4', 13, 'active', '2025-11-10 12:30:50', '2026-01-17 10:32:42', NULL, NULL),
(303, 320, 'MCC2025-00302', 'Kinder', 9, 'active', '2025-11-10 12:30:50', '2026-01-17 10:25:12', NULL, NULL),
(304, 321, 'MCC2025-00303', 'Grade 4', 13, 'active', '2025-11-10 12:30:50', '2026-01-17 10:32:43', NULL, NULL),
(305, 322, 'MCC2025-00304', 'Grade 6', 15, 'active', '2025-11-10 12:30:50', '2026-01-17 10:31:02', NULL, NULL),
(306, 323, 'MCC2025-00305', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-01-17 16:36:13', NULL, NULL),
(307, 324, 'MCC2025-00306', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-01-17 16:36:13', NULL, NULL),
(308, 325, 'MCC2025-00307', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-01-17 16:36:13', NULL, NULL),
(309, 326, 'MCC2025-00308', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-01-17 16:36:13', NULL, NULL),
(310, 327, 'MCC2025-00309', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-01-17 16:36:13', NULL, NULL),
(311, 328, 'MCC2025-00310', 'Nursery 2', 8, 'active', '2025-11-10 12:30:50', '2026-01-17 10:24:58', NULL, NULL),
(312, 329, 'MCC2025-00311', 'Nursery 1', 7, 'active', '2025-11-10 12:30:50', '2026-01-17 10:20:04', NULL, NULL),
(313, 330, 'MCC2025-00312', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-01-17 16:36:13', NULL, NULL),
(314, 331, 'MCC2025-00313', NULL, NULL, 'active', '2025-11-10 12:30:50', '2026-01-17 16:36:13', NULL, NULL),
(315, 332, 'MCC2025-00314', 'Nursery 2', 8, 'active', '2025-11-10 12:30:51', '2026-01-17 10:24:58', NULL, NULL),
(316, 333, 'MCC2025-00315', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-01-17 16:36:13', NULL, NULL),
(317, 334, 'MCC2025-00316', 'Grade 5', 14, 'active', '2025-11-10 12:30:51', '2026-01-17 10:32:52', NULL, NULL),
(318, 335, 'MCC2025-00317', 'Kinder', 9, 'active', '2025-11-10 12:30:51', '2026-01-17 10:25:11', NULL, NULL),
(319, 336, 'MCC2025-00318', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-01-17 16:36:13', NULL, NULL),
(320, 337, 'MCC2025-00319', 'Grade 4', 13, 'active', '2025-11-10 12:30:51', '2026-01-17 10:32:42', NULL, NULL),
(321, 338, 'MCC2025-00320', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-01-17 16:36:13', NULL, NULL),
(322, 339, 'MCC2025-00321', 'Grade 1', 10, 'active', '2025-11-10 12:30:51', '2026-01-17 10:28:46', NULL, NULL),
(323, 340, 'MCC2025-00322', 'Grade 4', 13, 'active', '2025-11-10 12:30:51', '2026-01-17 10:32:42', NULL, NULL),
(324, 341, 'MCC2025-00323', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-01-17 16:36:13', NULL, NULL),
(325, 342, 'MCC2025-00324', 'Grade 1', 10, 'active', '2025-11-10 12:30:51', '2026-01-17 10:28:46', NULL, NULL),
(326, 343, 'MCC2025-00325', 'Grade 4', 13, 'active', '2025-11-10 12:30:51', '2026-01-17 10:32:42', NULL, NULL),
(327, 344, 'MCC2025-00326', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-01-17 16:36:13', NULL, NULL),
(328, 345, 'MCC2025-00327', 'Kinder', 9, 'active', '2025-11-10 12:30:51', '2026-01-17 10:25:11', NULL, NULL),
(329, 346, 'MCC2025-00328', NULL, NULL, 'active', '2025-11-10 12:30:51', '2026-01-17 16:36:13', NULL, NULL),
(330, 347, 'MCC2025-00329', 'Grade 3', 12, 'active', '2025-11-10 12:30:52', '2026-01-17 10:30:24', NULL, NULL),
(331, 348, 'MCC2025-00330', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-01-17 16:36:13', NULL, NULL),
(332, 349, 'MCC2025-00331', 'Grade 6', 15, 'active', '2025-11-10 12:30:52', '2026-01-17 10:31:02', NULL, NULL),
(333, 350, 'MCC2025-00332', 'Nursery 1', 7, 'active', '2025-11-10 12:30:52', '2026-01-17 10:20:03', NULL, NULL),
(334, 351, 'MCC2025-00333', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-01-17 16:36:13', NULL, NULL),
(335, 352, 'MCC2025-00334', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-01-17 16:36:13', NULL, NULL),
(336, 353, 'MCC2025-00335', 'Nursery 2', 8, 'active', '2025-11-10 12:30:52', '2026-01-17 10:24:58', NULL, NULL),
(337, 354, 'MCC2025-00336', 'Grade 1', 10, 'active', '2025-11-10 12:30:52', '2026-01-17 10:28:46', NULL, NULL),
(338, 355, 'MCC2025-00337', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-01-17 16:36:13', NULL, NULL),
(339, 356, 'MCC2025-00338', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-01-17 16:36:13', NULL, NULL),
(340, 357, 'MCC2025-00339', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-01-17 16:36:13', NULL, NULL),
(341, 358, 'MCC2025-00340', NULL, NULL, 'active', '2025-11-10 12:30:52', '2026-01-17 16:36:13', NULL, NULL),
(342, 359, 'MCC2025-00341', 'Nursery 2', 8, 'active', '2025-11-10 12:30:52', '2026-01-17 10:24:58', NULL, NULL),
(343, 360, 'MCC2025-00342', 'Nursery 1', 7, 'active', '2025-11-10 12:30:52', '2026-01-17 10:20:03', NULL, NULL),
(344, 361, 'MCC2025-00343', 'Grade 4', 13, 'active', '2025-11-10 12:30:53', '2026-01-17 10:32:42', NULL, NULL),
(345, 362, 'MCC2025-00344', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(346, 363, 'MCC2025-00345', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(347, 364, 'MCC2025-00346', 'Grade 5', 14, 'active', '2025-11-10 12:30:53', '2026-01-17 10:32:52', NULL, NULL),
(348, 365, 'MCC2025-00347', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(349, 366, 'MCC2025-00348', 'Grade 6', 15, 'active', '2025-11-10 12:30:53', '2026-01-17 10:31:02', NULL, NULL),
(350, 367, 'MCC2025-00349', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(351, 368, 'MCC2025-00350', 'Nursery 2', 8, 'active', '2025-11-10 12:30:53', '2026-01-17 10:24:58', NULL, NULL),
(352, 369, 'MCC2025-00351', 'Grade 1', 10, 'active', '2025-11-10 12:30:53', '2026-01-17 10:28:46', NULL, NULL),
(353, 370, 'MCC2025-00352', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(354, 371, 'MCC2025-00353', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(355, 372, 'MCC2025-00354', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(356, 373, 'MCC2025-00355', 'Grade 3', 12, 'active', '2025-11-10 12:30:53', '2026-01-17 10:30:24', NULL, NULL),
(357, 374, 'MCC2025-00356', 'Grade 1', 10, 'active', '2025-11-10 12:30:53', '2026-01-17 10:28:46', NULL, NULL),
(358, 375, 'MCC2025-00357', NULL, NULL, 'active', '2025-11-10 12:30:53', '2026-01-17 16:36:13', NULL, NULL),
(359, 376, 'MCC2025-00358', 'Nursery 2', 8, 'active', '2025-11-10 12:30:54', '2026-01-17 10:24:58', NULL, NULL),
(360, 377, 'MCC2025-00359', 'Nursery 1', 7, 'active', '2025-11-10 12:30:54', '2026-01-17 10:20:01', NULL, NULL),
(361, 378, 'MCC2025-00360', NULL, NULL, 'active', '2025-11-10 12:30:54', '2026-01-17 16:36:13', NULL, NULL),
(362, 379, 'MCC2025-00361', 'Grade 3', 12, 'active', '2025-11-10 12:30:54', '2026-01-17 10:30:24', NULL, NULL),
(363, 380, 'MCC2025-00362', 'Kinder', 9, 'active', '2025-11-10 12:30:54', '2026-01-17 10:25:11', NULL, NULL),
(364, 381, 'MCC2025-00363', 'Kinder', 9, 'active', '2025-11-10 12:30:54', '2026-01-17 10:25:11', NULL, NULL),
(379, 398, 'MCC2025-00364', 'Grade 3', 12, 'active', '2025-11-13 10:28:17', '2026-01-17 10:29:09', NULL, NULL),
(386, 405, 'MCC2025-00365', NULL, NULL, 'active', '2025-11-13 12:16:01', '2026-01-17 16:36:13', NULL, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_balance_summary`
-- (See below for the actual view)
--
CREATE TABLE `student_balance_summary` (
`academic_period_id` int unsigned
,`academic_year` varchar(20)
,`balance` decimal(10,2)
,`next_amount_due` decimal(10,2)
,`next_due_date` date
,`overdue_installments` bigint
,`paid_amount` decimal(10,2)
,`payment_plan_status` enum('Active','Completed','Overdue','Cancelled')
,`pending_installments` bigint
,`quarter` enum('1st Quarter','2nd Quarter','3rd Quarter','4th Quarter')
,`student_id` int unsigned
,`student_name` varchar(201)
,`student_number` varchar(50)
,`total_amount` decimal(10,2)
,`total_installments` bigint
,`total_late_fees` decimal(32,2)
,`year_level` varchar(20)
);

-- --------------------------------------------------------

--
-- Table structure for table `student_enrollment_history`
--

CREATE TABLE `student_enrollment_history` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED NOT NULL,
  `academic_period_id` int UNSIGNED NOT NULL,
  `year_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_id` int UNSIGNED DEFAULT NULL,
  `enrollment_status` enum('Enrolled','Promoted','Retained','Transferred','Graduated','Dropped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Enrolled',
  `enrolled_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_uniform_orders`
--

CREATE TABLE `student_uniform_orders` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `enrollment_id` int UNSIGNED DEFAULT NULL,
  `uniform_item_id` int UNSIGNED NOT NULL,
  `size` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `unit_price` decimal(8,2) NOT NULL,
  `is_half_piece` tinyint(1) DEFAULT '0',
  `piece_type` enum('Shirt','Pants') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(8,2) NOT NULL,
  `payment_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int UNSIGNED NOT NULL,
  `course_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., MATH1, ENG2',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full subject name',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Grade 1',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Simplified subjects for Nursery to Grade 6';

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `course_code`, `name`, `level`, `status`, `created_at`, `updated_at`) VALUES
(29, 'READ-N1', 'Reading Readiness', 'Nursery 1', 'active', '2026-01-17 18:37:22', '2026-01-17 18:38:17'),
(30, 'LANG-N1', 'Language Development', 'Nursery 1', 'active', '2026-01-17 18:37:22', '2026-01-17 18:38:20'),
(31, 'MATH-N1', 'Basic Math Concepts', 'Nursery 1', 'active', '2026-01-17 18:37:22', '2026-01-17 18:38:22'),
(32, 'GMRC-N1', 'Good Manners & Right Conduct', 'Nursery 1', 'active', '2026-01-17 18:37:22', '2026-01-17 18:38:25'),
(33, 'READ-N2', 'Reading Readiness', 'Nursery 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:38:29'),
(34, 'LANG-N2', 'Language Development', 'Nursery 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:38:31'),
(35, 'MATH-N2', 'Basic Math Concepts', 'Nursery 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:38:33'),
(36, 'GMRC-N2', 'Good Manners & Right Conduct', 'Nursery 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:38:36'),
(37, 'MAKA-N2', 'Makabansa (Patriotism)', 'Nursery 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:38:38'),
(38, 'READ-KN', 'Reading Readiness', 'Kinder', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(39, 'LANG-KN', 'Language Development', 'Kinder', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(40, 'MATH-KN', 'Basic Math Concepts', 'Kinder', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(41, 'GMRC-KN', 'Good Manners & Right Conduct', 'Kinder', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(42, 'MAKA-KN', 'Makabansa (Patriotism)', 'Kinder', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(43, 'SCI-KN', 'Intro to Science', 'Kinder', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(44, 'MAKA-G1', 'Makabansa', 'Grade 1', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(45, 'READ-G1', 'Reading', 'Grade 1', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(46, 'MATH-G1', 'Mathematics', 'Grade 1', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(47, 'ENGL-G1', 'English Language', 'Grade 1', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(48, 'GMRC-G1', 'GMRC', 'Grade 1', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(49, 'MAKA-G2', 'Makabansa', 'Grade 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(50, 'MATH-G2', 'Mathematics', 'Grade 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(51, 'ENGL-G2', 'English', 'Grade 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(52, 'FILI-G2', 'Filipino', 'Grade 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(53, 'GMRC-G2', 'GMRC', 'Grade 2', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(54, 'MAKA-G3', 'Makabansa', 'Grade 3', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(55, 'SCI-G3', 'Science', 'Grade 3', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(56, 'MATH-G3', 'Mathematics', 'Grade 3', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(57, 'ENGL-G3', 'English', 'Grade 3', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(58, 'FILI-G3', 'Filipino', 'Grade 3', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(59, 'GMRC-G3', 'GMRC', 'Grade 3', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(60, 'MAPEH-G4', 'MAPEH (Music, Arts, PE, Health)', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(61, 'AP-G4', 'Araling Panlipunan', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(62, 'EPP-G4', 'EPP (Home Economics & Livelihood Ed)', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(63, 'SCI-G4', 'Science', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(64, 'MATH-G4', 'Mathematics', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(65, 'ENGL-G4', 'English', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(66, 'FILI-G4', 'Filipino', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(67, 'GMRC-G4', 'ESP (Ethics)', 'Grade 4', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(68, 'MAPEH-G5', 'MAPEH', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(69, 'AP-G5', 'Araling Panlipunan', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(70, 'EPP-G5', 'EPP (Technology & Livelihood)', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(71, 'SCI-G5', 'Science', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(72, 'MATH-G5', 'Mathematics', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(73, 'ENGL-G5', 'English', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(74, 'FILI-G5', 'Filipino', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(75, 'GMRC-G5', 'ESP', 'Grade 5', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(76, 'MAPEH-G6', 'MAPEH', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(77, 'AP-G6', 'Araling Panlipunan', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(78, 'EPP-G6', 'EPP (Entrepreneurship & Skills)', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(79, 'SCI-G6', 'Science', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(80, 'MATH-G6', 'Mathematics', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(81, 'ENGL-G6', 'English', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(82, 'FILI-G6', 'Filipino', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23'),
(83, 'GMRC-G6', 'ESP', 'Grade 6', 'active', '2026-01-17 18:37:23', '2026-01-17 18:37:23');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `status_updated_at` timestamp NULL DEFAULT NULL COMMENT 'When status last changed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `user_id`, `employee_id`, `status`, `status_updated_at`, `created_at`, `updated_at`) VALUES
(1, 16, 'EMP2025-001', 'active', NULL, '2025-11-06 14:06:02', '2026-01-17 13:02:43'),
(3, 21, 'EMP2025-002', 'active', NULL, '2025-11-08 09:18:02', '2025-11-08 16:18:02'),
(4, 52, 'EMP2025-003', 'active', NULL, '2025-11-10 02:38:20', '2026-01-17 13:01:51'),
(5, 382, 'EMP2025-004', 'active', NULL, '2025-11-10 22:42:14', '2026-01-17 13:02:34'),
(6, 406, 'EMP2025-005', 'active', NULL, '2025-11-18 07:58:38', '2026-01-17 13:02:26'),
(7, 407, 'EMP2025-006', 'active', NULL, '2025-11-18 08:15:48', '2025-11-18 15:15:48'),
(8, 408, 'EMP2025-007', 'active', NULL, '2025-11-18 08:16:06', '2025-11-18 15:16:06'),
(9, 409, 'EMP2025-008', 'active', NULL, '2025-11-18 08:17:15', '2026-01-17 13:02:12'),
(10, 410, 'EMP2025-009', 'active', NULL, '2025-11-18 08:17:30', '2026-01-17 13:02:02'),
(11, 411, 'EMP2025-010', 'active', NULL, '2025-11-18 08:18:13', '2025-11-18 15:18:13'),
(12, 412, 'EMP2025-011', 'active', NULL, '2025-11-18 08:18:28', '2025-11-18 15:18:28'),
(13, 413, 'EMP2025-012', 'active', NULL, '2025-11-18 08:18:48', '2026-01-17 12:54:59'),
(14, 414, 'EMP2025-013', 'active', NULL, '2025-11-18 08:19:01', '2026-01-17 12:45:23'),
(15, 415, 'EMP2025-014', 'active', NULL, '2025-11-18 08:19:17', '2026-01-17 12:31:36');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_adviser_assignments`
--

CREATE TABLE `teacher_adviser_assignments` (
  `id` int UNSIGNED NOT NULL,
  `teacher_id` int UNSIGNED NOT NULL,
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Grade level: Nursery 1, Nursery 2, Kinder, Grade 1-6',
  `school_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., 2026-2027',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Teacher adviser assignments by grade level per school year';

--
-- Dumping data for table `teacher_adviser_assignments`
--

INSERT INTO `teacher_adviser_assignments` (`id`, `teacher_id`, `level`, `school_year`, `created_at`, `updated_at`) VALUES
(18, 15, 'Grade 1', '2026-2027', '2026-02-14 23:09:51', '2026-02-14 23:09:51'),
(21, 14, 'Grade 3', '2026-2027', '2026-02-14 23:17:25', '2026-02-14 23:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_assignments`
--

CREATE TABLE `teacher_assignments` (
  `id` int UNSIGNED NOT NULL,
  `teacher_id` int UNSIGNED NOT NULL COMMENT 'References teachers.id',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Year level: Nursery, Kinder, Grade 1, etc.',
  `school_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., 2025-2026',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teacher_assignments`
--

INSERT INTO `teacher_assignments` (`id`, `teacher_id`, `level`, `school_year`, `created_at`, `updated_at`) VALUES
(1, 15, 'Nursery 1', '2026-2027', '2026-01-17 12:31:36', '2026-01-17 12:31:36'),
(2, 14, 'Nursery 2', '2026-2027', '2026-01-17 12:45:23', '2026-01-17 12:45:23'),
(3, 13, 'Grade 3', '2026-2027', '2026-01-17 12:54:59', '2026-01-17 12:54:59'),
(4, 4, 'Grade 1', '2026-2027', '2026-01-17 13:01:51', '2026-01-17 13:01:51'),
(5, 10, 'Grade 2', '2026-2027', '2026-01-17 13:02:02', '2026-01-17 13:02:02'),
(6, 9, 'Kinder', '2026-2027', '2026-01-17 13:02:12', '2026-01-17 13:02:12'),
(7, 6, 'Grade 5', '2026-2027', '2026-01-17 13:02:26', '2026-01-17 13:02:26'),
(8, 5, 'Grade 4', '2026-2027', '2026-01-17 13:02:34', '2026-01-17 13:02:34'),
(9, 1, 'Grade 6', '2026-2027', '2026-01-17 13:02:43', '2026-01-17 13:02:43');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_subject_assignments`
--

CREATE TABLE `teacher_subject_assignments` (
  `id` int UNSIGNED NOT NULL,
  `teacher_id` int UNSIGNED NOT NULL,
  `subject_id` int UNSIGNED NOT NULL,
  `school_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., 2026-2027',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Teacher-Subject assignments (supports multiple subjects per teacher)';

--
-- Dumping data for table `teacher_subject_assignments`
--

INSERT INTO `teacher_subject_assignments` (`id`, `teacher_id`, `subject_id`, `school_year`, `created_at`, `updated_at`) VALUES
(66, 15, 47, '2026-2027', '2026-02-14 23:10:24', '2026-02-14 23:10:24'),
(67, 15, 46, '2026-2027', '2026-02-14 23:10:30', '2026-02-14 23:10:30'),
(68, 15, 44, '2026-2027', '2026-02-14 23:10:53', '2026-02-14 23:10:53'),
(69, 15, 48, '2026-2027', '2026-02-14 23:10:54', '2026-02-14 23:10:54'),
(70, 15, 45, '2026-2027', '2026-02-14 23:10:59', '2026-02-14 23:10:59');

-- --------------------------------------------------------

--
-- Table structure for table `tuition_packages`
--

CREATE TABLE `tuition_packages` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tuition_packages`
--

INSERT INTO `tuition_packages` (`id`, `name`, `effective_from`, `effective_to`, `is_active`, `created_at`, `updated_at`) VALUES
(7, 'Tuition Package - Grade 4, Grade 5, Grade 6', '2026-02-18', NULL, 1, '2026-02-18 18:08:32', '2026-02-18 18:08:32'),
(8, 'Tuition Package - Grade 3, Grade 2, Grade 1', '2026-02-18', NULL, 1, '2026-02-18 18:11:48', '2026-02-18 18:11:48'),
(9, 'Tuition Package - Nursery 1, Nursery 2, Kinder', '2026-02-18', NULL, 1, '2026-02-18 18:14:01', '2026-02-18 18:14:01');

-- --------------------------------------------------------

--
-- Table structure for table `tuition_package_items`
--

CREATE TABLE `tuition_package_items` (
  `id` int UNSIGNED NOT NULL,
  `package_id` int UNSIGNED NOT NULL,
  `item_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tuition_package_items`
--

INSERT INTO `tuition_package_items` (`id`, `package_id`, `item_name`, `amount`, `is_required`, `sort_order`, `created_at`, `updated_at`) VALUES
(15, 7, 'Enrollment Fee', 2000.00, 1, 1, '2026-02-18 18:08:32', '2026-02-18 18:08:32'),
(16, 7, 'Miscellaneous Fee', 6000.00, 1, 2, '2026-02-18 18:08:32', '2026-02-18 18:08:32'),
(17, 7, 'Tuition Fee', 6600.00, 1, 3, '2026-02-18 18:08:32', '2026-02-18 18:08:32'),
(18, 7, 'Aircon Fee', 2500.00, 1, 4, '2026-02-18 18:08:32', '2026-02-18 18:08:32'),
(19, 8, 'Enrollment Fee', 2000.00, 1, 1, '2026-02-18 18:11:48', '2026-02-18 18:11:48'),
(20, 8, 'Miscellaneous Fee', 6000.00, 1, 2, '2026-02-18 18:11:48', '2026-02-18 18:11:48'),
(21, 8, 'Tuition Fee', 6500.00, 1, 3, '2026-02-18 18:11:48', '2026-02-18 18:11:48'),
(22, 8, 'Aircon Fee', 2500.00, 1, 4, '2026-02-18 18:11:48', '2026-02-18 18:11:48'),
(27, 9, 'Enrollment Fee', 2000.00, 1, 1, '2026-02-19 00:39:27', '2026-02-19 00:39:27'),
(28, 9, 'Miscellaneous Fee', 6000.00, 1, 2, '2026-02-19 00:39:27', '2026-02-19 00:39:27'),
(29, 9, 'Tuition Fee', 6500.00, 1, 3, '2026-02-19 00:39:27', '2026-02-19 00:39:27'),
(30, 9, 'Aircon Fee', 2000.00, 1, 4, '2026-02-19 00:39:27', '2026-02-19 00:39:27');

-- --------------------------------------------------------

--
-- Table structure for table `tuition_package_levels`
--

CREATE TABLE `tuition_package_levels` (
  `id` int UNSIGNED NOT NULL,
  `package_id` int UNSIGNED NOT NULL,
  `year_level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tuition_package_levels`
--

INSERT INTO `tuition_package_levels` (`id`, `package_id`, `year_level`, `created_at`) VALUES
(17, 7, 'Grade 4', '2026-02-18 18:08:32'),
(18, 7, 'Grade 5', '2026-02-18 18:08:32'),
(19, 7, 'Grade 6', '2026-02-18 18:08:32'),
(20, 8, 'Grade 3', '2026-02-18 18:11:48'),
(21, 8, 'Grade 2', '2026-02-18 18:11:48'),
(22, 8, 'Grade 1', '2026-02-18 18:11:48'),
(26, 9, 'Nursery 1', '2026-02-19 00:39:27'),
(27, 9, 'Nursery 2', '2026-02-19 00:39:27'),
(28, 9, 'Kinder', '2026-02-19 00:39:27');

-- --------------------------------------------------------

--
-- Table structure for table `uniform_items`
--

CREATE TABLE `uniform_items` (
  `id` int UNSIGNED NOT NULL,
  `item_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_group` enum('Dress','Blouse','Skirt','Polo','PE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicable_levels` json DEFAULT NULL,
  `applicable_gender` enum('Male','Female','All') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'All',
  `is_pair` tinyint(1) DEFAULT '0',
  `allow_half_price` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `uniform_items`
--

INSERT INTO `uniform_items` (`id`, `item_name`, `item_group`, `applicable_levels`, `applicable_gender`, `is_pair`, `allow_half_price`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Dress (Kindergarten)', 'Dress', '[\"Nursery 1\", \"Nursery 2\", \"Kinder\"]', 'Female', 0, 0, 1, '2026-02-18 19:03:05', '2026-02-18 19:03:05'),
(2, 'Blouse', 'Blouse', '[\"Grade 1\", \"Grade 2\", \"Grade 3\", \"Grade 4\", \"Grade 5\", \"Grade 6\"]', 'Female', 0, 0, 1, '2026-02-18 19:05:24', '2026-02-18 19:05:24'),
(4, 'Skirt', 'Skirt', '[\"Grade 1\", \"Grade 2\", \"Grade 3\", \"Grade 4\", \"Grade 5\", \"Grade 6\"]', 'Female', 0, 0, 1, '2026-02-18 19:10:48', '2026-02-18 19:10:48'),
(5, 'Polo', 'Polo', '[\"Grade 1\", \"Grade 2\", \"Grade 3\", \"Grade 4\", \"Nursery 1\", \"Nursery 2\", \"Kinder\", \"Grade 5\", \"Grade 6\"]', 'Male', 0, 0, 1, '2026-02-18 19:13:14', '2026-02-18 19:13:14'),
(6, 'PE Uniform', 'PE', '[]', 'All', 1, 1, 1, '2026-02-18 19:15:24', '2026-02-18 19:15:24');

-- --------------------------------------------------------

--
-- Table structure for table `uniform_prices`
--

CREATE TABLE `uniform_prices` (
  `id` int UNSIGNED NOT NULL,
  `uniform_item_id` int UNSIGNED NOT NULL,
  `size` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `half_price` decimal(8,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `uniform_prices`
--

INSERT INTO `uniform_prices` (`id`, `uniform_item_id`, `size`, `price`, `half_price`, `is_active`, `created_at`) VALUES
(1, 1, 'XS, S, M', 600.00, NULL, 1, '2026-02-18 19:03:05'),
(2, 1, 'L, XL', 620.00, NULL, 1, '2026-02-18 19:03:05'),
(4, 2, '#16, #18, #20', 350.00, NULL, 1, '2026-02-18 19:09:50'),
(5, 2, 'XS, S, M', 400.00, NULL, 1, '2026-02-18 19:09:50'),
(6, 2, 'L, XL, 2XL', 450.00, NULL, 1, '2026-02-18 19:09:50'),
(7, 4, 'XS, S, M, L', 400.00, NULL, 1, '2026-02-18 19:10:48'),
(8, 5, '#6, #8, #10, #12, #14, #16', 250.00, NULL, 1, '2026-02-18 19:13:14'),
(9, 5, '#18, #20', 300.00, NULL, 1, '2026-02-18 19:13:14'),
(10, 5, 'XS', 400.00, NULL, 1, '2026-02-18 19:13:14'),
(11, 5, 'S, M, L', 420.00, NULL, 1, '2026-02-18 19:13:14'),
(12, 6, '#2, #4, $6', 400.00, 200.00, 1, '2026-02-18 19:15:24'),
(13, 6, '#8, #10, #12', 450.00, 225.00, 1, '2026-02-18 19:15:24'),
(14, 6, '#14, #16, #18, #20', 470.00, 235.00, 1, '2026-02-18 19:15:24'),
(15, 6, 'XS, S, M, L', 600.00, 300.00, 1, '2026-02-18 19:15:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','teacher','student','enrollee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'enrollee',
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `must_change_password` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_pin_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_pin_set_at` timestamp NULL DEFAULT NULL,
  `pin_attempts` int DEFAULT '0',
  `pin_locked_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `first_name`, `middle_name`, `last_name`, `phone`, `status`, `must_change_password`, `created_at`, `updated_at`, `payment_pin_hash`, `payment_pin_set_at`, `pin_attempts`, `pin_locked_until`) VALUES
(1, 'student@demo.com', '$2y$10$Ll4dzxFoqlaGCC1aL702BOdZ3xtLLijHcLKzW4SF1HPrlEgP9Frz6', 'student', 'Demo', NULL, 'Student', '', 'active', 0, '2025-11-06 11:13:56', '2025-11-10 01:05:04', NULL, NULL, 0, NULL),
(2, 'teacher@demo.com', '$2y$10$/zuE1Q4AmA1J6MXuovoRoenUL5PoblPSzSxXA3ubUw47wpiTNfoVS', 'teacher', 'Demo', NULL, 'Teacher', '', 'active', 0, '2025-11-06 11:14:42', '2026-01-06 20:49:02', NULL, NULL, 0, NULL),
(3, 'admin@demo.com', '$2y$10$zhZ636k.0buTfPYR..Q2eODPgdmjEcKklTOWC1HTR64BH13j0iNeS', 'admin', 'Demo', NULL, 'Admin', '', 'active', 0, '2025-11-06 11:15:04', '2026-02-19 02:41:43', NULL, NULL, 0, NULL),
(16, 'john.doe@example.com', '$2y$10$I19hzyUWwzkG9HMk8wEutekUr7tC9GmtiRFvW4lqePlq4eKBKXQtS', 'teacher', 'John', NULL, 'Doe', '', 'active', 0, '2025-11-06 14:05:34', '2025-11-06 18:29:13', NULL, NULL, 0, NULL),
(18, 'juan.delacruz@mcc.edu.ph', '$2y$10$762nxMWoGHGu7kRyvzc8K.FGrrYGGJpRdMbm5jentTkF4mfui3iBK', 'student', 'Juan', NULL, 'Dela Cruz', '', 'active', 0, '2025-11-06 18:30:24', '2025-11-06 18:30:24', NULL, NULL, 0, NULL),
(19, 'maria.santos@mcc.edu.ph', '$2y$10$KGlfA0PiOWB4HR0pds9.1epVHMzpgv3hsk.qLKXZCSh9mgaD20FCW', 'student', 'Maria', NULL, 'Santos', '', 'active', 0, '2025-11-06 18:30:45', '2026-02-14 08:35:58', '$2y$10$eHfLDD/lkTefVxHXDsIUc.aQ5zhzyP.vp/AckoRlj.F42gZ4oEXku', '2026-02-14 01:35:58', 0, NULL),
(21, 'jose.reyes@mcc.edu.ph', '$2y$10$a6oQ6s6.ZLrnMN2ShismvunFw6HSUJb/lrIcxQfhLfHp2HWc2W7xK', 'teacher', 'Jose', NULL, 'Reyes', '', 'active', 0, '2025-11-08 16:18:01', '2025-11-24 01:32:02', NULL, NULL, 0, NULL),
(23, 'ana.bautista@mcc.edu.ph', '$2y$10$Jj6j4oDteBovsiSxQ5M2juwj3pExJM5R80gRSCnWB40b8csyWQhHW', 'student', 'Ana Marie', NULL, 'Bautista', '', 'active', 0, '2025-11-10 08:39:01', '2026-02-14 08:39:15', '$2y$10$M7h1ArBs8oOe80wrJMuKoODg4OxYZ4wYKybFnFp8cevQt7MsIJyy2', '2026-02-14 01:39:15', 0, NULL),
(24, 'carlos.mendoza@mcc.edu.ph', '$2y$10$XjdtGF0u5jkv3wbYlJm4D.Np7Cv9hDp7Of/zlEv7Bt5D2GHtWugQe', 'student', 'Carlos', NULL, 'Mendoza', '', 'active', 0, '2025-11-10 08:39:16', '2026-02-14 01:40:58', NULL, NULL, 0, NULL),
(25, 'luisa.fernandez@mcc.edu.ph', '$2y$10$Md1tZhHnZfFfpgo90cwXj.qCrDmEZWcBp.8389tzsbGESBvKxiIlO', 'student', 'Luisa', NULL, 'Fernandez', '', 'active', 0, '2025-11-10 08:39:29', '2025-11-10 08:39:29', NULL, NULL, 0, NULL),
(26, 'michael.tan@mcc.edu.ph', '$2y$10$PGFuueRiY5pqZ6QPBOWX.urcBujwzBH/0d9PnuitX9pQQhA0.FK0O', 'student', 'Michael', NULL, 'Tan', '', 'active', 0, '2025-11-10 08:39:43', '2025-11-10 08:39:43', NULL, NULL, 0, NULL),
(27, 'jasmine.lim@mcc.edu.ph', '$2y$10$btaZvRIyT0kmUkODKStX7.OyTMTUefBFw.Uz7wiab4ow/p8FoUbsO', 'student', 'Jasmine', NULL, 'Lim', '', 'active', 0, '2025-11-10 08:39:58', '2025-11-10 08:39:58', NULL, NULL, 0, NULL),
(28, 'catherine.aquino@mcc.edu.ph', '$2y$10$awoQxoT6ormmhF6JRA1OPucz8FWLN7NcUJN8SAR4DHqZN3yNEfbbi', 'student', 'Catherine', NULL, 'Aquino', '', 'active', 0, '2025-11-10 08:40:16', '2025-11-10 08:40:16', NULL, NULL, 0, NULL),
(29, 'ricardo.gomez@mcc.edu.ph', '$2y$10$myDlCmDtauZwb2yGZLJVLuBQnu455aDE3SkY/KEeNYvhjOI9v6/QS', 'student', 'Ricardo', NULL, 'Gomez', '', 'active', 0, '2025-11-10 08:40:28', '2025-11-10 08:40:28', NULL, NULL, 0, NULL),
(30, 'angelica.perez@mcc.edu.ph', '$2y$10$8C8gZCGXWNgFk1pqgsX0.Oeee8xazbRRiTclXJiSl2sbQYKa62L.m', 'student', 'Angelica', NULL, 'Perez', '', 'active', 0, '2025-11-10 08:40:42', '2025-11-10 08:40:42', NULL, NULL, 0, NULL),
(31, 'christian.delossantos@mcc.edu.ph', '$2y$10$/2PhuFDJAAb0RjTTwcd/auIaYSAXyIkx5LDm4H729vfGtbsHORNvu', 'student', 'Christian', NULL, 'Delos Santos', '', 'active', 0, '2025-11-10 08:40:56', '2025-11-10 08:40:56', NULL, NULL, 0, NULL),
(32, 'kristine.apolonio@mcc.edu.ph', '$2y$10$LJdoxOyj5sDC0cAiQucWR.g8ckA.CcQQEAqJgRU3pYAJNZIvAoz4m', 'student', 'Kristine Joy', NULL, 'Apolonio', '', 'active', 0, '2025-11-10 08:41:11', '2025-11-10 08:41:11', NULL, NULL, 0, NULL),
(33, 'emmanuel.rivera@mcc.edu.ph', '$2y$10$EkBQqe.Zau2J1BSqBQSZQu1iVJU8JUFgTmrmwkA/ooKqzSZJFsIGK', 'student', 'Emmanuel', NULL, 'Rivera', '', 'active', 0, '2025-11-10 08:41:28', '2025-11-10 08:41:28', NULL, NULL, 0, NULL),
(34, 'samantha.lopez@mcc.edu.ph', '$2y$10$shoW7DnaD2eOcoSkosYGH.xkPvqIoCuRqwtCm7NjU9s/iaeR/I5Ge', 'student', 'Samantha', NULL, 'Lopez', '', 'active', 0, '2025-11-10 08:41:39', '2025-11-10 08:41:39', NULL, NULL, 0, NULL),
(35, 'rafael.valdez@mcc.edu.ph', '$2y$10$sbcy6wENv1x.LIJTV85iNOFIG7LvUTB63hL9Xb8BvmZ0ojEB22XgC', 'student', 'Rafael Paolo', NULL, 'Valdez', '', 'active', 0, '2025-11-10 08:42:03', '2025-11-10 08:42:03', NULL, NULL, 0, NULL),
(36, 'nicole.villanueva@mcc.edu.ph', '$2y$10$KNVaAGgtjnMrdPX92/Uv7.p7GEalZLUmfhu7ws1jc6At7/RXX6N6S', 'student', 'Nicole Ann', NULL, 'Villanueva', '', 'active', 0, '2025-11-10 08:42:15', '2025-11-10 08:42:15', NULL, NULL, 0, NULL),
(37, 'adrian.co@mcc.edu.ph', '$2y$10$4s0/H8yNcei4d6sX5S8Jb.ZoESlPMGGlDRDMCfMSeVUen1j7BqxCG', 'student', 'Adrian James', NULL, 'Co', '', 'active', 0, '2025-11-10 08:42:29', '2025-11-19 03:11:39', NULL, NULL, 0, NULL),
(38, 'tricia.balingit@mcc.edu.ph', '$2y$10$cac/8cufGbKTeVh45ItQiuhIefWl3POl0evpDR1V/1p7f8bCXRYu6', 'student', 'Tricia Mae', NULL, 'Balingit', '', 'active', 0, '2025-11-10 08:42:43', '2025-11-10 08:42:43', NULL, NULL, 0, NULL),
(39, 'johnlloyd.cruz@mcc.edu.ph', '$2y$10$FdX0lIglHbOsVzWVdcLn7u6wJccWMJq8eG.nHqAXnnId8Ed63ox/O', 'student', 'John Lloyd', NULL, 'Cruz', '', 'active', 0, '2025-11-10 08:42:56', '2025-11-10 08:42:56', NULL, NULL, 0, NULL),
(40, 'andrea.reyes@mcc.edu.ph', '$2y$10$go/31KlI0JlS.l2Y32vvreimnJ7pdTwVx9svuuoGpjtyKg038IG92', 'student', 'Andrea', NULL, 'Reyes', '', 'active', 0, '2025-11-10 08:46:11', '2025-11-10 08:46:11', NULL, NULL, 0, NULL),
(41, 'bernard.tan@mcc.edu.ph', '$2y$10$FISx9fakhxSvkwOqRq.rNezpjt2QQ7vOKEa8k20/9v7ZiIR/uDldK', 'student', 'Bernard', NULL, 'Tan', '', 'active', 0, '2025-11-10 08:46:20', '2025-11-10 08:46:20', NULL, NULL, 0, NULL),
(42, 'carmela.rivera@mcc.edu.ph', '$2y$10$4Lt.CkETBeUFKczXr2mxK.pc.UxpMVqFUK4/ykEpLiOXMsnUs5luO', 'student', 'Carmela', NULL, 'Rivera', '', 'active', 0, '2025-11-10 08:46:29', '2025-11-10 08:46:29', NULL, NULL, 0, NULL),
(43, 'derek.lim@mcc.edu.ph', '$2y$10$08TnQwMMr4V55GaYAAy.4eAoX8HWBN5COF1IYy0trneS4to8EQxlK', 'student', 'Derek', NULL, 'Lim', '', 'active', 0, '2025-11-10 08:46:37', '2025-11-10 08:46:37', NULL, NULL, 0, NULL),
(44, 'ella.fernandez@mcc.edu.ph', '$2y$10$2N/HRZvYJuz5ZP75iIJ.kOubTmfOOVi7pv8QvwMyh/V/umwRhs1Dm', 'student', 'Ella Marie', NULL, 'Fernandez', '', 'active', 0, '2025-11-10 08:46:49', '2025-11-10 08:46:49', NULL, NULL, 0, NULL),
(45, 'francis.go@mcc.edu.ph', '$2y$10$nCBsX87fHih6uk.hJ2oVo.FfLl9sL35lmkxaUya44ekFRwMeUTscq', 'student', 'Francis', NULL, 'Go', '', 'active', 0, '2025-11-10 08:46:57', '2025-11-10 08:46:57', NULL, NULL, 0, NULL),
(46, 'gia.pascual@mcc.edu.ph', '$2y$10$O0/7Yxhk0cHNOm4ZKXU0x.xOlBQbBhqV8Y8O3fcr66NOOy1zPu.JS', 'student', 'Gia', NULL, 'Pascual', '', 'active', 0, '2025-11-10 08:47:05', '2025-11-10 08:47:05', NULL, NULL, 0, NULL),
(47, 'harold.javier@mcc.edu.ph', '$2y$10$UNkC/6TddFTEsbHW1EtY7OFyJLJ6EpEumY/dJ0RCVrypFV9dvCbF.', 'student', 'Harold', NULL, 'Javier', '', 'active', 0, '2025-11-10 08:47:14', '2025-11-10 08:47:14', NULL, NULL, 0, NULL),
(48, 'ingrid.navarro@mcc.edu.ph', '$2y$10$a2I3Bmcm2tU8eArKhusxo.629tX6hypN8DA9EYfp6tkYL/SvvxDvi', 'student', 'Ingrid', NULL, 'Navarro', '', 'active', 0, '2025-11-10 08:47:22', '2025-11-10 08:47:22', NULL, NULL, 0, NULL),
(49, 'jake.silva@mcc.edu.ph', '$2y$10$KkoQ0Kd5xJgW5f653dpUiOcCyZbZYuZwMRKxzW9Mhq05np6P25mvu', 'student', 'Jake Anthony', NULL, 'Silva', '', 'active', 0, '2025-11-10 08:47:32', '2025-11-10 08:47:32', NULL, NULL, 0, NULL),
(50, 'kaye.castro@mcc.edu.ph', '$2y$10$E5sxDNYuS7PQPqFEdcdqcupccfatEk39MJsK7LNx0ujWmpNwocPWy', 'student', 'Kaye', NULL, 'Castro', '', 'active', 0, '2025-11-10 08:47:40', '2025-11-10 08:47:40', NULL, NULL, 0, NULL),
(51, 'leandro.morales@mcc.edu.ph', '$2y$10$icTlD1gFj.SReFcPhM./bec13jp9ru0KFZlfEChhE4zpue7Mzz4CW', 'student', 'Leandro', NULL, 'Morales', '', 'active', 0, '2025-11-10 09:21:56', '2025-11-10 09:21:56', NULL, NULL, 0, NULL),
(52, 'mia.dizon@mcc.edu.ph', '$2y$10$EtWI1tGPBY9GmYYBuVs1lOSVTSe7XTi4fli2mEDeXH4xrTTo8lQ/e', 'teacher', 'Mia Rose', NULL, 'Dizon', '', 'active', 0, '2025-11-10 09:38:20', '2026-02-19 01:07:21', NULL, NULL, 0, NULL),
(53, 'nico.perez@mcc.edu.ph', '$2y$10$m.hi3cAvdrAUzCF7TMoaseMCqY.oGHNorWf7U4e1.IXkR7ANud61S', 'student', 'Nico Allan', NULL, 'Perez', '', 'active', 0, '2025-11-10 09:46:50', '2025-11-10 09:46:50', NULL, NULL, 0, NULL),
(54, 'olivia.delgado@mcc.edu.ph', '$2y$10$0h4mahiMCDm96OWctcRdXeujn7Yr/PRJvgyO7KQtO954d7V39.26m', 'student', 'Olivia Anne', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:04:08', '2025-11-10 19:04:08', NULL, NULL, 0, NULL),
(55, 'paul.uy@mcc.edu.ph', '$2y$10$8IsNfV4is0Sgs0N6e70Zk.PP.DcSJswNe.GBdLa3aLZhDxvJ.KiZG', 'student', 'Paul Vincent', NULL, 'Uy', NULL, 'active', 0, '2025-11-10 12:04:08', '2025-11-10 19:04:08', NULL, NULL, 0, NULL),
(56, 'queenie.lopez@mcc.edu.ph', '$2y$10$e4xcXVIj5hELgNvr0JSjMeNWmz3GxGWSSqd0QPAvuKj.AXYyClTOC', 'student', 'Queenie', NULL, 'Lopez', NULL, 'active', 0, '2025-11-10 12:04:08', '2025-11-10 19:04:08', NULL, NULL, 0, NULL),
(57, 'ronald.bautista@mcc.edu.ph', '$2y$10$5iq5Sg5fW/Jj07.ycapvzuZ8gUt7J7fqwHRbX4IbS6zCpD8y/0cqa', 'student', 'Ronald', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:04:08', '2025-11-10 19:04:08', NULL, NULL, 0, NULL),
(58, 'shiela.gomez@mcc.edu.ph', '$2y$10$LC2kMt3TVD6aqjNVpXd4NuM2wnx4orznYG0kYyBP..V1aXokO3Wuu', 'student', 'Shiela Mae', NULL, 'Gomez', NULL, 'active', 0, '2025-11-10 12:04:08', '2025-11-10 19:04:08', NULL, NULL, 0, NULL),
(59, 'troy.medina@mcc.edu.ph', '$2y$10$J.YdQQGoR434pyKxeo/0VO9f0lvImfo96CE59z0wO0vmjED0g6ecq', 'student', 'Troy James', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:04:08', '2025-11-10 19:04:08', NULL, NULL, 0, NULL),
(60, 'aaliyah.bernardo@mcc.edu.ph', '$2y$10$uXV2HkyxgNzjiwawUN28gOdd.sWz3d70N8ITep2YFnL5j0vz4OX8e', 'student', 'Aaliyah Grace', NULL, 'Bernardo', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-18 09:23:02', NULL, NULL, 0, NULL),
(61, 'aaron.cabrera@mcc.edu.ph', '$2y$10$KdB0VAtZtivUzWn.Ag.sruoSaFFQ181.Gi5JbsXBsgfY/9vFJZ2z2', 'student', 'Aaron James', NULL, 'Cabrera', NULL, 'active', 0, '2025-11-10 12:15:39', '2026-02-08 08:08:45', NULL, NULL, 0, NULL),
(62, 'bianca.dizon@mcc.edu.ph', '$2y$10$IZOT1.ui78sarUox3cIRM.f0cp2NwhBDs2TScFVFJ1QbH6as9Ffye', 'student', 'Bianca Marie', NULL, 'Dizon', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(63, 'carl.escobar@mcc.edu.ph', '$2y$10$i3pR0rXeg85zZlRqR1bULuDWJh/QUnp76ZuQ.NCqaiDtX5WQOwb0i', 'student', 'Carl John', NULL, 'Escobar', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(64, 'diana.flores@mcc.edu.ph', '$2y$10$viJpN1ONZW8VODk7ME01yOwMy1SJqkXjcAVezILdE3DHVQYkpgbFa', 'student', 'Diana Rose', NULL, 'Flores', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(65, 'ethan.gutierrez@mcc.edu.ph', '$2y$10$8SpTP21UQefARRxLUDP1PebAgqNmjZOZ2XKUJg3ORX6/Kdgjaqnei', 'student', 'Ethan Blake', NULL, 'Gutierrez', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(66, 'faye.hernandez@mcc.edu.ph', '$2y$10$DzJnEKL8OYo1p8mobOoSd.Ptd4mVCjUpO/87KssXd6btzYkKnDoaK', 'student', 'Faye Louise', NULL, 'Hernandez', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(67, 'gabriel.ignacio@mcc.edu.ph', '$2y$10$iN6fvdGyY/WOG4rGLrUuyeXQf.pyTiVrwYwjSOyHm20fdK8tdevMC', 'student', 'Gabriel Jude', NULL, 'Ignacio', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(68, 'hannah.jacinto@mcc.edu.ph', '$2y$10$cLWd8bspuRNBX6tZ2MlUxuollV85PA9ggVHzOje8.IkMQ1eMbadk.', 'student', 'Hannah Joy', NULL, 'Jacinto', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(69, 'ian.katindig@mcc.edu.ph', '$2y$10$q7.N2ibOC.k3XWk2nu8A.udJdEtrwHxH/tmX0zzzbN7OT9CQSmvDC', 'student', 'Ian Miguel', NULL, 'Katindig', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(70, 'julia.lansang@mcc.edu.ph', '$2y$10$1HjeQJ9mliW96XQh2qzCW.nxShA/pp8z1gYbiGNlqGcl3SmQaCVdm', 'student', 'Julia Anne', NULL, 'Lansang', NULL, 'active', 0, '2025-11-10 12:15:39', '2025-11-10 19:15:39', NULL, NULL, 0, NULL),
(71, 'karl.manzano@mcc.edu.ph', '$2y$10$gsHxS215nra7FF.x52aneucouOSMEf4lL8nNUW8G/pj/vDmKKE4Ga', 'student', 'Karl Matthew', NULL, 'Manzano', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(72, 'lia.navarro@mcc.edu.ph', '$2y$10$e3XWFVuY0aOtQL8Q3C310.9oHnms82K3vUEH7dU8qep3xr8.gL5IW', 'student', 'Lia Victoria', NULL, 'Navarro', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(73, 'martin.ocampo@mcc.edu.ph', '$2y$10$vysmQG.YFuihnflHAQBH6eS4yHwGceVqhMw0bBx2CmLcUIKSeSlhW', 'student', 'Martin Jay', NULL, 'Ocampo', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(74, 'nina.paredes@mcc.edu.ph', '$2y$10$0cEhSKtXyxihWuTWG.vJduFFxh9JcdBRL62jEOecnz.ovMpvFxTVK', 'student', 'Nina Sofia', NULL, 'Paredes', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(75, 'orlando.quintos@mcc.edu.ph', '$2y$10$nPO08Utsn7QnMPMtixy3q.HR7kV3D5FhT7eoKfKwDNXEcvv3xM/H2', 'student', 'Orlando Jr.', NULL, 'Quintos', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(76, 'princess.ramos@mcc.edu.ph', '$2y$10$BztYNu9Y5emb.Xu5foTtyeceHpd4RYFwviwBEEFY7WVepPUSztBke', 'student', 'Princess Leigh', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(77, 'raymond.santiago@mcc.edu.ph', '$2y$10$UZS4AUqIRHgZrQGk6KzzlO38ISaMx703Bo/T2CTYWqBCN3Y41kphi', 'student', 'Raymond Paul', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(78, 'shane.torres@mcc.edu.ph', '$2y$10$Bcv4jsGB8rNQdqfIndpz0eIjaLahU/BjnHX7PEBKbIW0BVyV9QD5y', 'student', 'Shane Elizabeth', NULL, 'Torres', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(79, 'tristan.urbano@mcc.edu.ph', '$2y$10$C.J0v5Z4qKZimrgt.VW1ZebJaBowpHF24pQGtDhCW7YmTBf.5Caay', 'student', 'Tristan Kyle', NULL, 'Urbano', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(80, 'vanessa.velasquez@mcc.edu.ph', '$2y$10$5GCO3K/a/p3a44lRvR2fjOCZ0i2fzMGTTyg1MzLfLyQ3Wy.Q8GKF6', 'student', 'Vanessa Mae', NULL, 'Velasquez', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(81, 'wilbert.yap@mcc.edu.ph', '$2y$10$se4XUrT2oq6C9uA/jxzWGuY2nmLcL6pmgQIVDthmplhoi2WpeFKAy', 'student', 'Wilbert John', NULL, 'Yap', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(82, 'xandra.alvarez@mcc.edu.ph', '$2y$10$wxZZLnF3oNjCSdJ4ssv3nOY4V9qrkPOByR8R7Q/OxTW0Ufg8dZW8O', 'student', 'Xandra Kaye', NULL, 'Alvarez', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(83, 'yohan.bautista@mcc.edu.ph', '$2y$10$SuYOTDMS2IJ10v1tI7V0.OLLl5D0tx6vd04iijPGj61vNnHUS1Aji', 'student', 'Yohan Andrei', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(84, 'zarah.castillo@mcc.edu.ph', '$2y$10$NL1466inaS1UvKLsoMEkNeeO6YF/u5gAx2TyqREkIfEc6hKwA22Ty', 'student', 'Zarah Jane', NULL, 'Castillo', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(85, 'beatrice.estrella@mcc.edu.ph', '$2y$10$WaC84AZ912YwqD8U6Z8go.pk89eFZcHHPmt1VaBcmnJsJXt4RbDfi', 'student', 'Beatrice Ann', NULL, 'Estrella', NULL, 'active', 0, '2025-11-10 12:15:40', '2025-11-10 19:15:40', NULL, NULL, 0, NULL),
(86, 'cedric.galvez@mcc.edu.ph', '$2y$10$mwd7YiN9swM0bdsDKTcKJu2ubgLKYeoXQnsAagBtzuBIq6ebXY0Ne', 'student', 'Cedric James', NULL, 'Galvez', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(87, 'donna.herrera@mcc.edu.ph', '$2y$10$qoZ57HUP.8xu6x/ZkuMxJe6x0vQ8pz06F6cLbYU7GypbblNbGaSQO', 'student', 'Donna Rose', NULL, 'Herrera', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(88, 'emilio.ibarra@mcc.edu.ph', '$2y$10$RFbZjsOEKFKjJ0Ux5l6Tm.uRXQOtdH7rT5FF4Om6dgaqoeLXcYzR.', 'student', 'Emilio Jose', NULL, 'Ibarra', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(89, 'francesca.jalandoni@mcc.edu.ph', '$2y$10$DQdW5zBUHMiQhzDrJIwA0u0Qgr49r7QZZEo9zOb9MMWzIufpdKIWe', 'student', 'Francesca Marie', NULL, 'Jalandoni', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(90, 'gregory.legaspi@mcc.edu.ph', '$2y$10$JJ/H/SeAHQunhoQSOLz4/OtPDXx9IqArQmW8skBRLFdYZ/Nrh7TYK', 'student', 'Gregory Sean', NULL, 'Legaspi', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(91, 'imani.molina@mcc.edu.ph', '$2y$10$roDUsY4wBvtKn50JYy/8leIgNOQI7vYXHT5n8qXKlq1aViQtP0dfy', 'student', 'Imani Grace', NULL, 'Molina', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(92, 'julius.natividad@mcc.edu.ph', '$2y$10$S9GEmh75BVxNsEw2MkHxyOIYYnicxuGjTwghqGxJMHkm/HGAW/Xne', 'student', 'Julius Caesar', NULL, 'Natividad', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(93, 'kaitlyn.padilla@mcc.edu.ph', '$2y$10$RruDygNDucZfqYvZfCsmMOlqHWuWA5hCAYcntJiVcTUepuojDOW6K', 'student', 'Kaitlyn Joy', NULL, 'Padilla', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(94, 'leonardo.salazar@mcc.edu.ph', '$2y$10$qOWWHlu43FeSfkF8ldOGd./Nk5hjrKIxuGz0mA0jyym0ATlJ2FBC6', 'student', 'Leonardo David', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(95, 'mikaela.tolentino@mcc.edu.ph', '$2y$10$SMg7vvi9e4LAzWI/qMwlNuW2fLkM703UNxHvpr1BSWWWdkOxczty6', 'student', 'Mikaela Rose', NULL, 'Tolentino', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(96, 'nathaniel.valencia@mcc.edu.ph', '$2y$10$XatFD2uxwosY846UpZJo9uMJsDRGnQjn3DpWwk9MXW8IzLEq7Mw.u', 'student', 'Nathaniel Jude', NULL, 'Valencia', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(97, 'oliver.zamora@mcc.edu.ph', '$2y$10$0L1OolhGjvywA6x1PRTvV.VgqmNy.ZCRbew5dz2../JuVtxutw2Vi', 'student', 'Oliver Martin', NULL, 'Zamora', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(98, 'pauleen.aquino@mcc.edu.ph', '$2y$10$uDMkNg1eNPvdq/gPusU0EOnyIRhTQRwIVP78t1M8Ps0JvIo5uZxh2', 'student', 'Pauleen Joy', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(99, 'quincy.brillantes@mcc.edu.ph', '$2y$10$o2CPCMpiPz7kqFizGjpOXOyUMTV4TwF0JQ8.OZLiENDkzfruHjomq', 'student', 'Quincy Rae', NULL, 'Brillantes', NULL, 'active', 0, '2025-11-10 12:15:41', '2025-11-10 19:15:41', NULL, NULL, 0, NULL),
(100, 'regina.concepcion@mcc.edu.ph', '$2y$10$b4DY7b6i6wrlmn6vvRuDluIT3l3sj07tHALks9MMgnFKeFzEyiV5y', 'student', 'Regina Faith', NULL, 'Concepcion', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(101, 'samuel.domingo@mcc.edu.ph', '$2y$10$lo/1HMyWsbaeSxorvPeyCOwSA271SufrhFR89fGEa6Spk60TNAata', 'student', 'Samuel Ray', NULL, 'Domingo', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(102, 'therese.estrada@mcc.edu.ph', '$2y$10$f9d7DqMNBgZEkcCW0Z.V7eLL3BVRMjSHT8k2fWB/T2hRnR/F9nQai', 'student', 'Therese Marie', NULL, 'Estrada', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(103, 'uriel.ferrer@mcc.edu.ph', '$2y$10$CAXd1aZr4Cx0hisETzV9wuskxcxSUYSasubZkaBvpJ4zF360dYBRu', 'student', 'Uriel James', NULL, 'Ferrer', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(104, 'violet.gallardo@mcc.edu.ph', '$2y$10$Y3Gj25t7aTq9wSNKJr0P.e9abi94XsKV0eCFKy/5O2sKvlSgR0BWO', 'student', 'Violet Grace', NULL, 'Gallardo', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(105, 'wendell.huang@mcc.edu.ph', '$2y$10$eGdUYQ1/qIo.MLfn9uzTbOamC9Y63WlF9vZmlMRXt0TVfgTIVttyq', 'student', 'Wendell Andre', NULL, 'Huang', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(106, 'xyrus.irving@mcc.edu.ph', '$2y$10$4vrMVF8AFF/KlmoPIrCanuR/Ec78bQjavGsW9r3MfVcV3CgVQiyj.', 'student', 'Xyrus Kyle', NULL, 'Irving', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(107, 'yara.malonzo@mcc.edu.ph', '$2y$10$oJSjMflWYI2WHCutruB4iO.HflHnYW4oYmh7e4X7BzKJ4uewlaJs.', 'student', 'Yara Nicole', NULL, 'Malonzo', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(108, 'zeke.noble@mcc.edu.ph', '$2y$10$Do.MIHhKjzqTsd8N9rU.Nekp2W2JzIz/QLVCRi3.CJSf70CJSksr6', 'student', 'Zeke Daniel', NULL, 'Noble', NULL, 'active', 0, '2025-11-10 12:15:42', '2025-11-10 19:15:42', NULL, NULL, 0, NULL),
(109, 'abigail.pineda@mcc.edu.ph', '$2y$10$Nl81BwhhufU0cKkd3yOfA.bbRUkcgfXb/NJJ6Bo4x8xAZkzMzOtpq', 'student', 'Abigail Rose', NULL, 'Pineda', NULL, 'active', 0, '2025-11-10 12:15:42', '2026-02-09 04:59:02', NULL, NULL, 0, NULL),
(110, 'ana.ortega@mcc.edu.ph', '$2y$10$9ZltQzA4BL8oxrhx7FU5S.Y58EGi7b8/a50kwKF55SdgDHLc1YDza', 'student', 'Ana', NULL, 'Ortega', NULL, 'active', 0, '2025-11-10 12:30:35', '2026-02-14 08:29:26', '$2y$10$VGcXmuonTYoUy.S5E3hP7OvGskZxqpeU5RKJwVZZ.iHJzoqywqxEm', '2026-02-14 01:29:26', 0, NULL),
(111, 'ricardo.lim@mcc.edu.ph', '$2y$10$oO3esbnhLoSBMVVAEpi/5.oT2SZ4ht0cj1N1Bpg/Nug.hAicPeL/m', 'student', 'Ricardo', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:35', '2025-11-10 19:30:35', NULL, NULL, 0, NULL),
(112, 'diego.alvarez@mcc.edu.ph', '$2y$10$RzvrH2OmfCYy8g5rf9YNuu/0eIfT0qnWWPwxU6A3x38lBR7r.QVE.', 'student', 'Diego', NULL, 'Alvarez', NULL, 'active', 0, '2025-11-10 12:30:35', '2025-11-10 19:30:35', NULL, NULL, 0, NULL),
(113, 'julian.sy@mcc.edu.ph', '$2y$10$//yUsNWHi4oBimdkncqP0uhb0MgunJa4PDtINSAPbFT6S152uVm66', 'student', 'Julian', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:35', '2025-11-10 19:30:35', NULL, NULL, 0, NULL),
(114, 'ian.navarro@mcc.edu.ph', '$2y$10$Lv8VW5L/qd6dhQ3Qe3EpYuL2.Z1mOtUZRlNdy/KGPWLZ2uQ/1pPaW', 'student', 'Ian', NULL, 'Navarro', NULL, 'active', 0, '2025-11-10 12:30:35', '2025-11-10 19:30:35', NULL, NULL, 0, NULL),
(115, 'ava.aquino@mcc.edu.ph', '$2y$10$IuK1OPjM8U80QkPaXS0FFOQf1swNvAexMgD3umm7APk/0AyI5vZe2', 'student', 'Ava', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:35', '2025-11-10 19:30:35', NULL, NULL, 0, NULL),
(116, 'ellie.go@mcc.edu.ph', '$2y$10$ZCXB3y0k06FHufahS/V2teJraA/W6IrNYSqzWvQjucKqNnqab1GdG', 'student', 'Ellie', NULL, 'Go', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(117, 'maria.delgado@mcc.edu.ph', '$2y$10$Z6QQ/qH2D7gVhmPvvWdB4.rLJ79g3txauDq2Fvb.Fb00NGw8dUyzi', 'student', 'Maria', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(118, 'isabella.delgado@mcc.edu.ph', '$2y$10$9YeXTq1gfpAKYPumeO6wJuzHOMCQI9MMB4P2HWAhwUtcagchsB.0.', 'student', 'Isabella', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(119, 'camila.delos.santos@mcc.edu.ph', '$2y$10$dQyyKqDYjILaEpQlbSgJoONmz7cr5czVhUS/sPvNRmMYq.RaMVilm', 'student', 'Camila', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(120, 'miguel.ortega@mcc.edu.ph', '$2y$10$b2ey6HQ529Go4V4TvOL9C.IHDeDEeIsYB0Pydxiz8LBHc0UDodJlO', 'student', 'Miguel', NULL, 'Ortega', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(121, 'lucia.pineda@mcc.edu.ph', '$2y$10$Lrym9nnQukuWCWiyg3baBuep.utlPtfKEBCxFqBrIwVi4WDhs4oFG', 'student', 'Lucia', NULL, 'Pineda', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(122, 'stella.delos.santos@mcc.edu.ph', '$2y$10$CWwtdqdzT8m3PYlOZgCSgOc1R9zGLJYz.PlsNbWmvAz5c8E7dpvO2', 'student', 'Stella', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(123, 'chloe.aquino@mcc.edu.ph', '$2y$10$9XuzGkzfSmq79V/usvcvHeJdwOk0F.4WtLgmWUHvwjWNRU5HDvq0W', 'student', 'Chloe', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(124, 'ian.perez@mcc.edu.ph', '$2y$10$cGwyIpiCs2aQUFTTlMJ.I.W8YBeyLc27oRH.BFuiZD6egI/F/C0bO', 'student', 'Ian', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(125, 'ellie.santos@mcc.edu.ph', '$2y$10$tBnqZJMZCgqMXtYkZYYj/OZkVGaYjok.TlnFsylch5n/MLQIk3xUW', 'student', 'Ellie', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(126, 'isabella.rivera@mcc.edu.ph', '$2y$10$SB9FM/e0eE53T8GH7YtLv.mYYBbY39VKIlPitvBbFwbbjdjTmYFw.', 'student', 'Isabella', NULL, 'Rivera', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(127, 'felipe.ramos@mcc.edu.ph', '$2y$10$YL7fpcigO5IWiEzzY21U4u.7cenvcg./.24hvOBBQg71kd0Q4fO.q', 'student', 'Felipe', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(128, 'sophia.navarro@mcc.edu.ph', '$2y$10$2Ctqa1L.LUxOeHXixC.9seKNhaNFiIVq118ZbukRYrgxFn7GmIjtC', 'student', 'Sophia', NULL, 'Navarro', NULL, 'active', 0, '2025-11-10 12:30:36', '2025-11-10 19:30:36', NULL, NULL, 0, NULL),
(129, 'lily.santos@mcc.edu.ph', '$2y$10$vp6PCd.r7tFo9rZa5DL89esN06ox9TFthX4TAOK1.pDcSH33quAey', 'student', 'Lily', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(130, 'diego.lozano@mcc.edu.ph', '$2y$10$.XfW9SMn4H9ukixKorTpWuQqFOmLQ6g9ztgWk6IJXM8Hlrb2pyXNG', 'student', 'Diego', NULL, 'Lozano', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(131, 'diego.dela.cruz@mcc.edu.ph', '$2y$10$3Bx/4FfjwkLH2N77rU0pdeejY.tk.lS88Hv8qoG.gCDgT4Gsi.RBC', 'student', 'Diego', NULL, 'Dela Cruz', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(132, 'marcus.quinto@mcc.edu.ph', '$2y$10$2cRZof65Xzsp0.Nh6baUY.VYpq1ZIRPNI2iQfP9f90uGCllYYg.fO', 'student', 'Marcus', NULL, 'Quinto', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(133, 'zoe.garcia@mcc.edu.ph', '$2y$10$qtvF/qIOUyi0D9Wg6fxNrefhCLiL9Vqrk1ZNbvTm7RupUToLc9DUm', 'student', 'Zoe', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(134, 'lucia.delgado@mcc.edu.ph', '$2y$10$h963tNYSUAuEd/TiIhDLI.SF9FJoLij3UWVGVUMpDNcUncNNYQTAy', 'student', 'Lucia', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(135, 'sophia.santos@mcc.edu.ph', '$2y$10$3OuKz.NQIzcBgagKU2gVreQUd6EPmW.ExrBckxurhILNrmSRQd2Qe', 'student', 'Sophia', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(136, 'cristina.garcia@mcc.edu.ph', '$2y$10$sIq54Bdi.Mvxs2d9kTaB4OEjo8SoIzWUfrtETfro3ebdlx2xEV0xO', 'student', 'Cristina', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(137, 'dylan.perez@mcc.edu.ph', '$2y$10$xLusCvnOsHfGXWSSwUNT9e3qxx6uKZHfS9KB2Yc5YfOsszVPUiXOS', 'student', 'Dylan', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(138, 'victor.santos@mcc.edu.ph', '$2y$10$K.65ATyJZcTui4JznRG1VOm5n/jv178fClxYvF7B09IpYl3Aw7aB6', 'student', 'Victor', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(139, 'diego.villanueva@mcc.edu.ph', '$2y$10$ddPXbQ3m1FxEYE4qr8hgj.5GtAAN6sUDASmU9tR15eAHpOag87vhy', 'student', 'Diego', NULL, 'Villanueva', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(140, 'ricardo.reyes@mcc.edu.ph', '$2y$10$3GlcTUqfhmMtRKvolNg3a.mVL3OeRlRlqcOFWBgwCqv1VI2m6BAgO', 'student', 'Ricardo', NULL, 'Reyes', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(141, 'gabriela.fernandez@mcc.edu.ph', '$2y$10$E.H45zNesHnsyWDlGjvLU.ynRVPurBXot0w8Kvjxy4VFvG0tzXv0i', 'student', 'Gabriela', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(142, 'luis.garcia@mcc.edu.ph', '$2y$10$q1OO3FdOBQvH4Sg//qDeredqTnk3JPlZBeXC/5WtmkRmFWe6TMSBK', 'student', 'Luis', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(143, 'jorge.delos.santos@mcc.edu.ph', '$2y$10$4cejWj.phjNl64jJLoWxWOCSvU1Q2xa6bMdjD/0ZWHbZcEsCOvRie', 'student', 'Jorge', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:37', '2025-11-10 19:30:37', NULL, NULL, 0, NULL),
(144, 'leo.aquino@mcc.edu.ph', '$2y$10$tEoWo5184VhAxWmKz6hWXuQX47TZ7vh.ZxuPntHQHyPLbPb3gDWfW', 'student', 'Leo', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(145, 'nathan.ramos@mcc.edu.ph', '$2y$10$L4XGzrMaJPQ.L32V0VtTbeouxIXwrtnIzl6CqrGAZJrlO7hD/kwEq', 'student', 'Nathan', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(146, 'gabriela.santiago@mcc.edu.ph', '$2y$10$HGpNeDWVOqsc0NdJf1ulve3iFqDYaDP5mvG92WdpRm7dY7gXOGSDG', 'student', 'Gabriela', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(147, 'oscar.lim@mcc.edu.ph', '$2y$10$lxfGFuNzrcc8GhFcaTVLQui49HQXwclHm5nkMQ1ls86/EXgxavhrm', 'student', 'Oscar', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(148, 'mia.perez@mcc.edu.ph', '$2y$10$9fqTsxt2Nfm12pKuMPF7wuXONgEspD3UzrE8i7Zr0CHNJDtZbqjWK', 'student', 'Mia', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(149, 'elena.gomez@mcc.edu.ph', '$2y$10$ShQsDgooIRAoLxHnBpGkzeS1qSRSDRHb8.HiFrQHfD8H/W..WdANK', 'student', 'Elena', NULL, 'Gomez', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(150, 'ana.gomez@mcc.edu.ph', '$2y$10$tHlpjZQlleSw8GDpOAHU1OBICZGYWp9DKHS2G4iIoDpuX71vw72Py', 'student', 'Ana', NULL, 'Gomez', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-18 10:22:47', NULL, NULL, 0, NULL),
(151, 'ava.mendoza@mcc.edu.ph', '$2y$10$pABA8e6y/hrnKPvjw8Heouv2LtgXWFjJATsDnQattdXIyyoSII9bu', 'student', 'Ava', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(152, 'sebastian.alvarez@mcc.edu.ph', '$2y$10$40.uU5bY.UXyAvO4V7Yaq.eo9REmrXOreHLgfcs1wbNtWS.WxOvA2', 'student', 'Sebastian', NULL, 'Alvarez', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(153, 'brian.beltran@mcc.edu.ph', '$2y$10$6pv2rhmneJes3bF6pocxnOBEVyLSoIFuv4082ZvLwpSxITrH0rYvS', 'student', 'Brian', NULL, 'Beltran', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(154, 'nathan.santiago@mcc.edu.ph', '$2y$10$oMur4j7cUFAMOLqhOSfn3OvHLc2QuyJmV7KxDdv/fTbylOXsPDXQS', 'student', 'Nathan', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(155, 'nathan.ignacio@mcc.edu.ph', '$2y$10$O1JguGd0lV/I9S3YvRj2e.JSNFol2nmnFnIFgC6N5NTfA7PWhNSRS', 'student', 'Nathan', NULL, 'Ignacio', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(156, 'lily.rivera@mcc.edu.ph', '$2y$10$fcibbDy/CqFPF0cH7211H.T7tIHvH3yPA3LcehN/wDS.lzbFmZBgy', 'student', 'Lily', NULL, 'Rivera', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(157, 'carlos.lim@mcc.edu.ph', '$2y$10$ZX3SWDpZaZBf5ZJvfKBzhOHEOsx9RfPo8gYX.hdxacphRPM0CFzK.', 'student', 'Carlos', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:38', '2025-11-10 19:30:38', NULL, NULL, 0, NULL),
(158, 'carlos.dela.cruz@mcc.edu.ph', '$2y$10$5RgwKPORf.ylXlnAgbg0Kuxj5sHv9yAxgm0b/Yzq2UmJWKLQVp1hK', 'student', 'Carlos', NULL, 'Dela Cruz', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(159, 'ana.santiago@mcc.edu.ph', '$2y$10$x7AumFpCvIhEDSc2KbW5NOxyfAb41q4tRcPceO4ffP3YJebAUFVFK', 'student', 'Ana', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(160, 'ian.diaz@mcc.edu.ph', '$2y$10$P1jUfUwoVa6ZtIVKz/EsveK.hltkVp64Yfiqgeljs7kVkVcIM9aeK', 'student', 'Ian', NULL, 'Diaz', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(161, 'carlos.santiago@mcc.edu.ph', '$2y$10$mJIZig7GgF3fVEFpJCgmZeR8SWsTmnIYlK3CRetrtyxojmvSJkc9W', 'student', 'Carlos', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(162, 'julian.cruz@mcc.edu.ph', '$2y$10$dVWmr.opMW2MvKGk5w/EwuerYVJpebZ8I3Tz9qywThvMvMoDVUcW2', 'student', 'Julian', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(163, 'chloe.sy@mcc.edu.ph', '$2y$10$iZlkrPlzDq4gfYE7rMxf/OsGDCSwF3ZjWZg9lPpbKaNMAuIjGVMqa', 'student', 'Chloe', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(164, 'mia.sy@mcc.edu.ph', '$2y$10$nmS/2aU2hcSGmOf11PmGtuiveA8vk6WO4tmxw.cxYZZIzv4NexS3O', 'student', 'Mia', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(165, 'ava.diaz@mcc.edu.ph', '$2y$10$ek7OI4yUpyv3Oa391R5/reYVfXPloSeePVthzCZbrId082wsYmZQe', 'student', 'Ava', NULL, 'Diaz', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(166, 'miguel.cruz@mcc.edu.ph', '$2y$10$VLYP7sy60i.YRan/eM0fjOGDeRuPIhYIAeWPVWpkhYVcUTQ/Lh7w2', 'student', 'Miguel', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(167, 'andres.ramos@mcc.edu.ph', '$2y$10$07iXCmOrwY2D6j84rfujOOq50551Vf/cubLD4/618PXDHd3LpPUYa', 'student', 'Andres', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(168, 'andres.medina@mcc.edu.ph', '$2y$10$iKYlhg3mrzRywe06DzQmD.guRSYsDiG2grki4bTCLJikcMmA/6dTy', 'student', 'Andres', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(169, 'nathan.perez@mcc.edu.ph', '$2y$10$HoAR3pU4a5OKfaurVf6rpOV5gOroKygy6aH7x.Yp5SjmVhc2i2wVG', 'student', 'Nathan', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(170, 'leo.delgado@mcc.edu.ph', '$2y$10$.nG/ngRKMaZDZ/LmZHEYK.7IxcDqcotmqxQVNQooocijHu/p/L37W', 'student', 'Leo', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(171, 'ricardo.tan@mcc.edu.ph', '$2y$10$En/d2jrleAUH68gc5c.5veAz4tFE7Oe4sqfSSIaN29wq07cFBiqUi', 'student', 'Ricardo', NULL, 'Tan', NULL, 'active', 0, '2025-11-10 12:30:39', '2025-11-10 19:30:39', NULL, NULL, 0, NULL),
(172, 'ava.santos@mcc.edu.ph', '$2y$10$y9pl4lJT4glN8UpBJNT8p.4iV8naP4PULP6x1.OFTCWi6.GbxXg3.', 'student', 'Ava', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(173, 'chloe.cruz@mcc.edu.ph', '$2y$10$AnqgrrNcHHXSi6LX7qrRre9cqfN29UdaWXqqNgcmsZNTmEmj7nJtu', 'student', 'Chloe', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(174, 'axel.lozano@mcc.edu.ph', '$2y$10$UBju2VyhuwcKtPav.I3BROrTvxWbl3DsbjpaeAu/fg/K4saxyQVZC', 'student', 'Axel', NULL, 'Lozano', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(175, 'sebastian.ocampo@mcc.edu.ph', '$2y$10$bySvMk.ImSpVFioYdR4dGee9mmxqaCissyIkktgqgVQfTqYsf4W9i', 'student', 'Sebastian', NULL, 'Ocampo', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(176, 'leo.ocampo@mcc.edu.ph', '$2y$10$xBOTFbA2m7FzSJHRJzrMh.dufD3gs3fpShlx3ybNkE1RtrkcDwWjy', 'student', 'Leo', NULL, 'Ocampo', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(177, 'jorge.ocampo@mcc.edu.ph', '$2y$10$FiItD.oc4m56/htZZ8bNcOUi8dSuFSS25Lm1AlLHGjE5AN7SXb0y.', 'student', 'Jorge', NULL, 'Ocampo', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(178, 'luis.delgado@mcc.edu.ph', '$2y$10$j1Uy.NJ17hxbRk0fbShZz.dRo8iuPVtvqyCpuSQI.RallHKQDISyu', 'student', 'Luis', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(179, 'axel.salazar@mcc.edu.ph', '$2y$10$6CSOgn44T8ot7lSSw/RLpeBT.Byj4QvnO.SVYzuhGKFK0oQb.ROBG', 'student', 'Axel', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(180, 'stella.fernandez@mcc.edu.ph', '$2y$10$5eCe1/IfHN0dWm3Aiplsv.35o40zwnpwpNLkwtA4duH2D2lZDmdX2', 'student', 'Stella', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(181, 'chloe.lozano@mcc.edu.ph', '$2y$10$ixofoCCbY1N6YWvoKfJrruYBXFW0lAMRlV44qtP3wjgYYOzupb0CC', 'student', 'Chloe', NULL, 'Lozano', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(182, 'leo.mendoza@mcc.edu.ph', '$2y$10$iB6b2BfZ8JepEowWl9KPge/2iwfGL65yrIwPo5HpJtfsUkWb6cYna', 'student', 'Leo', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(183, 'cristina.aquino@mcc.edu.ph', '$2y$10$/92vguj3gZU4.pgBQ4rP3e4nEWyCiIBbjvEOgbShS.SPEG0X/DiYC', 'student', 'Cristina', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(184, 'nathan.gomez@mcc.edu.ph', '$2y$10$xHT0D.QmtCta4HcQQkQl9e5UycfSomiilFt0v1.DVbbeRLtmJaRrW', 'student', 'Nathan', NULL, 'Gomez', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(185, 'andres.rivera@mcc.edu.ph', '$2y$10$hDWxIrKxTh6Ad7ZBUOvbDOLPOVe.q0/RV3jFx3p/hGj4qKpCm0L4i', 'student', 'Andres', NULL, 'Rivera', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(186, 'sophia.sy@mcc.edu.ph', '$2y$10$3anl6UAZ2EnumB3rGZRzteKfPQq3dgWTh42/eRGhXQk.6aaGJpzNe', 'student', 'Sophia', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:40', '2025-11-10 19:30:40', NULL, NULL, 0, NULL),
(187, 'luis.medina@mcc.edu.ph', '$2y$10$8ZhMcWozItV/rWZpceYqfeLrtXu1eAnSTtz3mYXdKKxOhGNo5L/3O', 'student', 'Luis', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(188, 'stella.katindig@mcc.edu.ph', '$2y$10$vBB/kEgfia0taz8tZNsIZOGqhhweyxqRDcCbpruy/c1/Pb0GCFbOW', 'student', 'Stella', NULL, 'Katindig', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(189, 'marcus.lim@mcc.edu.ph', '$2y$10$FRoTN67zYiT.TET97efoT.lBQXHjZVONV8njSq1x8Yy/SVkiP2DdG', 'student', 'Marcus', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(190, 'axel.santiago@mcc.edu.ph', '$2y$10$8tibOWJt.2HwEH61Xo0RNe1rRhcxz4wGwmT/AmaYs9z/svSnlD6rO', 'student', 'Axel', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(191, 'ava.medina@mcc.edu.ph', '$2y$10$5gkZOaWQJ/HV8eQeZ4Z7u.vw5EWqCVbgBF8C/cmFltYt3JNS1lSYi', 'student', 'Ava', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(192, 'ana.torres@mcc.edu.ph', '$2y$10$cFmE2Nnm552VOeHd4cYQROM5Y1VYgxWZGlghyDDfzFHSdjDdn0jkK', 'student', 'Ana', NULL, 'Torres', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(193, 'maria.villanueva@mcc.edu.ph', '$2y$10$tAnYVNu/bd5IFJMJ./QjMO5IIMHRGbGn3HtiaSEP/9T2yV/.nzTA2', 'student', 'Maria', NULL, 'Villanueva', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(194, 'brian.rivera@mcc.edu.ph', '$2y$10$xFzta20hl6XQvMUXUc8v5.KZmEaY5S1/cQAhoY0aw0My8giu3p3NG', 'student', 'Brian', NULL, 'Rivera', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(195, 'nathan.ortega@mcc.edu.ph', '$2y$10$YxU9VaEFwoj02IoytvovweNQ/jI.XOMEgGqp6fZTUAlYk0s3ix6Xy', 'student', 'Nathan', NULL, 'Ortega', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(196, 'cristina.katindig@mcc.edu.ph', '$2y$10$rsoojUmE7nK7lWsaR5c.VOEZ2giJ365NPQ.BCYf.G4qKB1Ome.iom', 'student', 'Cristina', NULL, 'Katindig', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(197, 'jorge.torres@mcc.edu.ph', '$2y$10$ANAvQm.AKIRRZX8U/8qAkePDBTaAn09SjGcTLfBYV5ouO3MCuXKuC', 'student', 'Jorge', NULL, 'Torres', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(198, 'leo.bautista@mcc.edu.ph', '$2y$10$3n1cxdSzFIZnTES3SFkbJOdIP6x2B0eWiD/W/PA4wz1GKde7Hlliy', 'student', 'Leo', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(199, 'stella.medina@mcc.edu.ph', '$2y$10$Bn7CpqX70W9gKzDaVl.ARe6raegJBu9MnSC4DP/HzgxccKdKm583i', 'student', 'Stella', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(200, 'jorge.ortega@mcc.edu.ph', '$2y$10$qS/.Q9UBgzwWgyUZaTC82ePg09wW/zX6gV0kKm3TdEw/dacDJ0oA.', 'student', 'Jorge', NULL, 'Ortega', NULL, 'active', 0, '2025-11-10 12:30:41', '2025-11-10 19:30:41', NULL, NULL, 0, NULL),
(201, 'cristina.tan@mcc.edu.ph', '$2y$10$hfwxrB30oCz5WZFRwx2KBO19dzH4HSZ9buG1RrPinrkzZKck.gQlG', 'student', 'Cristina', NULL, 'Tan', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(202, 'stella.rivera@mcc.edu.ph', '$2y$10$dR3iI5yfyiyXrfKYJsgQO.Dejobx5lwJqzclSP2OcBnUCpjvOzye6', 'student', 'Stella', NULL, 'Rivera', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(203, 'julian.ignacio@mcc.edu.ph', '$2y$10$tEsIbgvvrSq/SAlEjs/Onutv6HwSA92GsEKgFRSp0F4AF87JXWTXy', 'student', 'Julian', NULL, 'Ignacio', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(204, 'sofia.bautista@mcc.edu.ph', '$2y$10$h4M918HFbQ5TnoeGxWkAq.37Kpw4NWKkDsi0ZOvUb9s4otxFj06MG', 'student', 'Sofia', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(205, 'nathan.mendoza@mcc.edu.ph', '$2y$10$bUQRSBVxJuJwq5rkNrZRleIjrB4UBROx7ySSzO9ST4KgnP.fMH.g2', 'student', 'Nathan', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(206, 'nathan.delos.santos@mcc.edu.ph', '$2y$10$kc/XCUJOlrHiomyHhokDBOGp/NEM4.x3R8BuWoh4Q8DHF.1AbOxAK', 'student', 'Nathan', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(207, 'jorge.tan@mcc.edu.ph', '$2y$10$CP.Te3UH3fPT5Lvnt.agfe51QU29Azq7YACLWFndPRq65pjdigC5q', 'student', 'Jorge', NULL, 'Tan', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(208, 'oscar.uy@mcc.edu.ph', '$2y$10$WuxxVDI46Fl0HV0FhZZTHOzJipN7dYUmxzJcvnPt9wCxiuIesfEwW', 'student', 'Oscar', NULL, 'Uy', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(209, 'cristina.lim@mcc.edu.ph', '$2y$10$8QfaQtyTDlJmgT91ANCgEOpUTmUMPR1CrDcBmskOdnIZXpkfYufX2', 'student', 'Cristina', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(210, 'gabriela.torres@mcc.edu.ph', '$2y$10$UJXily9ApB9CH0w0gVWa/ev7LQOCEkLpfMWdGjh1PVhuejWaDc7uS', 'student', 'Gabriela', NULL, 'Torres', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(211, 'ellie.rivera@mcc.edu.ph', '$2y$10$XSlC7QoQmsTE.dBgqrQjZ.CaS0WukkD/QQt7/YA9jI5TdrpHjh5T.', 'student', 'Ellie', NULL, 'Rivera', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(212, 'dylan.bravo@mcc.edu.ph', '$2y$10$I/2UvqCqwJalfgP2rjzkkeJ7rX2RoVGl11QsnHchx5z78uGJcjRgS', 'student', 'Dylan', NULL, 'Bravo', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(213, 'oscar.garcia@mcc.edu.ph', '$2y$10$S9BYkd723SuKan9oYt4p8.7NirYpV7hdBADWsl2mEblqHIBL4nW..', 'student', 'Oscar', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(214, 'nina.medina@mcc.edu.ph', '$2y$10$0Kruj1cP/doFfDkHPhMDy.2yUn536q9gkE6HIQhDfNJLI3dqdnWDe', 'student', 'Nina', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(215, 'mia.huang@mcc.edu.ph', '$2y$10$LndX0/I3IX4D/WZ58cyryepiIHTrbm3NtD1jzfCwQaJn9mhntMR7O', 'student', 'Mia', NULL, 'Huang', NULL, 'active', 0, '2025-11-10 12:30:42', '2025-11-10 19:30:42', NULL, NULL, 0, NULL),
(216, 'isabella.alvarez@mcc.edu.ph', '$2y$10$p2EVctSTRnd4UpYepDNgfea5MKaIW1Tp6iOV8ypkCRWoJq7pUsD0y', 'student', 'Isabella', NULL, 'Alvarez', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(217, 'mia.quinto@mcc.edu.ph', '$2y$10$6v4z2o130mC8QLi0C7v/9u5pxVj3383ArXgH16/2skmn3pfNReUwm', 'student', 'Mia', NULL, 'Quinto', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(218, 'andres.uy@mcc.edu.ph', '$2y$10$dkNqnWKVBiPia7BFJgTDLO6IvrwR3qneHyf8OdsPkMVoHG1d/.1eS', 'student', 'Andres', NULL, 'Uy', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(219, 'maria.uy@mcc.edu.ph', '$2y$10$qctTeH8Xf4PvFARehPDb4eiD//KNEnuZRhaMzk/Qjf3YJiYfVv7pu', 'student', 'Maria', NULL, 'Uy', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(220, 'ricardo.ramos@mcc.edu.ph', '$2y$10$LXmAppKZiv5SRosloS1lV.zJ2nFUhUXYr0iXlpklKhMwFl94/nKSS', 'student', 'Ricardo', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(221, 'emma.salazar@mcc.edu.ph', '$2y$10$VhJrZCureVjidPNNZ9IyYulORdGvhlwTip//zVPJ4WOrDOIRMii66', 'student', 'Emma', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(222, 'andres.dela.cruz@mcc.edu.ph', '$2y$10$cfX9Tt4UKWDa2WsmOOGSYu5zRp1ycQ1MHOXZx/iJAHwk4RqZWkabq', 'student', 'Andres', NULL, 'Dela Cruz', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(223, 'oscar.reyes@mcc.edu.ph', '$2y$10$JNj.p9tugyODl2DQJ602meO3XV2F5g3XFfvdeR9PiNOvz8cMOGTkm', 'student', 'Oscar', NULL, 'Reyes', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(224, 'lily.perez@mcc.edu.ph', '$2y$10$d6cHK9MusOK9J2bq9EEiAOcqwMDoaHm0ay3m1fGASdm42furLC0em', 'student', 'Lily', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(225, 'isabella.lim@mcc.edu.ph', '$2y$10$Y3jf5xF6X11STfDCCY1fxOJtU20gd25z6rTRse4BHeAieudijun/K', 'student', 'Isabella', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(226, 'cristina.medina@mcc.edu.ph', '$2y$10$dKWR3XHJ1kuJ4VOz4u2tIu6jI19KjEgt1R7upnLUhb8j3cNREax2e', 'student', 'Cristina', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(227, 'ava.go@mcc.edu.ph', '$2y$10$RrhfVp7JoDCufYit4NDvT.hh3gdt6sjNSaZzMBWK9.UnZ3.QTxQ/W', 'student', 'Ava', NULL, 'Go', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(228, 'emma.pineda@mcc.edu.ph', '$2y$10$0U50dSH25gvFe9hs5sOQJOBuVHI/8rBLBWcCWlk2Qm2nWBsOV8u1y', 'student', 'Emma', NULL, 'Pineda', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(229, 'ian.fernandez@mcc.edu.ph', '$2y$10$S3G4nIkCRgSOlofGrBfqzuv2AOzyxUK4YalMvROqrB50o0abyOVna', 'student', 'Ian', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:43', '2025-11-10 19:30:43', NULL, NULL, 0, NULL),
(230, 'ava.garcia@mcc.edu.ph', '$2y$10$5YSIjR1CKwuSDr90.2BanecyOtByXkrfRlsMrdsDJIFUiMpLUgiPu', 'student', 'Ava', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(231, 'stella.santos@mcc.edu.ph', '$2y$10$5RpO2DktXN9Y5MWPdmWPu.JXCNH8OIGpM770keOI6ftLYR2Zti.1K', 'student', 'Stella', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(232, 'camila.beltran@mcc.edu.ph', '$2y$10$RXT/7iHAy92E157yYOgV/uohko0R7BKuLTKwyJ7Vx2PzjXOxnmKhu', 'student', 'Camila', NULL, 'Beltran', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(233, 'isabella.perez@mcc.edu.ph', '$2y$10$kkF72.TOY3iW.yMiXY.bjOZGD1xDYqDcCEPs9hFG/qvvGhCWn7GfC', 'student', 'Isabella', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(234, 'emma.santos@mcc.edu.ph', '$2y$10$79ENSumESqqiwfGaMdWDTOSNURr0K5oYDYntoXvmTZ/1qNzJGGp4W', 'student', 'Emma', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(235, 'lily.sy@mcc.edu.ph', '$2y$10$4of6Af5AMvL530BOsKyBNuS.U1crd0KDJZ1ZUmLRM8pTPSbnAD5jS', 'student', 'Lily', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(236, 'zoe.lozano@mcc.edu.ph', '$2y$10$Fq7Y1Jg1jiILsKSH5fLtMuz3V345ttCeAgxV3MKgl5HjaecPohrnO', 'student', 'Zoe', NULL, 'Lozano', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(237, 'isabella.delos.santos@mcc.edu.ph', '$2y$10$44fGnBH17F3XiS4Yur6v..7ygyGbT1T1qNjLQ/lXOrRMMW.yADII.', 'student', 'Isabella', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(238, 'sebastian.mendoza@mcc.edu.ph', '$2y$10$G9IuKGAAWBjUj7irGBku9e1V1nQ1q39lk7G4oKYwEUK3umgovgUjm', 'student', 'Sebastian', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(239, 'miguel.santos@mcc.edu.ph', '$2y$10$YXmxTcDT.eEii0PULE4mLO/KwWYxn9CSZih47UTfL2Seps2Bs1tQu', 'student', 'Miguel', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL);
INSERT INTO `users` (`id`, `email`, `password`, `role`, `first_name`, `middle_name`, `last_name`, `phone`, `status`, `must_change_password`, `created_at`, `updated_at`, `payment_pin_hash`, `payment_pin_set_at`, `pin_attempts`, `pin_locked_until`) VALUES
(240, 'chloe.villanueva@mcc.edu.ph', '$2y$10$RozhBIXn/NscEtDV3Qz38eOB78K9jJVFBDfdhX9e12kpelkgJ1e3S', 'student', 'Chloe', NULL, 'Villanueva', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(241, 'elena.manalo@mcc.edu.ph', '$2y$10$ojDM10TusYjQmQ.Z/uzNR.9.uUGh7MNwKIkCjr.TFeMeZGwi4SQXS', 'student', 'Elena', NULL, 'Manalo', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(242, 'emma.bautista@mcc.edu.ph', '$2y$10$bFNQc4UtddMaNiLy06/K8./gAxHJXQPSFs9SteVEIK.KLyNTHZ0g.', 'student', 'Emma', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(243, 'ian.villanueva@mcc.edu.ph', '$2y$10$8VaaE4jX9FOcYs/iXhqSVOaInWWe7WEmNFxGErm8yywPt6FmbWpya', 'student', 'Ian', NULL, 'Villanueva', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(244, 'oscar.mendoza@mcc.edu.ph', '$2y$10$7IU65frn8ZeTNX7n7.rH6ekwrJ4aX8/SDZy1u39c0or3t5HNm48lm', 'student', 'Oscar', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:44', '2025-11-10 19:30:44', NULL, NULL, 0, NULL),
(245, 'sophia.lim@mcc.edu.ph', '$2y$10$Ap1Ba61K2lIzHctXAoFO2.EdhjjM6D5N9RrKQKL2ol2bFQOc0n6pO', 'student', 'Sophia', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(246, 'andres.salazar@mcc.edu.ph', '$2y$10$fB9.NUTS0sd4b/B2bvwWeey7MT2WeqWjsynygDnuB6eO1hC0lBR2G', 'student', 'Andres', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(247, 'nathan.aquino@mcc.edu.ph', '$2y$10$ZGaPAePTHKDeiBceXvNbrORzFSpueUTthr/SBAcC2rfCEVR0IDQp.', 'student', 'Nathan', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(248, 'brian.bravo@mcc.edu.ph', '$2y$10$vOlyrZjQsQlhuRuZsQCaAeycSNZiuVdYdPD9tL4mcF7xt0LuM77z2', 'student', 'Brian', NULL, 'Bravo', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(249, 'lucia.cruz@mcc.edu.ph', '$2y$10$4/wT3mKiJVMdvfCwcqSDOOG5XSRVYxs0V9T8RqSiWqwv28QNOFIB6', 'student', 'Lucia', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(250, 'victor.go@mcc.edu.ph', '$2y$10$PeHt64OQHl/wLIJSeSmulOSbU9tAr5oLOGRf8eGqYx.nF.ARlRDO.', 'student', 'Victor', NULL, 'Go', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(251, 'sebastian.fernandez@mcc.edu.ph', '$2y$10$on4rnAfl0hVutARz3fdno.IjtL/pbf5sbxCVB3qxG6I97hsApMViO', 'student', 'Sebastian', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(252, 'ian.ignacio@mcc.edu.ph', '$2y$10$qUvAi/i6FZ0PnzMczeO0Z.xzfQ79LIzMIOxpX19bL8uw5ro9WxhF6', 'student', 'Ian', NULL, 'Ignacio', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(253, 'diego.bautista@mcc.edu.ph', '$2y$10$RWWg5f5xFgTcsboF3ZoamOPw5c4GRsV6gbQye6.IN4vLgvcN6iHB2', 'student', 'Diego', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(254, 'jorge.sy@mcc.edu.ph', '$2y$10$cNdCP5v3enSpe38.NRvYru46URbP/91pAxe8J9WbGGkj2wlz5O6BO', 'student', 'Jorge', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(255, 'sophia.quinto@mcc.edu.ph', '$2y$10$E4/3YOK6sA18uJHnGM/yz.8gTqOmptkJLOohdsCFkMcbVDDJ25iZC', 'student', 'Sophia', NULL, 'Quinto', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(256, 'emma.medina@mcc.edu.ph', '$2y$10$sGYSOYkRmS8B3H9bq6dseOYV9K8wNWTeSJUnNoIPi5vcet3s0BVSG', 'student', 'Emma', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(257, 'ricardo.ocampo@mcc.edu.ph', '$2y$10$SRJRYtYCsVTBtPZJASsJGOBlue7NRsZpKFO/y.DRVTLN1TUQcqcqu', 'student', 'Ricardo', NULL, 'Ocampo', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(258, 'julian.ortega@mcc.edu.ph', '$2y$10$wb0gEVZFObyD8kJFqUlJUeTB.ya9pcYz2EVhBAwf0BEDP311G8Uii', 'student', 'Julian', NULL, 'Ortega', NULL, 'active', 0, '2025-11-10 12:30:45', '2025-11-10 19:30:45', NULL, NULL, 0, NULL),
(259, 'andres.cruz@mcc.edu.ph', '$2y$10$aKCRjeNFvoCEjiNwRPms9.FJWSKK.QS4QdgiPQV3DLlKglCAdiYOO', 'student', 'Andres', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(260, 'cristina.fernandez@mcc.edu.ph', '$2y$10$amUk9buUSoczA7xDbok.d.h0Spfz76nNCejy46u373DiFxn/ZpRlS', 'student', 'Cristina', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(261, 'marcus.medina@mcc.edu.ph', '$2y$10$UMw9BWGs1phQ.cEUGYfOUeIvvTYzuV/tTP1q/T9QkjeMKEoC0G4ra', 'student', 'Marcus', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(262, 'elena.sy@mcc.edu.ph', '$2y$10$OZ8XRgrDChQtK.ZlUsEZ2eDRmn/tkOizgPm9Ndn9f7is0enwicuIe', 'student', 'Elena', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(263, 'ian.beltran@mcc.edu.ph', '$2y$10$nGvq6ShY80NZMFJWdSkzQuaXFZEY8gDdvjnBQT.5EZk8Kq0Gl6rRa', 'student', 'Ian', NULL, 'Beltran', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(264, 'chloe.salazar@mcc.edu.ph', '$2y$10$WVTAp2apHvfucSlHaaueIegMxa47qL5NjugvH/NSQBQMNwajwR4K.', 'student', 'Chloe', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(265, 'sofia.santiago@mcc.edu.ph', '$2y$10$5oDw/iSze/FjjE/tsJnMMOiKgzj1SCjsx8sPutbmI39MKwDWs4RcS', 'student', 'Sofia', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(266, 'chloe.navarro@mcc.edu.ph', '$2y$10$IH.8yCwsji1kX5id8ZTsbeGrJoXgGnAu6FX3WQHAqaFPDvbk0FIAe', 'student', 'Chloe', NULL, 'Navarro', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(267, 'lucia.santos@mcc.edu.ph', '$2y$10$VUskD3FBIgQDxGbrzNfBbODuaKnX51ePR5IoBWTfXWFGh1nGzm8ru', 'student', 'Lucia', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(268, 'luis.ignacio@mcc.edu.ph', '$2y$10$QnZyNQ9JbDVU5eN5GwBo6.ah2ihms8g86qf0UbyvC0dQl90U8V6Ny', 'student', 'Luis', NULL, 'Ignacio', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(269, 'luis.uy@mcc.edu.ph', '$2y$10$P.NrWf8IzHwrVU2hpR/DYOBhTa7p2P2DqMkhDG6Yz4kgJtvUEl5M2', 'student', 'Luis', NULL, 'Uy', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(270, 'chloe.manalo@mcc.edu.ph', '$2y$10$vyiJnouwsLmew9q4mCRBZesW5NLgpNaDgHKjCNSIiB/8v6v8231Pm', 'student', 'Chloe', NULL, 'Manalo', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(271, 'brian.gomez@mcc.edu.ph', '$2y$10$KXHSjfyyYu/J1h58aF1SkOfWNo.zt1uv2XOv5oToUrJRq/2RAzUp6', 'student', 'Brian', NULL, 'Gomez', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(272, 'luis.huang@mcc.edu.ph', '$2y$10$gHIMqFzn1m2unptNOXX1/./.MI.2eOUGE6kxa0MyKcE4FqrVfehWe', 'student', 'Luis', NULL, 'Huang', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(273, 'nathan.alvarez@mcc.edu.ph', '$2y$10$djGGyZxyBcmj8xGDhzKUfO1bFfdtQacYJeNaIJefk2Hy1kz7WGRvK', 'student', 'Nathan', NULL, 'Alvarez', NULL, 'active', 0, '2025-11-10 12:30:46', '2025-11-10 19:30:46', NULL, NULL, 0, NULL),
(274, 'chloe.reyes@mcc.edu.ph', '$2y$10$BLPMq.K7k.XQxr/FmDrVbOFmOl0O8XzkMkCbzlxL6aYVCKDfJ5RU2', 'student', 'Chloe', NULL, 'Reyes', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(275, 'jorge.uy@mcc.edu.ph', '$2y$10$xSP.qL6yg6zzLKFXFZy6QOpaTEdI27ZGtVdZHSPSOX.Cf/80ay0HK', 'student', 'Jorge', NULL, 'Uy', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(276, 'ian.manalo@mcc.edu.ph', '$2y$10$GyRg7.kDe0zbEmWB6PmWbujXYfXMIKyxMmwwbEWZ5aoy0INciAUAy', 'student', 'Ian', NULL, 'Manalo', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(277, 'axel.pineda@mcc.edu.ph', '$2y$10$TkgxoebMjTAKNLNt4NcC8Oqe2yBUf1v/JCWcYzNsFjmhERs/gC4bC', 'student', 'Axel', NULL, 'Pineda', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(278, 'chloe.mendoza@mcc.edu.ph', '$2y$10$2lqR427Oh/PEJpxHOAlCkeFWc9tDQ/BsVSl.XQT8uhp.wkwxfJ5Mu', 'student', 'Chloe', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(279, 'isabella.ramos@mcc.edu.ph', '$2y$10$Ex6LlVfDA5C8ztGA/VeGqOafvHlUXmV1Q4JPK43a5EyC95LUl07la', 'student', 'Isabella', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(280, 'maria.delos.santos@mcc.edu.ph', '$2y$10$w7YVsGlzzwN6qqewh./MKu795ABD1DM/kphxViLXWpeofOALxj3Cu', 'student', 'Maria', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(281, 'felipe.fernandez@mcc.edu.ph', '$2y$10$rMwr8ItwaK1X04muL190U.oY6e5YicxpM4RW98q6ktEiGUnqjVMVq', 'student', 'Felipe', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(282, 'elena.aquino@mcc.edu.ph', '$2y$10$6p/dn2X0Mrs27HdQmpEZ7.6eFBriSR.5nJLonW.dkiqRrxLburmHe', 'student', 'Elena', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(283, 'maria.bravo@mcc.edu.ph', '$2y$10$8MgjrftnnszBDgLfl9AeFeIXdVifAjbmOQ0m.OQQy6AUpxyS053oq', 'student', 'Maria', NULL, 'Bravo', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(284, 'victor.alvarez@mcc.edu.ph', '$2y$10$5b2sMFpAc/5BuDTjQARupuGBEtqTX6A3NXd5BXN0fo8VSn2xs8FpG', 'student', 'Victor', NULL, 'Alvarez', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(285, 'luis.lim@mcc.edu.ph', '$2y$10$OSUl40mJM5DB5UtakEkeIuTFPb2FilnJYAdivYwRloJPqJr2G9JcW', 'student', 'Luis', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(286, 'valentina.cruz@mcc.edu.ph', '$2y$10$m8U2U9bOzTtZbxKgI9AFa.ee8PO.PIOT4DjbLtUKv/8XxKHicnLlO', 'student', 'Valentina', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(287, 'nathan.beltran@mcc.edu.ph', '$2y$10$KWTkyoixrEhQ2Evs/B/DgOfYC01MGcjNi6uVdCpevRrzXkfjgKRJm', 'student', 'Nathan', NULL, 'Beltran', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(288, 'nina.fernandez@mcc.edu.ph', '$2y$10$.uC6OipkkMkMBk2/4WT.jOaWt3xV0mru3g3/kvWk97H0ODbkFGb1m', 'student', 'Nina', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:47', '2025-11-10 19:30:47', NULL, NULL, 0, NULL),
(289, 'ian.salazar@mcc.edu.ph', '$2y$10$z0gtaLcG2/cp7/K0Sv3sM.iDdLbxvJvYDRfDsGlGRG06HH239Qju6', 'student', 'Ian', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(290, 'gabriela.delos.santos@mcc.edu.ph', '$2y$10$TwXGJhupvxyNnwsNZiY84uXpU3kcLWB99IoaFCt/u9qrKO/DbzbQW', 'student', 'Gabriela', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(291, 'camila.mendoza@mcc.edu.ph', '$2y$10$JG9ebse8qzAz8E58GRvnTukoXyuJTCRaPmTysFU8Z69WbSG8LzMC2', 'student', 'Camila', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(292, 'marcus.santos@mcc.edu.ph', '$2y$10$NJ5.pcYoSnWamTfRIMqVDORKgmUg6i7hA5rCCXrh6/px5Q1QakJTG', 'student', 'Marcus', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(293, 'juan.castro@mcc.edu.ph', '$2y$10$j5uuZ8INhECFQC/RFx7eTOOYO2gT.xs6cMi66tuSrkwIk/lG8Ofge', 'student', 'Juan', NULL, 'Castro', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(294, 'emma.fernandez@mcc.edu.ph', '$2y$10$3E2tFjuNKhpjWh5q25FzJuJod2/MKzu4dWDtVOUI3IhJMCaR0asJu', 'student', 'Emma', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(295, 'andres.manalo@mcc.edu.ph', '$2y$10$oXa5LmkFncALXarzwsb1SezP4JscuDXL/c4MXJRr46CBG9FLEadHC', 'student', 'Andres', NULL, 'Manalo', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(296, 'mia.aquino@mcc.edu.ph', '$2y$10$gM9dWBXSV0lWoKJN7GL4CeRbhotsG/cS9LMmjiTLKPR3ItqA5dnba', 'student', 'Mia', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(297, 'marcus.gomez@mcc.edu.ph', '$2y$10$4eWjl3RNGbojtKSmpyaBke9j0SkdsobXWvOw.AmCys9CgYa.MVME2', 'student', 'Marcus', NULL, 'Gomez', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(298, 'andres.diaz@mcc.edu.ph', '$2y$10$veiNWID2DjAfy6K5uexeHucRUdYYVbGh9c5BroxzEg7LA1rYivkJu', 'student', 'Andres', NULL, 'Diaz', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(299, 'ellie.alvarez@mcc.edu.ph', '$2y$10$PqvmuT0zBLAAxOA8p7SxTumnHu9WiVx2O1xz0cVe0.WLvgt9pNAkW', 'student', 'Ellie', NULL, 'Alvarez', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(300, 'isabella.ignacio@mcc.edu.ph', '$2y$10$zganDea5m0YCpYRAvoTDm.GT2TNpi.E7zXWo8kxFxDe34CUjKDe.2', 'student', 'Isabella', NULL, 'Ignacio', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(301, 'lily.huang@mcc.edu.ph', '$2y$10$JO.acPWALoINfn5g44Z51.cpgHTyYTJMIO9W0.XuFiqwZ4p8DZg1C', 'student', 'Lily', NULL, 'Huang', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(302, 'leo.salazar@mcc.edu.ph', '$2y$10$6NeCkVp2PM6rIp1cgkr6Cux8PG9kCjGor5T/ZlO/0yKBqxJ/rIWsy', 'student', 'Leo', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:48', '2025-11-10 19:30:48', NULL, NULL, 0, NULL),
(303, 'camila.santos@mcc.edu.ph', '$2y$10$n/zm9GOJAfvDTZs5NIZX8ezU/1V5e.lcqcUOPoofDLBqyVuWOG3Yi', 'student', 'Camila', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(304, 'isabella.cruz@mcc.edu.ph', '$2y$10$VKn7fG/7xmSayDkRC63vYuoZFXNX47D3YNxK4V9WH8k93M2aIY0Qe', 'student', 'Isabella', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(305, 'nina.beltran@mcc.edu.ph', '$2y$10$ALhxBKcV72/Q3uqOnv.jB.0iwtTf9WiCs9AvcNMwSS7Frb5w.T9Pi', 'student', 'Nina', NULL, 'Beltran', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(306, 'sebastian.reyes@mcc.edu.ph', '$2y$10$f7ap3Ldh/0UOTdkM89EkRucNRjVYZ8pUML0xTemwQF41BH/.T82Em', 'student', 'Sebastian', NULL, 'Reyes', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(307, 'ana.santos@mcc.edu.ph', '$2y$10$SpapZhthzPExKx9.X91pUO.iz0FYW3FSw6PzKj3sV6T4FEYM9Z8/a', 'student', 'Ana', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(308, 'lucia.garcia@mcc.edu.ph', '$2y$10$XWFoWZ3CYMEhnx89XqgGMuW5f9gMTjwYULcr2Bl.M5UG9Sdo1Tl/O', 'student', 'Lucia', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(309, 'camila.santiago@mcc.edu.ph', '$2y$10$PmwuPkJcuOOF2TUs6MUjo.HqCnS/6jB5hMeoB/tju.C5rp9XRWJIG', 'student', 'Camila', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(310, 'camila.villanueva@mcc.edu.ph', '$2y$10$KbRAMosF8IBQC4OpSo.PUeAt2BqADKUYiaQ7AKLeI8XyYtlWyakHi', 'student', 'Camila', NULL, 'Villanueva', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(311, 'ricardo.santiago@mcc.edu.ph', '$2y$10$ZmL/q0HOgcwuh0ESQcOzj.zwBskIMH4dkO6MiFH0D9Z2GNeQvddYq', 'student', 'Ricardo', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(312, 'elena.santos@mcc.edu.ph', '$2y$10$o8b371BaNTBthCZta7MsWeEVzeupUIFNHZebqF4LeC6vXsbkR9QJe', 'student', 'Elena', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(313, 'sofia.bravo@mcc.edu.ph', '$2y$10$OhSruXnylDumcbo9jsUSjOEC21pVcuTfzhU3FP5YlPr/K/K2n.3L2', 'student', 'Sofia', NULL, 'Bravo', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(314, 'brian.santiago@mcc.edu.ph', '$2y$10$/Pi/2lxuuKqBtaOcED5Xn.9c6HpUd7Mr7g6egOY0ePPm8f6M5Eo62', 'student', 'Brian', NULL, 'Santiago', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(315, 'emma.torres@mcc.edu.ph', '$2y$10$zAFGHsDPmVjfNKIlNVfU5eC7LBrJB1gGjPeP8IKhld30jsjaLbMEm', 'student', 'Emma', NULL, 'Torres', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(316, 'chloe.santos@mcc.edu.ph', '$2y$10$7B6iFc11eiMqGrsZH1veiOYk0AV.EfIY9C9zkaG6ElhHR8/k1DEbi', 'student', 'Chloe', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(317, 'carlos.delgado@mcc.edu.ph', '$2y$10$NjwvPjwS14g9Xz.1BgbTyOmA0PaS3rXWImW80mlHDDomRZc.scQnG', 'student', 'Carlos', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:49', '2025-11-10 19:30:49', NULL, NULL, 0, NULL),
(318, 'carlos.aquino@mcc.edu.ph', '$2y$10$bzrNH1TdrgHZ69.5tRUepuwObZxubQlI/bF3NOOhc1BNXEn4EAl2W', 'student', 'Carlos', NULL, 'Aquino', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(319, 'lucia.castro@mcc.edu.ph', '$2y$10$jSnoJv/vD6DkqHm8HhScBOzMMVgrUbUpvQ9NxxyAyPbTW3sF/ys/O', 'student', 'Lucia', NULL, 'Castro', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(320, 'sofia.ignacio@mcc.edu.ph', '$2y$10$T61hx8/lwIsx2mmPmzthr.W9HzWDMqNSXITc9WGSiQZt3N2hBkQ3i', 'student', 'Sofia', NULL, 'Ignacio', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(321, 'brian.delgado@mcc.edu.ph', '$2y$10$3IWAvK/1OCHyQsnYKmcmueL8N0Re0kBvW5RRhR59g3cM7jvfRsDjG', 'student', 'Brian', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(322, 'maria.huang@mcc.edu.ph', '$2y$10$iw1sXN99T4ujWQVMZYIcpeK/2VpunqtzPtu1VeHKXGKoJv44IsNx6', 'student', 'Maria', NULL, 'Huang', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(323, 'axel.garcia@mcc.edu.ph', '$2y$10$Z7eSCP9bBohFT3cN9Yr4/eaIJmp4uujoj7sA7yS12rv6fhqp.onk.', 'student', 'Axel', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(324, 'felipe.rivera@mcc.edu.ph', '$2y$10$S7p60NoGtS5vMowgmWbMB.9jpaQDHdtfmt3sT2OLHQFuDOo0gVCK6', 'student', 'Felipe', NULL, 'Rivera', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(325, 'oscar.santos@mcc.edu.ph', '$2y$10$7hRqJBobkwdqoXbDAkclYuCmsuFpCxmbBV1pXOLxE0mHqLacwgcQO', 'student', 'Oscar', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(326, 'maria.reyes@mcc.edu.ph', '$2y$10$ffrnGXUQ0c36gPmnk5lAGOgdL/ibo1i6eIeEXlVTXxlls80F/c45S', 'student', 'Maria', NULL, 'Reyes', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(327, 'valentina.sy@mcc.edu.ph', '$2y$10$UAPLG5vXyr3Edath/MwvuO25KaBqbYzJ.zmGoR/SQ1MUVU9uVNb6W', 'student', 'Valentina', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(328, 'ana.delos.santos@mcc.edu.ph', '$2y$10$ybZHvFtsWcc3pR3gQmO5YeOJp96F5KYd9Dwp5IbZ1WAk0pOUlRY2y', 'student', 'Ana', NULL, 'Delos Santos', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(329, 'carlos.ortega@mcc.edu.ph', '$2y$10$B1B8HuDZGI51B6nujv.gtuWqHy9S5QaD.fAndYxUXrZv3LjgHwdwm', 'student', 'Carlos', NULL, 'Ortega', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(330, 'stella.salazar@mcc.edu.ph', '$2y$10$NRbbi1.6BUX7CRn5H/RsDOBmmvbW0KinsYVqJywBXht8d36Wh8Lqm', 'student', 'Stella', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(331, 'leo.fernandez@mcc.edu.ph', '$2y$10$u4E3VJ7oukHTHUqgubXr5.ms4FhEBo6uK2ai5hajp9ofQXnSeijkm', 'student', 'Leo', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:50', '2025-11-10 19:30:50', NULL, NULL, 0, NULL),
(332, 'dylan.ocampo@mcc.edu.ph', '$2y$10$K.NlluOV0rilBwOICpB9EufumJ6Sjrn94Ummo//WjV8aCy1.o.Miu', 'student', 'Dylan', NULL, 'Ocampo', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(333, 'lucia.huang@mcc.edu.ph', '$2y$10$NGiFTZxweQPBAAReV2nopuqFq5p3FMVwOQiy8RmtQvqxCvKV4Jf2a', 'student', 'Lucia', NULL, 'Huang', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(334, 'cristina.dela.cruz@mcc.edu.ph', '$2y$10$FaBXs9CX7WNyxGq27Ts9OOzrym6DBl473/pVzGcWmznxDZ0EaLCj.', 'student', 'Cristina', NULL, 'Dela Cruz', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(335, 'sofia.fernandez@mcc.edu.ph', '$2y$10$0TmGFdkAG.OloMw9gQMRtOLYL9JcfvtGpWYfQPNmJ0L3.Ngs5wx.u', 'student', 'Sofia', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(336, 'juan.perez@mcc.edu.ph', '$2y$10$odoAHlrVXnUXwSb1vGLzeumw5V9iE9t237CZQUVGx02Vo//RY7epu', 'student', 'Juan', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(337, 'zoe.go@mcc.edu.ph', '$2y$10$i450k4actsLIJNSZr.mAxO0tsgQk7o5sQat/qLpxCMcnkfyif8p6C', 'student', 'Zoe', NULL, 'Go', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(338, 'juan.villanueva@mcc.edu.ph', '$2y$10$gyo1xtanTH30ETWJKYGm3epzI2H9ERARxb7FE3HcX9lEj9VqryTNS', 'student', 'Juan', NULL, 'Villanueva', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(339, 'chloe.tan@mcc.edu.ph', '$2y$10$igsjHcYNvLXkrGtX20Yi3eX1jfmvxx51ws3cpNaoJT5PgiWXcQ29a', 'student', 'Chloe', NULL, 'Tan', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(340, 'juan.lim@mcc.edu.ph', '$2y$10$wXRMuK9g0yBPdWWOGn66JOi0rALIProdHAjn.6Rl3p0mAm1eC38Ja', 'student', 'Juan', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(341, 'axel.santos@mcc.edu.ph', '$2y$10$EKGOGgRlSyhktpqZRZKpf.xhXgLuxGyyM.ghd6/vTyPNIOSs11Jb6', 'student', 'Axel', NULL, 'Santos', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(342, 'marcus.manalo@mcc.edu.ph', '$2y$10$NCp5m1f1DmSO/YxYhmTLMumlLyVlrZdA9ZkU2I3WM44e3nmlrrrpe', 'student', 'Marcus', NULL, 'Manalo', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(343, 'chloe.katindig@mcc.edu.ph', '$2y$10$rnjcAfL0hW0UrcllcHfgAOfZuvSjk5N53Ub.FtuwJu8H8dDxMw2cW', 'student', 'Chloe', NULL, 'Katindig', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(344, 'andres.sy@mcc.edu.ph', '$2y$10$2boIjtq01mRR8fbei/LA2OnYUgaO8cLOqTnDVCWBLkCHmM8jMqob6', 'student', 'Andres', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(345, 'felipe.bautista@mcc.edu.ph', '$2y$10$AHHogIQaPC6rnr.WDt55Ku2pf41/CCsWMeKyYZFnhhhtJeHXIUd4K', 'student', 'Felipe', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(346, 'sofia.quinto@mcc.edu.ph', '$2y$10$szUmSYbDuxX0G2hrKTpzLOSJK/kpetuXRm11H50.1ywYZA0uGAwmW', 'student', 'Sofia', NULL, 'Quinto', NULL, 'active', 0, '2025-11-10 12:30:51', '2025-11-10 19:30:51', NULL, NULL, 0, NULL),
(347, 'valentina.perez@mcc.edu.ph', '$2y$10$s9N0XALAVZiqzR/Cee/MF.80VpPmt7UvbsZzjQR9gBrMQ64La/DK2', 'student', 'Valentina', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(348, 'diego.pineda@mcc.edu.ph', '$2y$10$mamLt6zYv8NU27VHQ4UOrOZ1yOASRauy/cfBZy3FUgnQfoDcyt01S', 'student', 'Diego', NULL, 'Pineda', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(349, 'sophia.bautista@mcc.edu.ph', '$2y$10$iERmmwAsIGToc/r05.4LSe3SNnlG2iV8yo4mKd.2mNS20dWuBl.M6', 'student', 'Sophia', NULL, 'Bautista', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(350, 'nathan.medina@mcc.edu.ph', '$2y$10$gde2kaFjmGTpeNFkuGsebuOqEIZqB20TLuTtoVF7m9G8/hEVcxMPq', 'student', 'Nathan', NULL, 'Medina', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(351, 'marcus.pineda@mcc.edu.ph', '$2y$10$YwlfvAEHTzUWUvvdF4cDOuzlAcs0FzT8Fz3x0RNhB6YM8arz.j7/S', 'student', 'Marcus', NULL, 'Pineda', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(352, 'sebastian.salazar@mcc.edu.ph', '$2y$10$.9I6yljFFJhxD4zNHkispecaQovghSHVrc..ypIbWvVBkdHvKudJ.', 'student', 'Sebastian', NULL, 'Salazar', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(353, 'carlos.garcia@mcc.edu.ph', '$2y$10$L7t79Sn3Md4BejridKvu6.o5k.I.DE5HXABQTaRfd0PvnyXNY0bFC', 'student', 'Carlos', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(354, 'sophia.perez@mcc.edu.ph', '$2y$10$OcM21k0QeXOVo4C69WW.NemXfWDd7u7k2UWr3DxZ9GP9L5ggZ3S2O', 'student', 'Sophia', NULL, 'Perez', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(355, 'victor.ocampo@mcc.edu.ph', '$2y$10$NqoABUvQE5fT1OpYgacENeJdIwhOxTwSB.fWdMQTGS0jFqAVbT.pm', 'student', 'Victor', NULL, 'Ocampo', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(356, 'camila.fernandez@mcc.edu.ph', '$2y$10$T5KdbZgkFGuTVxmPmK1ylunrbikYisYPZqGAuVFjTamoKv.DVACIS', 'student', 'Camila', NULL, 'Fernandez', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(357, 'carlos.lozano@mcc.edu.ph', '$2y$10$MmFk6bLJUuc5JhUl9YSOa.Z36gGW7JC238gWC/mOWIVgADmQgSMIW', 'student', 'Carlos', NULL, 'Lozano', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(358, 'victor.sy@mcc.edu.ph', '$2y$10$2qvNqenCkW4yJb.xExld8uiX70YI.Muj2tJk.rI54qId2Er4XiCHe', 'student', 'Victor', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(359, 'dylan.ramos@mcc.edu.ph', '$2y$10$jyTFKV20iL6k2TcETH4I3uf5h6XHTeRdLOkTpzlGSpwTBTeRd2zEC', 'student', 'Dylan', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(360, 'ava.katindig@mcc.edu.ph', '$2y$10$SfrlkkHAod41FjcX9cpzsemhxaOaWPp81wQZbWWXT1iI.S9CLlN7u', 'student', 'Ava', NULL, 'Katindig', NULL, 'active', 0, '2025-11-10 12:30:52', '2025-11-10 19:30:52', NULL, NULL, 0, NULL),
(361, 'isabella.quinto@mcc.edu.ph', '$2y$10$DiP9PerWajlEiBhoFe1cP.Kg1MZ1OkiT97/wNzi5FQ8wsv.S7q006', 'student', 'Isabella', NULL, 'Quinto', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(362, 'sofia.torres@mcc.edu.ph', '$2y$10$WELsZZ76m2uyGGtYw8w81OBSfEl9bHV8MLBYO31y5zybO1ywODzwq', 'student', 'Sofia', NULL, 'Torres', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(363, 'luis.sy@mcc.edu.ph', '$2y$10$pEhy3JhC2tQ7Raa2Y0786eKnhjTRuvZSXdojTcVNleWoQLFaITC5q', 'student', 'Luis', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(364, 'axel.tan@mcc.edu.ph', '$2y$10$VRQTBmgOwmWtNBMDBm0d2.hZqRm.WLSBQfkLCxEtxDuuSojdIUi.S', 'student', 'Axel', NULL, 'Tan', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-18 05:04:50', NULL, NULL, 0, NULL),
(365, 'ian.lim@mcc.edu.ph', '$2y$10$cjqg03G82xLDw.57K9dhPuTvIes9Lp/0quNAKfmohjJIqe5w82Nn2', 'student', 'Ian', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(366, 'valentina.delgado@mcc.edu.ph', '$2y$10$xlXyQ1QjpiCbsdJx5c.aHefji7DflyaGNV3oPa3101RauNBxaRsB.', 'student', 'Valentina', NULL, 'Delgado', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(367, 'leo.torres@mcc.edu.ph', '$2y$10$rrn0hVO8iP.fpGidRQ8z7uzfp2SyPtfnvOFOZ7uqbSxFzPh2Vfgv6', 'student', 'Leo', NULL, 'Torres', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(368, 'dylan.castro@mcc.edu.ph', '$2y$10$a0I18g7zS6IZeknALrqBtOfzoLERwoV31QGe./9qo1k8BlRCYtGUO', 'student', 'Dylan', NULL, 'Castro', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(369, 'zoe.navarro@mcc.edu.ph', '$2y$10$flFVWge79.wrX72ya9PBO.Tud934xoh3SKwwU7YpjMkFKvdj0kXDq', 'student', 'Zoe', NULL, 'Navarro', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(370, 'victor.garcia@mcc.edu.ph', '$2y$10$8EK7EKPOe8ZmL5smL50fEOBls6G4cYN6iBFrWWvM7UcdOF5K.scFe', 'student', 'Victor', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(371, 'ellie.lim@mcc.edu.ph', '$2y$10$VhncG1eTw//O9ahGO7/D1uo5/K.LiyGFFLCOnaLkOMbYaNpqzRjFy', 'student', 'Ellie', NULL, 'Lim', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(372, 'diego.go@mcc.edu.ph', '$2y$10$w0abp2JbiKqJtVu6Il636Ojnxbc1AXpuaWBPp2DHzYePkQGj8eJIK', 'student', 'Diego', NULL, 'Go', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(373, 'cristina.sy@mcc.edu.ph', '$2y$10$rp2mQRkNtPM15Eta9u0OOeDg5scJnMZBb//JHKzC4M9GN1Mf3O/VO', 'student', 'Cristina', NULL, 'Sy', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(374, 'jorge.ramos@mcc.edu.ph', '$2y$10$1oxewx8Y1G4XhIsRareG9uAl3e1dvsChTOqxs/qJLO/3HYoySsRU6', 'student', 'Jorge', NULL, 'Ramos', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(375, 'elena.cruz@mcc.edu.ph', '$2y$10$kwYleD6xg0Zm6IDQvbN2ROMcA20svoFeMX/EeaXsUYgMNoq1k19Oe', 'student', 'Elena', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:53', '2025-11-10 19:30:53', NULL, NULL, 0, NULL),
(376, 'ana.mendoza@mcc.edu.ph', '$2y$10$/FbqAPtx3ZpQ/oTxOBVbX.QtIYQMXQfRpZ5bWES9wBXjrGGvpJpXm', 'student', 'Ana', NULL, 'Mendoza', NULL, 'active', 0, '2025-11-10 12:30:54', '2025-11-26 02:44:59', NULL, NULL, 0, NULL),
(377, 'gabriela.gomez@mcc.edu.ph', '$2y$10$k7kWw2uZUHk5igYN.PkDKOlnqLikp2VYmFAFj/516kIksaMgwumBy', 'student', 'Gabriela', NULL, 'Gomez', NULL, 'active', 0, '2025-11-10 12:30:54', '2026-02-09 04:18:48', NULL, NULL, 0, NULL),
(378, 'victor.cruz@mcc.edu.ph', '$2y$10$b77SW.YmHCfAlV0VaPDLluH69g3tFgEcNwsczKKvDjKt8Q8QlMi2O', 'student', 'Victor', NULL, 'Cruz', NULL, 'active', 0, '2025-11-10 12:30:54', '2025-11-10 19:30:54', NULL, NULL, 0, NULL),
(379, 'nina.tan@mcc.edu.ph', '$2y$10$PF7SvRWH5j0POPZ0a5U.5OZhNJtKJR2QfrQKCUgn9dBHN9t37aaRu', 'student', 'Nina', NULL, 'Tan', NULL, 'active', 0, '2025-11-10 12:30:54', '2025-11-10 19:30:54', NULL, NULL, 0, NULL),
(380, 'lily.quinto@mcc.edu.ph', '$2y$10$A3YCPmKUEkKwcoKrMLXj/u2Ne7VWte/IF4MIKUlhfFK3oX8FsDkA6', 'student', 'Lily', NULL, 'Quinto', NULL, 'active', 0, '2025-11-10 12:30:54', '2026-02-14 08:30:57', '$2y$10$.K2i3l1vqQnzJb9CyBJDN.n6BAxXgl0SOkFytsJ4FE46O2qJAX7uC', '2026-02-14 01:30:57', 0, NULL),
(381, 'sofia.garcia@mcc.edu.ph', '$2y$10$qUlzEY5fNgrOI616zmet0OnRnKJjb3NFjQuGfBnVby.jtOPwLTipG', 'student', 'Sofia', NULL, 'Garcia', NULL, 'active', 0, '2025-11-10 12:30:54', '2025-11-10 19:30:54', NULL, NULL, 0, NULL),
(382, 'quinn.garcia@mcc.edu.ph', '$2y$10$.enIC7rOQI7guq8c1o2br.hB9QpuKFylpDvpQF1eNvOzgQ9RknVJC', 'teacher', 'Garcia', NULL, 'Quinn', '', 'active', 0, '2025-11-11 05:42:14', '2025-11-17 23:55:14', NULL, NULL, 0, NULL),
(398, 'jeizi.zamora@gmail.com', '$2y$10$HFVy9f7i7ar5qM.VNvNgSOxYEST5JzbOJ6wdTW9nnIHpX1SACAB0q', 'student', 'JOHN', NULL, 'ZAMORA', '', 'active', 0, '2025-11-13 17:28:17', '2026-02-18 17:28:38', '$2y$10$OyIBhCuKfTnU0urZ0Qsg0Ogr5hgkQuyWFLdxTJ7N91hUfore4KKoa', '2026-02-14 04:50:46', 0, NULL),
(405, 'iamchris.japan@gmail.com', '$2y$10$rVAv6OZyR5rs2wofK..GXOudFji4TpDuQ0ZoCjjWsvq89OVm3MaGm', 'student', 'JC', NULL, 'Zamora', '', 'active', 0, '2025-11-13 19:16:01', '2025-11-13 19:16:01', NULL, NULL, 0, NULL),
(406, 'adelina.santos@mcc.edu.ph', '$2y$10$dqseGdJNJLMcEJX5GGooMO2tx0bRXQF6J1JW/JLF0/QCZZkamt12W', 'teacher', 'Adelina', NULL, 'Santos', '', 'active', 0, '2025-11-18 14:58:37', '2026-02-19 01:07:41', NULL, NULL, 0, NULL),
(407, 'ramon.magsaysay@mcc.edu.ph', '$2y$10$sw9/W5brfU4mTM1zhTQa4O/k2abixtgMxYbHIFwklvcVVZ7RSyrC.', 'teacher', 'Ramon', NULL, 'Magsaysay', '', 'active', 0, '2025-11-18 15:15:48', '2025-11-18 15:15:48', NULL, NULL, 0, NULL),
(408, 'lourdes.cruz@mcc.edu.ph', '$2y$10$3StPBBTRzzx12rNvAM.oIO7COWJ8IQ.a69ImJf4RibS8amFD22yoC', 'teacher', 'Lourdes', NULL, 'Cruz', '', 'active', 0, '2025-11-18 15:16:06', '2025-11-18 15:16:06', NULL, NULL, 0, NULL),
(409, 'benito.delrosario@mcc.edu.ph', '$2y$10$NMJFBlpTArzOx1zhkXeacO2gT4QxT8E1LZWhDw4naH8/DZECCttZW', 'teacher', 'Benito', NULL, 'Del Rosario', '', 'active', 0, '2025-11-18 15:17:15', '2025-11-24 01:31:44', NULL, NULL, 0, NULL),
(410, 'felicidad.reyes@mcc.edu.ph', '$2y$10$w7vSFXrHBVVs.1Ofy3l0BOJoNq7Gf1U3k14JJp/WkPAcQ2IjcOdDe', 'teacher', 'Felicidad', NULL, 'Reyes', '', 'active', 0, '2025-11-18 15:17:29', '2025-11-24 01:31:25', NULL, NULL, 0, NULL),
(411, 'armando.tan@mcc.edu.ph', '$2y$10$U/vuD1FpTKjNakklMt.i0e/GFtcg1S0R1KgHvrJVPP52XknOYWa0i', 'teacher', 'Armando', NULL, 'Tan', '', 'active', 0, '2025-11-18 15:18:13', '2025-11-24 01:32:40', NULL, NULL, 0, NULL),
(412, 'consuelo.bautista@mcc.edu.ph', '$2y$10$rGn68TM1SDjlTMPY5pBucOdyAzbfOUB37nivNHrIAxxQyJM121ee2', 'teacher', 'Consuelo', NULL, 'Bautista', '', 'active', 0, '2025-11-18 15:18:28', '2025-11-24 01:32:20', NULL, NULL, 0, NULL),
(413, 'emilio.quirino@mcc.edu.ph', '$2y$10$qcKyodRXIxiKuD0Svpywk.hrJgvtrjxMcRiQ4nmDHA46pneHcDSbi', 'teacher', 'Emilio', NULL, 'Quirino', '', 'active', 0, '2025-11-18 15:18:47', '2025-11-18 15:18:47', NULL, NULL, 0, NULL),
(414, 'teresita.lim@mcc.edu.ph', '$2y$10$ilEgX5U7eH4NKn1f81BN9eAH2QJOsOM9NFkNpeYHGPECeHQWBRvJO', 'teacher', 'Teresita', NULL, 'Lim', '', 'active', 0, '2025-11-18 15:19:01', '2025-11-18 15:19:01', NULL, NULL, 0, NULL),
(415, 'josefa.villanueva@mcc.edu.ph', '$2y$10$oX5uFnmSSkb/64rO1MiJYOJ3OZe7BwOv.DGktp4uqCnw2e/mgBZAO', 'teacher', 'Josefa', NULL, 'Villanueva', '', 'active', 0, '2025-11-18 15:19:17', '2026-02-19 01:08:02', NULL, NULL, 0, NULL),
(429, 'kairi@gmail.com', '$2y$10$0POMgGARytBr0BnpPkN/6uQ2SWKdYxU/5wN8hoqW.qi7n9XN3P0RC', 'student', 'Kairi', NULL, 'Dela Cruz', '', 'active', 0, '2026-01-19 13:54:35', '2026-02-13 05:12:14', NULL, NULL, 0, NULL),
(430, 'jeizi.jczamora@gmail.com', '$2y$10$5eYtQ5jXLBmZA6JWm.gmOOT2kppWfUgPAN6cbcObYDtgMP80f4iDm', 'student', 'John Christopher King', 'Visaya', 'Zamora', '', 'active', 0, '2026-01-20 15:07:02', '2026-02-15 03:08:22', NULL, NULL, 0, NULL),
(431, 'juandelacruz99@gmail.com', '$2y$10$2czTBfblWFLkWS042EjXE.pEBsuSIOK4QNRGTYPO/VFQeAv1z3izi', 'student', 'Juan', NULL, 'Dela Cruz', '', 'active', 0, '2026-02-07 21:48:30', '2026-02-15 09:17:07', '$2y$10$euQ540jXsVyiSVqS156xnez8f9Y3PuW093N/lApcqyfrOV/Al.5Dm', '2026-02-15 02:17:07', 0, NULL),
(432, 'jordanclarkson@gmail.com', '$2y$10$9aLaE/ELzywl/MIVw9iqRufkz5uHC07qi0M.F2gFxeHdLg1Fjvv9.', 'student', 'Jordan', NULL, 'Clarkson', '', 'active', 0, '2026-02-10 12:03:15', '2026-02-15 09:12:47', '$2y$10$bJzqmwnP0zPF.H7C5oon1ecr80gFARBr2Xp5Cll7AUPyCRlHvVqqu', '2026-02-14 08:07:50', 0, NULL),
(441, 'mcaflebronjames@gmail.com', '$2y$10$sZCkibdO86R3ST.n4MjbuuFyRJ4acGvPFZLfg4.4J3OOcXpSTDity', 'student', 'Lebron', NULL, 'James', '', 'active', 0, '2026-02-15 09:04:06', '2026-02-15 09:04:06', NULL, NULL, 0, NULL),
(442, 'karlmcaf@gmail.com', '$2y$10$o3DFLZr0L2rH/qiiTUMvre7CZQpVRmktY.vouH1BjLA/n5DYteiWS', 'enrollee', 'karl', NULL, 'nepomuceno', '', 'active', 0, '2026-02-15 09:18:09', '2026-02-15 02:18:57', NULL, NULL, 0, NULL),
(443, 'michaeljordanmcaf@gamil.com', '$2y$10$IplfFfH1cNRf3or0sSNAgeoyedmDOzeUx2EJ6JWmI3zBXDUfx/nCK', 'student', 'Michael', NULL, 'Jordan', '', 'active', 0, '2026-02-15 09:28:02', '2026-02-15 09:28:02', NULL, NULL, 0, NULL),
(446, 'johnchristopherkingzamora@gmail.com', '$2y$10$XFDfDEADQUXfLGIBJGM.U.vCntZYXDeXmezqAlOz9xqL4cLgt6aYG', 'enrollee', 'Jeizi', 'Production', 'Inc', '09123798273', 'active', 1, '2026-02-19 01:21:05', '2026-02-18 18:22:08', NULL, NULL, 0, NULL),
(449, 'studentg444@gmail.com', NULL, 'enrollee', 'JOHN', 'CHISTOPHER KING', 'ZAMORA', '09123798273', 'active', 1, '2026-02-19 09:01:13', '2026-02-19 09:01:13', NULL, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_fcm_tokens`
--

CREATE TABLE `user_fcm_tokens` (
  `id` int NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_fcm_tokens`
--

INSERT INTO `user_fcm_tokens` (`id`, `user_id`, `token`, `is_active`, `created_at`) VALUES
(1, 52, 'fTAamdjizT6mUsGvco4xgh:APA91bGz3hiYI_ey59stx0hwcyNI7oIB7u5Y5xQO3gXTlnz7aK-eTxpbmBFFZPsML9gMGdyUOMZ8KcciKnh3MXSg7bMz3XBgKgoqIM-dXr4wCkHd8UqOK94', 1, '2025-11-26 13:30:12'),
(2, 110, 'fm1z9Pib3uW6M9b4mnICvv:APA91bEd32systkRDDXGI4mWHkfylCO4XM_Oe2ustj7RDzNf2q8x82xB0-2xcEqFWTY8n8DsahZjoLx6GwOxraFwSUkt8Kq9UdKzTZcQTD7Q6MnyF62GbXE', 1, '2025-11-26 13:31:02'),
(3, 110, 'fm1z9Pib3uW6M9b4mnICvv:APA91bF67OXnOLtC--at7a2HUFLXeoB3EuYF3coRoEz4R64Ws4nJx5G7mWV20cMkZJhhRr9TYX60Du4fDw4w1gtz4AzDbJDjgIHdIqaPdDTMZEQ_qV4gczQ', 1, '2025-11-26 14:04:30'),
(4, 52, 'fTAamdjizT6mUsGvco4xgh:APA91bGeXT3A0uge4Tpzvq7VWvCbhblJiCxljbi_7IZafRUsvs_8VnLofpA8-ZtQDWXgdrbYoTCVjglAgE7-tq_u-FDhfgis_q2GVOyXwL0D19K_S9Avun4', 1, '2025-11-26 14:04:36'),
(5, 52, 'fTAamdjizT6mUsGvco4xgh:APA91bHxRgIUnKv_5Jh7Xqk5jz46wf7xHkZ-qX2uM_S-FuM66_KFZA13i77FL4IbEoozg8I7bnpi6_oPPgFAc0UfOWuP4wnRqHlmGhCPy7wq_LEo0tAUre4', 1, '2025-11-27 01:47:04'),
(6, 110, 'fm1z9Pib3uW6M9b4mnICvv:APA91bHDBmK2vwqK4K8dYnR0GcWDhvsG4309o-6_HVEcfQivkT-_kOUTtwLIUfaPYFaR9n01QhSwtmLYH7OQZphWbaRXhhoqLwHP9CcgbZwYLepucDzHtSs', 1, '2025-11-27 02:41:03'),
(7, 110, 'fm1z9Pib3uW6M9b4mnICvv:APA91bE5hH4OId_XgJp_drjp1l_3BWhqg9Atwv2A1P9i9SvFcZpCWqHri2y_JWRUkkz2Ys57aDiYiJgJ5QTYIDZx2pNNoD5-kbi5Ydw9pwd3okREMtY9HWY', 1, '2025-11-28 07:39:54'),
(8, 52, 'fTAamdjizT6mUsGvco4xgh:APA91bGQowUF8-NzDaK1HIBH3cNEdKj8MnhkY9vLy6JjK_etjAYN3GAexJHz_u-4ravJjREO62KXllW3mepCEPqDZyBZcuYJUJVK0RnAb0yqPxkg8wJ_NnY', 1, '2025-11-28 07:39:34'),
(11, 52, 'fTAamdjizT6mUsGvco4xgh:APA91bHCH_Eg3od8XEBJdi-ev1yclMW9JD2zD2mll-0ft9iW7RU2_wqwBnAPAmoLgBFBcPI5Shbk_1OXGacHzMe0ZZvXB-liZSZ374pHi9ybbUnxMwam2OM', 1, '2025-11-28 11:27:35');

-- --------------------------------------------------------

--
-- Table structure for table `year_levels`
--

CREATE TABLE `year_levels` (
  `id` tinyint UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `order` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `year_levels`
--

INSERT INTO `year_levels` (`id`, `name`, `order`) VALUES
(5, 'Nursery 1', 1),
(6, 'Nursery 2', 2),
(7, 'Kinder', 3),
(8, 'Grade 1', 4),
(9, 'Grade 2', 5),
(10, 'Grade 3', 6),
(11, 'Grade 4', 7),
(12, 'Grade 5', 8),
(13, 'Grade 6', 9);

-- --------------------------------------------------------

--
-- Table structure for table `year_level_sections`
--

CREATE TABLE `year_level_sections` (
  `year_level_id` tinyint UNSIGNED NOT NULL,
  `section_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `year_level_sections`
--

INSERT INTO `year_level_sections` (`year_level_id`, `section_id`) VALUES
(5, 7),
(6, 8),
(7, 9),
(8, 10),
(9, 11),
(10, 12),
(11, 13),
(12, 14),
(13, 15);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_periods`
--
ALTER TABLE `academic_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_school_year_quarter` (`school_year`,`quarter`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_school_year` (`school_year`),
  ADD KEY `idx_quarter` (`quarter`);

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activities_type_period` (`type`,`academic_period_id`),
  ADD KEY `idx_activities_section_period` (`section_id`,`academic_period_id`);

--
-- Indexes for table `activity_grades`
--
ALTER TABLE `activity_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_activity_student` (`activity_id`,`student_id`),
  ADD KEY `idx_grades_student_period` (`student_id`,`activity_id`),
  ADD KEY `idx_grades_status` (`status`);

--
-- Indexes for table `activity_questions`
--
ALTER TABLE `activity_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity` (`activity_id`),
  ADD KEY `idx_order` (`activity_id`,`order_number`);

--
-- Indexes for table `activity_question_choices`
--
ALTER TABLE `activity_question_choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_question` (`question_id`),
  ADD KEY `idx_correct` (`question_id`,`is_correct`);

--
-- Indexes for table `activity_settings`
--
ALTER TABLE `activity_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_activity_setting` (`activity_id`,`setting_key`),
  ADD KEY `idx_activity` (`activity_id`);

--
-- Indexes for table `activity_student_answers`
--
ALTER TABLE `activity_student_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_question` (`activity_id`,`question_id`,`student_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_activity` (`activity_id`),
  ADD KEY `idx_question` (`question_id`),
  ADD KEY `fk_answers_choice` (`choice_id`);

--
-- Indexes for table `activity_submissions`
--
ALTER TABLE `activity_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_student` (`activity_id`,`student_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_submitted_at` (`submitted_at`),
  ADD KEY `idx_submissions_late` (`is_late`),
  ADD KEY `idx_submissions_attempt` (`activity_id`,`student_id`,`attempt_number`);

--
-- Indexes for table `activity_submission_files`
--
ALTER TABLE `activity_submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_submission` (`submission_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audience` (`audience`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_published_at` (`published_at`),
  ADD KEY `fk_announcements_created_by` (`created_by`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_att_student` (`student_id`),
  ADD KEY `idx_att_teacher` (`teacher_id`),
  ADD KEY `idx_att_course` (`course_id`),
  ADD KEY `idx_student_date` (`student_id`,`created_at`),
  ADD KEY `idx_course_date` (`course_id`,`created_at`),
  ADD KEY `idx_attendance_session` (`session_id`),
  ADD KEY `idx_attendance_session_id` (`session_id`);

--
-- Indexes for table `broadcasts`
--
ALTER TABLE `broadcasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_broadcast_teacher` (`teacher_id`),
  ADD KEY `idx_broadcast_subject` (`teacher_subject_id`),
  ADD KEY `idx_broadcast_section` (`section_id`);

--
-- Indexes for table `campus`
--
ALTER TABLE `campus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discount_templates`
--
ALTER TABLE `discount_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_requirements`
--
ALTER TABLE `document_requirements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_requirement` (`grade_level`,`enrollment_type`,`document_name`),
  ADD KEY `idx_grade_type` (`grade_level`,`enrollment_type`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `last_reviewed_by` (`last_reviewed_by`),
  ADD KEY `created_user_id` (`created_user_id`),
  ADD KEY `created_student_id` (`created_student_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_submitted_date` (`submitted_date`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `idx_enrollment_period_id` (`enrollment_period_id`),
  ADD KEY `idx_academic_period_id` (`academic_period_id`),
  ADD KEY `idx_enrollment_type` (`enrollment_type`);

--
-- Indexes for table `enrollment_addresses`
--
ALTER TABLE `enrollment_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollment_id` (`enrollment_id`),
  ADD KEY `idx_address_type` (`address_type`);

--
-- Indexes for table `enrollment_discounts`
--
ALTER TABLE `enrollment_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollment_id` (`enrollment_id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `idx_payment_id` (`payment_id`);

--
-- Indexes for table `enrollment_documents`
--
ALTER TABLE `enrollment_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollment_id` (`enrollment_id`),
  ADD KEY `idx_verification_status` (`verification_status`),
  ADD KEY `idx_upload_date` (`upload_date`),
  ADD KEY `enrollment_documents_ibfk_2` (`verified_by`),
  ADD KEY `enrollment_documents_version_fk` (`previous_version_id`),
  ADD KEY `idx_current_version` (`enrollment_id`,`is_current_version`);

--
-- Indexes for table `enrollment_fee_items`
--
ALTER TABLE `enrollment_fee_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_efi_enrollment` (`enrollment_id`),
  ADD KEY `idx_efi_package` (`package_id`),
  ADD KEY `fk_efi_package_item` (`package_item_id`);

--
-- Indexes for table `enrollment_flags`
--
ALTER TABLE `enrollment_flags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollment_id` (`enrollment_id`);

--
-- Indexes for table `enrollment_learners`
--
ALTER TABLE `enrollment_learners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollment_id` (`enrollment_id`);

--
-- Indexes for table `enrollment_parent_contacts`
--
ALTER TABLE `enrollment_parent_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollment_id` (`enrollment_id`),
  ADD KEY `idx_contact_type` (`contact_type`);

--
-- Indexes for table `enrollment_periods`
--
ALTER TABLE `enrollment_periods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_academic_period_id` (`academic_period_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `final_grades`
--
ALTER TABLE `final_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_student_subject_period_term` (`student_id`,`subject_id`,`academic_period_id`,`term`),
  ADD KEY `idx_status_submitted_at` (`status`,`submitted_at`),
  ADD KEY `idx_student_academic_period` (`student_id`,`academic_period_id`),
  ADD KEY `idx_subject_section_period` (`subject_id`,`section_id`,`academic_period_id`);

--
-- Indexes for table `installments`
--
ALTER TABLE `installments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_plan_id` (`payment_plan_id`);

--
-- Indexes for table `learning_materials`
--
ALTER TABLE `learning_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subject_id` (`subject_id`),
  ADD KEY `idx_section_id` (`section_id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_subject_section` (`subject_id`,`section_id`),
  ADD KEY `idx_created_at` (`created_at` DESC);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_messages_receiver` (`receiver_id`),
  ADD KEY `idx_messages_sender` (`sender_id`),
  ADD KEY `idx_messages_broadcast` (`broadcast_id`),
  ADD KEY `idx_messages_subject` (`teacher_subject_id`);

--
-- Indexes for table `parent_contacts`
--
ALTER TABLE `parent_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_contact_type` (`contact_type`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email` (`email`),
  ADD KEY `token` (`token`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `fk_password_resets_user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_enrollment_id` (`enrollment_id`),
  ADD KEY `idx_academic_period_id` (`academic_period_id`),
  ADD KEY `idx_payment_type` (`payment_type`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_installment_id` (`installment_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `received_by` (`received_by`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `original_payment_id` (`original_payment_id`);

--
-- Indexes for table `payment_installment_penalties`
--
ALTER TABLE `payment_installment_penalties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_installment` (`installment_id`),
  ADD KEY `idx_applied_at` (`applied_at`);

--
-- Indexes for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_period` (`student_id`,`academic_period_id`),
  ADD KEY `academic_period_id` (`academic_period_id`),
  ADD KEY `payment_plans_enrollment_fk` (`enrollment_id`),
  ADD KEY `idx_template_id` (`template_id`);

--
-- Indexes for table `payment_schedule_installment_templates`
--
ALTER TABLE `payment_schedule_installment_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_template_installment` (`template_id`,`installment_number`);

--
-- Indexes for table `payment_schedule_templates`
--
ALTER TABLE `payment_schedule_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_schedule_type` (`schedule_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `school_fees`
--
ALTER TABLE `school_fees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_academic_period_year` (`year_level`),
  ADD KEY `idx_fee_type` (`fee_type`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_is_required` (`is_required`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sections_name_year_unique` (`name`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_student_id_unique` (`student_id`),
  ADD UNIQUE KEY `students_user_id_unique` (`user_id`),
  ADD KEY `students_section_id_foreign` (`section_id`),
  ADD KEY `students_ibfk_1` (`enrollment_id`);

--
-- Indexes for table `student_enrollment_history`
--
ALTER TABLE `student_enrollment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_enrollment_id` (`enrollment_id`),
  ADD KEY `idx_academic_period` (`academic_period_id`);

--
-- Indexes for table `student_uniform_orders`
--
ALTER TABLE `student_uniform_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uniform_item_id` (`uniform_item_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subjects_course_code_unique` (`course_code`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teachers_employee_id_unique` (`employee_id`),
  ADD UNIQUE KEY `teachers_user_id_unique` (`user_id`),
  ADD KEY `idx_employee_id` (`employee_id`);

--
-- Indexes for table `teacher_adviser_assignments`
--
ALTER TABLE `teacher_adviser_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_adviser_sy_level` (`teacher_id`,`school_year`,`level`),
  ADD KEY `idx_level` (`level`),
  ADD KEY `idx_school_year` (`school_year`),
  ADD KEY `idx_teacher_id` (`teacher_id`);

--
-- Indexes for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_teacher_sy_level` (`teacher_id`,`school_year`,`level`),
  ADD KEY `idx_level` (`level`),
  ADD KEY `idx_school_year` (`school_year`);

--
-- Indexes for table `teacher_subject_assignments`
--
ALTER TABLE `teacher_subject_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_teacher_subject_sy` (`teacher_id`,`subject_id`,`school_year`),
  ADD KEY `idx_teacher_id` (`teacher_id`),
  ADD KEY `idx_subject_id` (`subject_id`),
  ADD KEY `idx_school_year` (`school_year`),
  ADD KEY `idx_teacher_sy` (`teacher_id`,`school_year`),
  ADD KEY `idx_subject_sy` (`subject_id`,`school_year`);

--
-- Indexes for table `tuition_packages`
--
ALTER TABLE `tuition_packages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tp_name_effective` (`name`,`effective_from`),
  ADD KEY `idx_tp_active_dates` (`is_active`,`effective_from`,`effective_to`);

--
-- Indexes for table `tuition_package_items`
--
ALTER TABLE `tuition_package_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tpi_package` (`package_id`),
  ADD KEY `idx_tpi_required` (`is_required`);

--
-- Indexes for table `tuition_package_levels`
--
ALTER TABLE `tuition_package_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tpl_package_level` (`package_id`,`year_level`),
  ADD KEY `idx_tpl_level` (`year_level`);

--
-- Indexes for table `uniform_items`
--
ALTER TABLE `uniform_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uniform_prices`
--
ALTER TABLE `uniform_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_item_size` (`uniform_item_id`,`size`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_fcm_tokens`
--
ALTER TABLE `user_fcm_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `year_levels`
--
ALTER TABLE `year_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_name` (`name`);

--
-- Indexes for table `year_level_sections`
--
ALTER TABLE `year_level_sections`
  ADD PRIMARY KEY (`year_level_id`,`section_id`),
  ADD KEY `idx_section` (`section_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_periods`
--
ALTER TABLE `academic_periods`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `activity_grades`
--
ALTER TABLE `activity_grades`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `activity_questions`
--
ALTER TABLE `activity_questions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `activity_question_choices`
--
ALTER TABLE `activity_question_choices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `activity_settings`
--
ALTER TABLE `activity_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_student_answers`
--
ALTER TABLE `activity_student_answers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `activity_submissions`
--
ALTER TABLE `activity_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `activity_submission_files`
--
ALTER TABLE `activity_submission_files`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=337;

--
-- AUTO_INCREMENT for table `broadcasts`
--
ALTER TABLE `broadcasts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `campus`
--
ALTER TABLE `campus`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `discount_templates`
--
ALTER TABLE `discount_templates`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `document_requirements`
--
ALTER TABLE `document_requirements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `enrollment_addresses`
--
ALTER TABLE `enrollment_addresses`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `enrollment_discounts`
--
ALTER TABLE `enrollment_discounts`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `enrollment_documents`
--
ALTER TABLE `enrollment_documents`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `enrollment_fee_items`
--
ALTER TABLE `enrollment_fee_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollment_flags`
--
ALTER TABLE `enrollment_flags`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `enrollment_learners`
--
ALTER TABLE `enrollment_learners`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `enrollment_parent_contacts`
--
ALTER TABLE `enrollment_parent_contacts`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `enrollment_periods`
--
ALTER TABLE `enrollment_periods`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `final_grades`
--
ALTER TABLE `final_grades`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=253;

--
-- AUTO_INCREMENT for table `installments`
--
ALTER TABLE `installments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;

--
-- AUTO_INCREMENT for table `learning_materials`
--
ALTER TABLE `learning_materials`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `parent_contacts`
--
ALTER TABLE `parent_contacts`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `payment_installment_penalties`
--
ALTER TABLE `payment_installment_penalties`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_plans`
--
ALTER TABLE `payment_plans`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `payment_schedule_installment_templates`
--
ALTER TABLE `payment_schedule_installment_templates`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `payment_schedule_templates`
--
ALTER TABLE `payment_schedule_templates`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `school_fees`
--
ALTER TABLE `school_fees`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=418;

--
-- AUTO_INCREMENT for table `student_enrollment_history`
--
ALTER TABLE `student_enrollment_history`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_uniform_orders`
--
ALTER TABLE `student_uniform_orders`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `teacher_adviser_assignments`
--
ALTER TABLE `teacher_adviser_assignments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `teacher_subject_assignments`
--
ALTER TABLE `teacher_subject_assignments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `tuition_packages`
--
ALTER TABLE `tuition_packages`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tuition_package_items`
--
ALTER TABLE `tuition_package_items`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `tuition_package_levels`
--
ALTER TABLE `tuition_package_levels`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `uniform_items`
--
ALTER TABLE `uniform_items`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `uniform_prices`
--
ALTER TABLE `uniform_prices`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=450;

--
-- AUTO_INCREMENT for table `user_fcm_tokens`
--
ALTER TABLE `user_fcm_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `year_levels`
--
ALTER TABLE `year_levels`
  MODIFY `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

-- --------------------------------------------------------

--
-- Structure for view `student_balance_summary`
--
DROP TABLE IF EXISTS `student_balance_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `student_balance_summary`  AS SELECT `s`.`id` AS `student_id`, `s`.`student_id` AS `student_number`, concat(`u`.`first_name`,' ',`u`.`last_name`) AS `student_name`, `s`.`year_level` AS `year_level`, `pp`.`academic_period_id` AS `academic_period_id`, `ap`.`school_year` AS `academic_year`, `ap`.`quarter` AS `quarter`, `pp`.`total_tuition` AS `total_amount`, coalesce(`pp`.`total_paid`,0) AS `paid_amount`, coalesce(`pp`.`balance`,`pp`.`total_tuition`) AS `balance`, `pp`.`status` AS `payment_plan_status`, count(distinct `i`.`id`) AS `total_installments`, count(distinct (case when (`i`.`status` = 'Pending') then `i`.`id` end)) AS `pending_installments`, count(distinct (case when (`i`.`status` = 'Overdue') then `i`.`id` end)) AS `overdue_installments`, min((case when (`i`.`status` in ('Pending','Overdue')) then `i`.`due_date` end)) AS `next_due_date`, min((case when (`i`.`status` in ('Pending','Overdue')) then `i`.`amount_due` end)) AS `next_amount_due`, sum((case when (`i`.`status` = 'Overdue') then `i`.`late_fee` else 0 end)) AS `total_late_fees` FROM ((((`students` `s` left join `users` `u` on((`u`.`id` = `s`.`user_id`))) left join `payment_plans` `pp` on(((`pp`.`student_id` = `s`.`id`) and (`pp`.`status` = 'Active')))) left join `academic_periods` `ap` on((`ap`.`id` = `pp`.`academic_period_id`))) left join `installments` `i` on((`i`.`payment_plan_id` = `pp`.`id`))) WHERE (`s`.`status` = 'active') GROUP BY `s`.`id`, `pp`.`id`, `ap`.`id`, `u`.`first_name`, `u`.`last_name` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_questions`
--
ALTER TABLE `activity_questions`
  ADD CONSTRAINT `fk_questions_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `activity_question_choices`
--
ALTER TABLE `activity_question_choices`
  ADD CONSTRAINT `fk_choices_question` FOREIGN KEY (`question_id`) REFERENCES `activity_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `activity_settings`
--
ALTER TABLE `activity_settings`
  ADD CONSTRAINT `fk_settings_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `activity_student_answers`
--
ALTER TABLE `activity_student_answers`
  ADD CONSTRAINT `fk_answers_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_answers_choice` FOREIGN KEY (`choice_id`) REFERENCES `activity_question_choices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `activity_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_answers_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `activity_submissions`
--
ALTER TABLE `activity_submissions`
  ADD CONSTRAINT `fk_submissions_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_submissions_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `activity_submission_files`
--
ALTER TABLE `activity_submission_files`
  ADD CONSTRAINT `fk_files_submission` FOREIGN KEY (`submission_id`) REFERENCES `activity_submissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_announcements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendance_subject` FOREIGN KEY (`course_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendance_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`last_reviewed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`created_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_4` FOREIGN KEY (`created_student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_5` FOREIGN KEY (`enrollment_period_id`) REFERENCES `enrollment_periods` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `enrollments_ibfk_6` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`),
  ADD CONSTRAINT `fk_enrollments_academic_period` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `enrollment_addresses`
--
ALTER TABLE `enrollment_addresses`
  ADD CONSTRAINT `enrollment_addresses_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment_discounts`
--
ALTER TABLE `enrollment_discounts`
  ADD CONSTRAINT `enrollment_discounts_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`),
  ADD CONSTRAINT `enrollment_discounts_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `discount_templates` (`id`),
  ADD CONSTRAINT `fk_enrollment_discounts_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment_documents`
--
ALTER TABLE `enrollment_documents`
  ADD CONSTRAINT `enrollment_documents_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_documents_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `enrollment_documents_version_fk` FOREIGN KEY (`previous_version_id`) REFERENCES `enrollment_documents` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollment_fee_items`
--
ALTER TABLE `enrollment_fee_items`
  ADD CONSTRAINT `fk_efi_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_efi_package` FOREIGN KEY (`package_id`) REFERENCES `tuition_packages` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_efi_package_item` FOREIGN KEY (`package_item_id`) REFERENCES `tuition_package_items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollment_flags`
--
ALTER TABLE `enrollment_flags`
  ADD CONSTRAINT `enrollment_flags_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment_learners`
--
ALTER TABLE `enrollment_learners`
  ADD CONSTRAINT `enrollment_learners_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment_parent_contacts`
--
ALTER TABLE `enrollment_parent_contacts`
  ADD CONSTRAINT `enrollment_parent_contacts_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment_periods`
--
ALTER TABLE `enrollment_periods`
  ADD CONSTRAINT `enrollment_periods_ibfk_1` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `installments`
--
ALTER TABLE `installments`
  ADD CONSTRAINT `installments_ibfk_1` FOREIGN KEY (`payment_plan_id`) REFERENCES `payment_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_materials`
--
ALTER TABLE `learning_materials`
  ADD CONSTRAINT `fk_learning_materials_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_learning_materials_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_learning_materials_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_messages_broadcast` FOREIGN KEY (`broadcast_id`) REFERENCES `broadcasts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `parent_contacts`
--
ALTER TABLE `parent_contacts`
  ADD CONSTRAINT `parent_contacts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_password_resets_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_5` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `payments_ibfk_6` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_7` FOREIGN KEY (`original_payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_installment_fk` FOREIGN KEY (`installment_id`) REFERENCES `installments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_student_fk` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD CONSTRAINT `payment_plans_enrollment_fk` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_plans_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_plans_ibfk_2` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_schedule_installment_templates`
--
ALTER TABLE `payment_schedule_installment_templates`
  ADD CONSTRAINT `payment_schedule_installment_templates_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `payment_schedule_templates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_enrollment_history`
--
ALTER TABLE `student_enrollment_history`
  ADD CONSTRAINT `student_enrollment_history_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `student_enrollment_history_ibfk_2` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`),
  ADD CONSTRAINT `student_enrollment_history_ibfk_3` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`);

--
-- Constraints for table `student_uniform_orders`
--
ALTER TABLE `student_uniform_orders`
  ADD CONSTRAINT `student_uniform_orders_ibfk_1` FOREIGN KEY (`uniform_item_id`) REFERENCES `uniform_items` (`id`);

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_adviser_assignments`
--
ALTER TABLE `teacher_adviser_assignments`
  ADD CONSTRAINT `fk_taa_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_subject_assignments`
--
ALTER TABLE `teacher_subject_assignments`
  ADD CONSTRAINT `fk_tsa_subject_id` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tsa_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tuition_package_items`
--
ALTER TABLE `tuition_package_items`
  ADD CONSTRAINT `fk_tpi_package` FOREIGN KEY (`package_id`) REFERENCES `tuition_packages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tuition_package_levels`
--
ALTER TABLE `tuition_package_levels`
  ADD CONSTRAINT `fk_tpl_package` FOREIGN KEY (`package_id`) REFERENCES `tuition_packages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `uniform_prices`
--
ALTER TABLE `uniform_prices`
  ADD CONSTRAINT `uniform_prices_ibfk_1` FOREIGN KEY (`uniform_item_id`) REFERENCES `uniform_items` (`id`);

--
-- Constraints for table `user_fcm_tokens`
--
ALTER TABLE `user_fcm_tokens`
  ADD CONSTRAINT `fk_user_fcm_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `year_level_sections`
--
ALTER TABLE `year_level_sections`
  ADD CONSTRAINT `fk_yls_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_yls_year_level` FOREIGN KEY (`year_level_id`) REFERENCES `year_levels` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
