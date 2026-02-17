<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Feature Flag Configuration
 * 
 * Controls which features are enabled in the backend API.
 * 
 * IMPORTANT FOR DEVELOPMENT:
 * - Set ENVIRONMENT in config.php to 'development' or 'production'
 * - In DEVELOPMENT: All features are enabled for testing
 * - In PRODUCTION: Only deployment-ready features are enabled
 * 
 * @return array Feature flags
 */

// Load environment from config
$CI =& get_instance();
$environment = $CI->config->item('environment') ?? 'production';

/**
 * Production Feature Flags (for Hostinger deployment)
 * Only enable features that are ready for end-users
 */
$production_features = [
    // Phase 1: Core Features (Always Enabled)
    'authentication' => true,
    'user_management' => true,
    'teacher_management' => true,
    
    // Phase 1: Enrollment & Payment (Currently Deployed)
    'enrollment' => true,
    'payment' => true,
    'adviser_enrollment' => true,
    
    // Phase 2: Academic Features (Under Development - DISABLED in production)
    'courses' => true,
    'course_management' => false,
    'subjects' => true,
    'activities' => false,
    'quizzes' => false,
    'grading' => false,
    'class_records' => false,
    
    // Phase 2: Communication Features (Under Development - DISABLED in production)
    'messages' => false,
    'announcements' => false,
    'broadcasts' => false,
    
    // Phase 2: Attendance Features (Under Development - DISABLED in production)
    'attendance' => false,
    'rfid_scanner' => false,
    'qr_attendance' => false,
    
    // Phase 3: Advanced Features (Future - DISABLED in production)
    'reports' => false,
    'analytics' => false,
    'learning_materials' => false,
];

/**
 * Development Feature Flags (for local development)
 * All features enabled so you can develop and test everything
 */
$development_features = [
    // Everything enabled in development for testing
    'authentication' => true,
    'user_management' => true,
    'teacher_management' => true,
    'enrollment' => true,
    'payment' => true,
    'adviser_enrollment' => true,
    'courses' => true,
    'course_management' => true,
    'subjects' => true,
    'activities' => true,
    'quizzes' => true,
    'grading' => true,
    'class_records' => true,
    'messages' => true,
    'announcements' => true,
    'broadcasts' => true,
    'attendance' => true,
    'rfid_scanner' => true,
    'qr_attendance' => true,
    'reports' => true,
    'analytics' => true,
    'learning_materials' => true,
];

// Return appropriate feature set based on environment
return ($environment === 'development') ? $development_features : $production_features;
