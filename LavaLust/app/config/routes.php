<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');
/**
 * ------------------------------------------------------------------
 * LavaLust - an opensource lightweight PHP MVC Framework
 * ------------------------------------------------------------------
 *
 * MIT License
 *
 * Copyright (c) 2020 Ronald M. Marasigan
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @package LavaLust
 * @author Ronald M. Marasigan <ronald.marasigan@yahoo.com>
 * @since Version 1
 * @link https://github.com/ronmarasigan/LavaLust
 * @license https://opensource.org/licenses/MIT MIT License
 */

/*
| -------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------
| Here is where you can register web routes for your application.
|
|
*/

$router->get('/', 'Welcome::index');

// Auth Routes (Both API and Web)
$router->match('/auth/login', 'UserController::login', ['GET', 'POST']);
$router->match('/auth/register', 'UserController::register', ['GET', 'POST']);
$router->get('/auth/logout', 'UserController::logout');
// Password reset web page (simple server-side form)
$router->match('/auth/reset', 'UserController::reset', ['GET', 'POST']);

// API Routes - Authentication
$router->post('/api/auth/register', 'UserController::api_register');
$router->post('/api/auth/login', 'UserController::api_login');
$router->post('/api/auth/check-student', 'UserController::api_check_student');
$router->post('/api/auth/set-password', 'UserController::api_set_password');
$router->post('/api/auth/logout', 'UserController::api_logout');
$router->get('/api/auth/me', 'UserController::me');
$router->get('/api/auth/check', 'UserController::check');
// Payment PIN routes
$router->post('/api/auth/setup-payment-pin', 'UserController::api_setup_payment_pin');
$router->post('/api/auth/verify-payment-pin', 'UserController::api_verify_payment_pin');
$router->post('/api/auth/request-pin-reset', 'UserController::api_request_pin_reset');
$router->post('/api/auth/reset-pin', 'UserController::api_reset_pin');
// Password reset request (sends reset email)
$router->post('/api/auth/request-reset', 'UserController::api_request_password_reset');
// API endpoint to accept token and new password
$router->post('/api/auth/reset-password', 'UserController::api_reset_password');
// API endpoint to send welcome email when a user is created by admin
$router->post('/api/auth/send-welcome-email', 'UserController::api_send_welcome_email');

// API Routes - Email Verification (must be BEFORE /api/users/{id} to avoid route conflict)
$router->get('/api/users/verify-email', 'UserController::api_verify_email');
$router->post('/api/users/resend-verification', 'UserController::api_resend_verification');

// API Routes - User Management (Admin only)
$router->get('/api/users', 'UserController::api_get_users');
$router->get('/api/users/{id}', 'UserController::api_get_user')->where_number('id');
$router->post('/api/users', 'UserController::api_create_user');
$router->put('/api/users/{id}', 'UserController::api_update_user')->where_number('id');
$router->delete('/api/users/{id}', 'UserController::api_delete_user')->where_number('id');

// API Routes - Firebase Cloud Messaging (FCM token registration)
$router->post('/api/users/register-fcm-token', 'UserController::api_register_fcm_token');
// Debug route to list current user's FCM tokens (development only)
$router->get('/api/debug/my-fcm-tokens', 'UserController::api_list_my_fcm_tokens');
// Debug route to send a test FCM notification to current user
$router->post('/api/debug/send-test-notification', 'UserController::api_send_test_notification');

// API Routes - Teacher Management (Admin only)
$router->get('/api/teachers', 'TeacherController::api_get_teachers');
$router->get('/api/teachers/stats', 'TeacherController::api_teacher_stats');
$router->get('/api/teachers/last-id', 'TeacherController::api_get_last_id');
$router->get('/api/teacher-assignments', 'TeacherController::api_get_all_assignments');
// More specific routes MUST come before {id} routes
$router->get('/api/teachers/by-user/{user_id}', 'TeacherController::api_get_teacher_by_user')->where_number('user_id');
$router->get('/api/teachers/{id}/assignment', 'TeacherController::api_get_teacher_assignment')->where_number('id');
$router->get('/api/teachers/{id}/public', 'TeacherController::api_get_public_teacher')->where_number('id');
// General routes
$router->get('/api/teachers/{id}', 'TeacherController::api_get_teacher')->where_number('id');
$router->post('/api/teachers', 'TeacherController::api_create_teacher');
$router->put('/api/teachers/{id}', 'TeacherController::api_update_teacher')->where_number('id');
$router->delete('/api/teachers/{id}', 'TeacherController::api_delete_teacher')->where_number('id');

// API Routes - Student Management (Admin only)
$router->get('/api/students', 'StudentController::api_get_students');
$router->get('/api/students-enrollees', 'StudentController::api_get_students_enrollees');
$router->get('/api/students/stats', 'StudentController::api_get_stats');
$router->get('/api/students/last-id', 'StudentController::api_get_last_id');
$router->get('/api/students/by-user/{user_id}', 'StudentController::api_get_by_user_id')->where_number('user_id');
$router->get('/api/students/{id}/courses', 'StudentController::api_get_courses_for_student')->where_number('id');
$router->get('/api/students/{id}/courses/teachers', 'StudentController::api_get_course_teachers')->where_number('id');
$router->get('/api/students/{id}/activities', 'StudentController::api_get_activities_for_student')->where_number('id');
$router->get('/api/students/{id}/courses-activities', 'StudentController::api_get_courses_activities')->where_number('id');
$router->get('/api/students/{id}', 'StudentController::api_get_student')->where_number('id');
$router->post('/api/students', 'StudentController::api_create_student');
$router->get('/api/students/export', 'StudentController::api_export_students');
$router->post('/api/students/import', 'StudentController::api_import_students');
$router->put('/api/students/{id}', 'StudentController::api_update_student')->where_number('id');
$router->delete('/api/students/{id}', 'StudentController::api_delete_student')->where_number('id');
// API endpoint to send welcome email to a newly created student
$router->post('/api/students/send-welcome-email', 'StudentController::api_send_welcome_email');

// API Routes - Student Grades (Student accessible)
$router->get('/api/student/grades-summary', 'StudentController::api_grades_summary');

// Tools / Utilities
$router->get('/tools/generate-students', 'Tools::generate_students');

// API Routes - Sections (Admin only)
$router->get('/api/sections', 'SectionController::api_get_sections');
$router->get('/api/sections/{id}', 'SectionController::api_get_section')->where_number('id');
$router->post('/api/sections', 'SectionController::api_create_section');
$router->post('/api/sections/with-year-level', 'SectionController::api_create_section_with_year_level');
$router->put('/api/sections/{id}', 'SectionController::api_update_section')->where_number('id');
$router->delete('/api/sections/{id}', 'SectionController::api_delete_section')->where_number('id');

// API Routes - Year Levels (Admin only)
$router->get('/api/year-levels', 'SectionController::api_get_year_levels');
$router->post('/api/year-levels', 'SectionController::api_create_year_level');
$router->put('/api/year-levels/{id}', 'SectionController::api_update_year_level')->where_number('id');
$router->delete('/api/year-levels/{id}', 'SectionController::api_delete_year_level')->where_number('id');
$router->get('/api/year-levels/{id}/sections', 'SectionController::api_get_year_level_sections')->where_number('id');
$router->post('/api/year-levels/{yearLevelId}/sections', 'SectionController::api_create_section_under_year_level')->where_number('yearLevelId');

// API Routes - Year Level Sections (Admin only)
$router->get('/api/year-level-sections', 'SectionController::api_get_all_year_level_sections');
$router->post('/api/year-levels/{yearLevelId}/sections/{sectionId}', 'SectionController::api_assign_section_to_year_level')->where_number(['yearLevelId', 'sectionId']);
$router->delete('/api/year-levels/{yearLevelId}/sections/{sectionId}', 'SectionController::api_unassign_section_from_year_level')->where_number(['yearLevelId', 'sectionId']);

// API Routes - Subjects (Admin only)
$router->get('/api/subjects', 'SubjectController::api_get_subjects');
$router->get('/api/subjects/{id}', 'SubjectController::api_get_subject')->where_number('id');
$router->post('/api/subjects', 'SubjectController::api_create_subject');
$router->put('/api/subjects/{id}', 'SubjectController::api_update_subject')->where_number('id');
$router->delete('/api/subjects/{id}', 'SubjectController::api_delete_subject')->where_number('id');

// API Routes - Subjects (Student accessible)
$router->get('/api/subjects/for-student', 'SubjectController::api_get_for_student');

// API Routes - Teacher Assignments (for elementary K-12 model)
$router->get('/api/teacher-assignments/my', 'TeacherController::api_get_my_assignment');
$router->get('/api/teachers/sections-by-year-level', 'TeacherController::api_get_sections_by_year_level');

// DEPRECATED: Old college model - commented out
// API Routes - Teacher Assignments (Admin only)
// $router->post('/api/teacher-assignments', 'TeacherAssignmentController::api_assign_subjects');
// $router->get('/api/teacher-assignments/my', 'TeacherAssignmentController::api_get_mine');
// $router->get('/api/teacher-assignments/by-teacher/{teacher_id}', 'TeacherAssignmentController::api_get_by_teacher')->where_number('teacher_id');
// $router->get('/api/teacher-assignments', 'TeacherAssignmentController::api_get_all');
// $router->post('/api/teacher-assignments/remove-section', 'TeacherAssignmentController::api_remove_section');
// $router->post('/api/teacher-assignments/remove-assignment', 'TeacherAssignmentController::api_remove_assignment');
// API Routes - Teacher Assignments (Student accessible)
// $router->get('/api/teacher-assignments/for-student', 'TeacherAssignmentController::api_get_for_student');

// API Routes - Student Subjects (Enrollments)
$router->get('/api/student-subjects', 'StudentSubjectController::api_get');
$router->post('/api/student-subjects', 'StudentSubjectController::api_create');
$router->post('/api/student-subjects/delete', 'StudentSubjectController::api_delete');

// API Routes - Activities (Grade Transparency)
$router->get('/api/activities', 'ActivityController::api_get_activities');
$router->get('/api/teacher/activities/with-grades', 'ActivityController::api_get_teacher_activities_with_graded_counts');
$router->get('/api/activities/course/with-stats', 'ActivityController::api_get_course_activities_with_stats');
$router->get('/api/activities/student-grades', 'ActivityController::api_get_student_activities_with_grades');
$router->get('/api/activities/student-all', 'ActivityController::api_get_all_student_activities_with_grades');
$router->get('/api/activities/export-class-record', 'ActivityController::api_export_class_record');
$router->get('/api/activities/export-class-record-excel', 'ActivityController::api_export_class_record_excel');
$router->post('/api/activities/import-class-record', 'ActivityController::api_import_class_record');
$router->get('/api/activities/{id}', 'ActivityController::api_get_activity')->where_number('id');
$router->post('/api/activities', 'ActivityController::api_create_activity');
$router->put('/api/activities/{id}', 'ActivityController::api_update_activity')->where_number('id');
$router->delete('/api/activities/{id}', 'ActivityController::api_delete_activity')->where_number('id');
$router->get('/api/activities/{id}/submissions', 'ActivityController::api_get_submissions')->where_number('id');
$router->post('/api/activities/{id}/submit', 'ActivityController::api_submit_activity')->where_number('id');
$router->post('/api/activities/{id}/grade', 'ActivityController::api_save_grade')->where_number('id');
$router->get('/api/activities/{id}/grades', 'ActivityController::api_get_activity_grades')->where_number('id');
$router->post('/api/activities/{id}/grades', 'ActivityController::api_set_grade')->where_number('id');
// Generic activity grades query (filter by activity_id and/or student_id)
$router->get('/api/activity-grades', 'ActivityController::api_get_activity_grades_by_params');

// API Routes - Quiz Builder (Teacher)
$router->get('/api/activities/{id}/questions', 'QuizController::api_get_questions')->where_number('id');
$router->post('/api/activities/{id}/questions', 'QuizController::api_create_question')->where_number('id');
$router->put('/api/activities/{id}/questions/{questionId}', 'QuizController::api_update_question')->where_number('id')->where_number('questionId');
$router->delete('/api/activities/{id}/questions/{questionId}', 'QuizController::api_delete_question')->where_number('id')->where_number('questionId');
$router->post('/api/activities/{id}/settings', 'QuizController::api_save_settings')->where_number('id');
$router->get('/api/activities/{id}/settings', 'QuizController::api_get_settings')->where_number('id');

// API Routes - Quiz Taker (Student)
$router->get('/api/activities/{id}/quiz/start', 'QuizController::api_start_quiz')->where_number('id');
$router->post('/api/activities/{id}/quiz/save-answer', 'QuizController::api_save_answer')->where_number('id');
$router->post('/api/activities/{id}/quiz/submit', 'QuizController::api_submit_quiz')->where_number('id');

// API Routes - Quiz Review (Teacher)
$router->get('/api/activities/{id}/student-answers', 'QuizController::api_get_student_answers')->where_number('id');
$router->post('/api/activities/{id}/grade-answer', 'QuizController::api_grade_answer')->where_number('id');

// API Routes - File Upload
$router->post('/api/upload/file', 'UploadController::uploadFile');
$router->delete('/api/upload/file', 'UploadController::deleteFile');

// API Routes - Learning Materials
$router->post('/api/learning-materials', 'LearningMaterialsController::create');
$router->get('/api/learning-materials/subject/{id}', 'LearningMaterialsController::getBySubject')->where_number('id');
$router->get('/api/learning-materials/{id}', 'LearningMaterialsController::getById')->where_number('id');
$router->put('/api/learning-materials/{id}', 'LearningMaterialsController::update')->where_number('id');
$router->delete('/api/learning-materials/{id}', 'LearningMaterialsController::delete')->where_number('id');

// API Routes - Academic Periods
$router->get('/api/academic-periods', 'AcademicPeriodController::api_get_periods');
$router->get('/api/academic-periods/stats', 'AcademicPeriodController::api_get_stats');
$router->get('/api/academic-periods/active', 'AcademicPeriodController::api_get_active');
$router->get('/api/academic-periods/active-public', 'AcademicPeriodController::api_get_active_public');
$router->get('/api/academic-periods/grading-context', 'AcademicPeriodController::api_get_grading_context');
$router->get('/api/academic-periods/current-subjects', 'AcademicPeriodController::api_get_current_subjects');
$router->get('/api/academic-periods/school-years', 'AcademicPeriodController::api_get_school_years');
$router->get('/api/academic-periods/{id}', 'AcademicPeriodController::api_get_period')->where_number('id');
$router->post('/api/academic-periods', 'AcademicPeriodController::api_create_period');
$router->put('/api/academic-periods/{id}', 'AcademicPeriodController::api_update_period')->where_number('id');
$router->post('/api/academic-periods/{id}/set-active', 'AcademicPeriodController::api_set_active')->where_number('id');
$router->delete('/api/academic-periods/{id}', 'AcademicPeriodController::api_delete_period')->where_number('id');

// API Routes - School Fees
$router->get('/api/school-fees', 'SchoolFeesController::api_get_fees');
$router->get('/api/school-fees/student/{student_id}', 'SchoolFeesController::api_get_student_fees')->where_number('student_id');
$router->get('/api/school-fees/{id}', 'SchoolFeesController::api_get_fee')->where_number('id');
$router->post('/api/school-fees', 'SchoolFeesController::api_create_fee');
$router->put('/api/school-fees/{id}', 'SchoolFeesController::api_update_fee')->where_number('id');
$router->put('/api/school-fees/{id}/toggle-status', 'SchoolFeesController::api_toggle_status')->where_number('id');
$router->delete('/api/school-fees/{id}', 'SchoolFeesController::api_delete_fee')->where_number('id');

// API Routes - Payments
$router->get('/api/payments/check-reference', 'PaymentController::check_reference');
$router->get('/api/payments/applicable-discounts', 'PaymentController::get_applicable_discounts');
$router->get('/api/payments', 'PaymentController::get_payments');
$router->get('/api/payments/student/{student_id}', 'PaymentController::get_payments_by_student')->where_number('student_id');
$router->get('/api/payments/{id}', 'PaymentController::get_payment')->where_number('id');
$router->get('/api/payments/{id}/discounts', 'PaymentController::get_payment_discounts')->where_number('id');
$router->post('/api/payments', 'PaymentController::create_payment');
$router->post('/api/payments/{id}/discounts', 'PaymentController::apply_discount')->where_number('id');
$router->put('/api/payments/{id}', 'PaymentController::update_payment')->where_number('id');
$router->put('/api/payments/{id}/recalculate', 'PaymentController::recalculate_totals')->where_number('id');
$router->delete('/api/payments/{id}', 'PaymentController::delete_payment')->where_number('id');
$router->delete('/api/payments/{payment_id}/discounts/{discount_id}', 'PaymentController::remove_discount')->where_number('payment_id')->where_number('discount_id');

// Proof of Payment File Routes
$router->post('/api/payments/{id}/upload-proof', 'PaymentController::upload_proof')->where_number('id');
$router->delete('/api/payments/{id}/delete-proof', 'PaymentController::delete_proof')->where_number('id');
$router->get('/api/payments/{id}/proof-info', 'PaymentController::get_proof_info')->where_number('id');

// API Routes - Discount Templates (Admin)
$router->get('/api/admin/discount-templates', 'DiscountController::api_discount_templates_get');
$router->post('/api/admin/discount-templates', 'DiscountController::api_discount_templates_create');
$router->put('/api/admin/discount-templates/{id}', 'DiscountController::api_discount_templates_update')->where_number('id');
$router->delete('/api/admin/discount-templates/{id}', 'DiscountController::api_discount_templates_delete')->where_number('id');
$router->put('/api/admin/discount-templates/{id}/toggle', 'DiscountController::api_discount_templates_toggle')->where_number('id');

// API Routes - Payment Discounts
$router->get('/api/payment-discounts', 'PaymentDiscountController::get_discounts');
$router->get('/api/payment-discounts/student/{student_id}/period/{period_id}', 'PaymentDiscountController::get_student_discounts')->where_number('student_id')->where_number('period_id');
$router->post('/api/payment-discounts', 'PaymentDiscountController::create_discount');

// API Routes - Payment Plans
$router->get('/api/payment-plans', 'PaymentPlanController::get_plans');
$router->get('/api/payment-plans/{id}', 'PaymentPlanController::get_plan')->where_number('id');
$router->get('/api/payment-plans/{id}/installments', 'PaymentPlanController::get_installments')->where_number('id');
$router->post('/api/payment-plans', 'PaymentPlanController::create_plan');
$router->put('/api/payment-plans/{id}', 'PaymentPlanController::update_plan')->where_number('id');
$router->delete('/api/payment-plans/{id}', 'PaymentPlanController::delete_plan')->where_number('id');

// API Routes - Enrollment Periods
$router->get('/api/enrollment-periods', 'EnrollmentPeriodController::api_enrollment_periods');
$router->get('/api/enrollment-periods/active', 'EnrollmentPeriodController::api_enrollment_period_active');
$router->get('/api/enrollment-periods/{id}', 'EnrollmentPeriodController::api_enrollment_period_by_id')->where_number('id');
$router->post('/api/enrollment-periods', 'EnrollmentPeriodController::api_enrollment_period_create');
$router->put('/api/enrollment-periods/{id}', 'EnrollmentPeriodController::api_enrollment_period_update')->where_number('id');
$router->post('/api/enrollment-periods/{id}/set-active', 'EnrollmentPeriodController::api_enrollment_period_set_active')->where_number('id');
$router->delete('/api/enrollment-periods/{id}', 'EnrollmentPeriodController::api_enrollment_period_delete')->where_number('id');

// API Routes - Document Requirements (Admin)
$router->get('/api/admin/document-requirements', 'DocumentRequirementController::api_get_all');
$router->get('/api/document-requirements/{gradeLevel}/{enrollmentType?}', 'DocumentRequirementController::api_get_by_criteria');
$router->post('/api/admin/document-requirements', 'DocumentRequirementController::api_create');
$router->put('/api/admin/document-requirements/{id}', 'DocumentRequirementController::api_update')->where_number('id');
$router->delete('/api/admin/document-requirements/{id}', 'DocumentRequirementController::api_delete')->where_number('id');
$router->patch('/api/admin/document-requirements/{id}/toggle', 'DocumentRequirementController::api_toggle_active')->where_number('id');

// API Routes - Announcements (Admin)
$router->get('/api/announcements', 'AnnouncementController::api_get_announcements');
$router->get('/api/announcements/{id}', 'AnnouncementController::api_get_announcement')->where_number('id');
$router->post('/api/announcements', 'AnnouncementController::api_create_announcement');
$router->put('/api/announcements/{id}', 'AnnouncementController::api_update_announcement')->where_number('id');
$router->delete('/api/announcements/{id}', 'AnnouncementController::api_delete_announcement')->where_number('id');

// API Routes - Campuses (Admin)
$router->get('/api/campuses', 'CampusController::api_get_campuses');
$router->get('/api/campuses/{id}', 'CampusController::api_get_campus')->where_number('id');
$router->post('/api/campuses', 'CampusController::api_create_campus');
$router->put('/api/campuses/{id}', 'CampusController::api_update_campus')->where_number('id');
$router->delete('/api/campuses/{id}', 'CampusController::api_delete_campus')->where_number('id');

// API Routes - Attendance (Teacher & Student)
$router->post('/api/attendance/mark', 'AttendanceController::api_mark_attendance');
$router->post('/api/attendance/bulk', 'AttendanceController::api_bulk_insert_attendance');
$router->post('/api/attendance/sessions', 'AttendanceController::api_create_session');
$router->get('/api/attendance/teacher/{teacher_id}/sessions', 'AttendanceController::api_get_teacher_sessions')->where_number('teacher_id');
$router->get('/api/attendance/sessions/{session_id}', 'AttendanceController::api_get_session_attendance')->where_number('session_id');
$router->put('/api/attendance/session/{session_id}/student/{student_id}', 'AttendanceController::api_update_session_attendance')->where_number('session_id');
$router->get('/api/attendance/student/{student_id}', 'AttendanceController::api_get_student_attendance')->where_number('student_id');
$router->get('/api/attendance/course/{course_id}', 'AttendanceController::api_get_course_attendance')->where_number('course_id');
$router->get('/api/attendance/today', 'AttendanceController::api_get_today_attendance');

// API Routes - PDF Report Generation (Admin/Teacher)
$router->get('/api/reports/students', 'ReportController::api_get_students');
$router->get('/api/reports/student/{student_id}/pdf', 'ReportController::api_generate_student_report')->where_number('student_id');
$router->get('/api/reports/debug/student/{student_id}/grades', 'ReportController::api_debug_student_grades')->where_number('student_id');
$router->post('/api/reports/bulk/pdf', 'ReportController::api_generate_bulk_reports');

// API Routes - Final Grades (Teacher)
$router->post('/api/final-grades/submit', 'FinalGradesController::api_submit_grades');
$router->get('/api/final-grades', 'FinalGradesController::api_get_final_grades');

// API Routes - Messages (Student & Teacher)
$router->get('/api/messages', 'MessageController::api_get_inbox');
$router->post('/api/messages', 'MessageController::api_send_message');
$router->get('/api/messages/{id}', 'MessageController::api_get_message')->where_number('id');
$router->put('/api/messages/{id}/read', 'MessageController::api_mark_as_read')->where_number('id');
$router->get('/api/messages/conversation/{user_id}', 'MessageController::api_get_conversation')->where_number('user_id');
$router->delete('/api/messages/{id}', 'MessageController::api_delete_message')->where_number('id');

// API Routes - Broadcasts (Teacher & Admin)
$router->get('/api/broadcasts/my', 'BroadcastController::api_get_my_broadcasts');
$router->post('/api/broadcasts', 'BroadcastController::api_create_broadcast');
$router->get('/api/broadcasts/{id}', 'BroadcastController::api_get_broadcast')->where_number('id');
$router->get('/api/broadcasts/subject/{subject_id}', 'BroadcastController::api_get_broadcasts_by_subject')->where_number('subject_id');
$router->get('/api/broadcasts/section/{section_id}', 'BroadcastController::api_get_broadcasts_by_section')->where_number('section_id');
$router->delete('/api/broadcasts/{id}', 'BroadcastController::api_delete_broadcast')->where_number('id');

// API Routes - Enrollments (Student enrollment management)
$router->post('/api/enrollments/classify-student', 'EnrollmentClassificationController::api_classify_student');
$router->post('/api/enrollments/submit', 'EnrollmentController::api_submit_enrollment');
$router->get('/api/enrollments/stats', 'EnrollmentController::api_get_enrollment_stats');
$router->get('/api/adviser/enrollments/eligible-students', 'EnrollmentAdminController::api_adviser_eligible_students');
$router->post('/api/adviser/enrollments/submit', 'EnrollmentAdminController::api_adviser_submit_enrollment');
$router->get('/api/enrollments/latest', 'EnrollmentController::api_get_latest_enrollment');
$router->get('/api/enrollments/{id}/status', 'EnrollmentController::api_get_enrollment_status')->where_number('id');
$router->get('/api/enrollments/{id}/payments', 'EnrollmentController::api_get_enrollment_payments')->where_number('id');
$router->get('/api/adviser/enrollments/{id}/payments', 'EnrollmentAdminController::api_adviser_enrollment_payments')->where_number('id');
$router->get('/api/enrollments/{id}/preview-for-continuing', 'EnrollmentController::api_get_enrollment_preview_for_continuing')->where_number('id');
$router->post('/api/enrollments/{id}/discounts', 'EnrollmentController::api_create_enrollment_discount')->where_number('id');
$router->get('/api/enrollments/{id}', 'EnrollmentController::api_get_enrollment')->where_number('id');
$router->get('/api/enrollments', 'EnrollmentController::api_get_enrollments');
$router->put('/api/enrollments/{id}/status', 'EnrollmentController::api_update_enrollment_status')->where_number('id');
$router->post('/api/enrollments/auto-create-continuing', 'EnrollmentController::api_auto_create_continuing');

// API Routes - Student Data
$router->get('/api/students/current-grade', 'EnrollmentController::api_get_current_grade');

// API Routes - Admin Enrollment Management
$router->get('/api/admin/enrollments/stats', 'EnrollmentAdminController::api_admin_enrollments_stats');
$router->get('/api/admin/enrollments/{id}', 'EnrollmentAdminController::api_admin_enrollment_detail')->where_number('id');
$router->post('/api/admin/enrollments/{id}/approve', 'EnrollmentAdminController::api_admin_enrollment_approve')->where_number('id');
$router->post('/api/admin/enrollments/{id}/reject', 'EnrollmentAdminController::api_admin_enrollment_reject')->where_number('id');
$router->post('/api/admin/documents/{id}/verify', 'EnrollmentAdminController::api_admin_document_verify')->where_number('id');
$router->post('/api/admin/documents/toggle-manual', 'EnrollmentAdminController::api_admin_document_toggle_manual');
$router->post('/api/admin/documents/{id}/reject', 'EnrollmentAdminController::api_admin_document_reject')->where_number('id');
$router->get('/api/admin/enrollments', 'EnrollmentAdminController::api_admin_enrollments');
$router->get('/api/adviser/enrollments', 'EnrollmentAdminController::api_adviser_enrollments');

// API Routes - Teacher Assignments (Admin only)
$router->get('/api/teachers/me/adviser-levels', 'TeacherController::api_get_my_adviser_levels');
$router->get('/api/teachers/me/subjects', 'TeacherController::api_get_my_subjects');
$router->get('/api/teachers/advisers', 'TeacherController::api_get_advisers');
$router->get('/api/teachers/assignments', 'TeacherController::api_get_assignments');
$router->post('/api/teachers/assign-adviser', 'TeacherController::api_assign_adviser');
$router->post('/api/teachers/assign-subject', 'TeacherController::api_assign_subject');
$router->get('/api/teachers/{id}/subjects', 'TeacherController::api_get_teacher_subjects')->where_number('id');
$router->delete('/api/teachers/assignment', 'TeacherController::api_remove_assignment');