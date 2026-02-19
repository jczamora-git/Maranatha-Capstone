<?php

/**
 * EnrollmentController - Handle enrollment submissions and management
 * Manages student enrollment applications and status
 */
class EnrollmentController extends Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Submit new enrollment
     * POST /api/enrollments/submit
     * 
     * Expected JSON body with form data
     */
    public function api_submit_enrollment()
    {
        api_set_json_headers();
        
        // Handle CORS preflight
        header('Access-Control-Allow-Origin: http://localhost:5174');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        try {
            // Check authentication
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $userEmail = $this->session->userdata('email');
            $userName = $this->session->userdata('first_name') . ' ' . $this->session->userdata('last_name');

            // Get form input (FormData from frontend)
            // Extract from $_POST and $_FILES since FormData sends multipart/form-data
            $input = $_POST; // Get all POST fields
            
            // If no POST data and JSON headers, try JSON
            if (empty($input)) {
                $jsonInput = json_decode(file_get_contents('php://input'), true);
                if ($jsonInput) {
                    $input = $jsonInput;
                }
            }

            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No input data provided']);
                return;
            }

            // Check if this is admin-created enrollment
            $isAdminCreated = isset($input['is_admin_created']) && $input['is_admin_created'] === '1';
            if ($isAdminCreated) {
                $userId = null; // Admin-created enrollments don't have a user_id
            }

            // Handle account creation if requested
            $createdUserId = null;
            $createdStudentId = null;
            if ($isAdminCreated && isset($input['create_account']) && $input['create_account'] === '1') {
                // Validate account creation fields
                if (empty($input['account_email']) || empty($input['account_phone'])) {
                    http_response_code(422);
                    echo json_encode(['success' => false, 'message' => 'Account email and phone are required when creating account']);
                    return;
                }

                // Check if email already exists
                if ($this->UserModel->email_exists($input['account_email'])) {
                    http_response_code(422);
                    echo json_encode(['success' => false, 'message' => 'Email address already exists']);
                    return;
                }

                // Create user account
                $userData = [
                    'email' => $input['account_email'],
                    'password' => null, // Will be set via token
                    'role' => 'enrollee',
                    'first_name' => $input['learner_first_name'] ?? '',
                    'middle_name' => $input['learner_middle_name'] ?? '',
                    'last_name' => $input['learner_last_name'] ?? '',
                    'phone' => $input['account_phone'],
                    'status' => 'active',
                    'must_change_password' => 1
                ];
                $createdUserId = $this->UserModel->create($userData);

                if (!$createdUserId) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Failed to create user account']);
                    return;
                }

                // Create student record (only for regular enrollments, not admin-created)
                if (!$isAdminCreated) {
                    $studentData = [
                        'user_id' => $createdUserId,
                        'student_id' => null, // Will be generated later
                        'year_level' => $input['grade_level'] ?? '',
                        'enrollment_id' => null // Will be set after enrollment creation
                    ];
                    $createdStudentId = $this->StudentModel->insert($studentData);

                    if (!$createdStudentId) {
                        // Rollback user creation
                        $this->UserModel->delete_user($createdUserId);
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Failed to create student record']);
                        return;
                    }
                }

                // Generate password reset token
                $token = bin2hex(random_bytes(32)); // 64 character token
                $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

                // Store token in password_resets table
                $tokenData = [
                    'email' => $input['account_email'],
                    'user_id' => $createdUserId,
                    'token' => $token,
                    'type' => 'account_setup',
                    'expires_at' => $expiresAt,
                    'used' => 0,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
                $this->db->table('password_resets')->insert($tokenData);

                // Send email with set-password link
                $resetLink = "http://localhost:5174/set-password?token=" . urlencode($token);
                $emailBody = generate_set_password_email($input['learner_first_name'], $resetLink);
                $emailResult = sendNotif($input['account_email'], 'Set Your Password - Maranatha Enrollment', $emailBody);

                if (!$emailResult['success']) {
                    // Log error but don't fail the enrollment
                    error_log('Failed to send password setup email: ' . $emailResult['message']);
                }
            }

            // Validate required fields
            $errors = $this->validate_enrollment_input($input);
            if (!empty($errors)) {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'Validation failed', 'errors' => $errors]);
                return;
            }

            // Prepare enrollment data structure
            $enrollmentData = [
                'user_id' => $userId,
                'created_user_id' => $createdUserId,
                'created_student_id' => $createdStudentId,
                'enrollment_type' => $input['enrollment_type'] ?? 'New Student',
                'grade_level' => $input['grade_level'] ?? '',
                'enrollment_period_id' => $input['enrollment_period_id'] ?? null,
                'learner' => [
                    'first_name' => $input['learner_first_name'] ?? '',
                    'middle_name' => $input['learner_middle_name'] ?? '',
                    'last_name' => $input['learner_last_name'] ?? '',
                    'birth_date' => $input['birth_date'] ?? null,
                    'gender' => $input['gender'] ?? '',
                    'psa_birth_cert_number' => $input['psa_birth_cert_number'] ?? null
                ],
                'addresses' => [
                    'current' => [
                        'street' => $input['current_address'] ?? '',
                        'barangay' => $input['current_barangay'] ?? '',
                        'municipality' => $input['current_municipality'] ?? '',
                        'province' => $input['current_province'] ?? '',
                        'zip_code' => $input['current_zip_code'] ?? '',
                        'phone' => $input['current_phone'] ?? ''
                    ],
                    'permanent' => [
                        'street' => $input['permanent_address'] ?? '',
                        'barangay' => $input['permanent_barangay'] ?? '',
                        'municipality' => $input['permanent_municipality'] ?? '',
                        'province' => $input['permanent_province'] ?? '',
                        'zip_code' => $input['permanent_zip_code'] ?? '',
                        'phone' => $input['permanent_phone'] ?? ''
                    ]
                ],
                'flags' => [
                    'is_indigenous_ip' => $input['is_indigenous_ip'] ?? 0,
                    'is_4ps_beneficiary' => $input['is_4ps_beneficiary'] ?? 0,
                    'has_disability' => $input['has_disability'] ?? 0,
                    'disability_type' => $input['disability_type'] ?? null,
                    'special_language' => $input['special_language'] ?? null
                ],
                'contacts' => [
                    [
                        'type' => 'Father',
                        'name' => $input['father_name'] ?? '',
                        'phone' => $input['father_contact'] ?? '',
                        'email' => $input['father_email'] ?? '',
                        'is_primary' => 1
                    ],
                    [
                        'type' => 'Mother',
                        'name' => $input['mother_name'] ?? '',
                        'phone' => $input['mother_contact'] ?? '',
                        'email' => $input['mother_email'] ?? '',
                        'is_primary' => 0
                    ]
                ]
            ];

            // Add guardian if provided
            if (!empty($input['guardian_name'])) {
                $enrollmentData['contacts'][] = [
                    'type' => 'Guardian',
                    'name' => $input['guardian_name'],
                    'phone' => $input['guardian_contact'] ?? '',
                    'email' => $input['guardian_email'] ?? '',
                    'is_primary' => 0
                ];
            }

            // Handle document uploads if present
            $enrollmentData['documents'] = [];
            if (isset($_FILES['documents'])) {
                $uploadedDocs = $this->process_document_uploads($_FILES['documents'], $input);
                $enrollmentData['documents'] = $uploadedDocs;
            }

            // Create enrollment
            $enrollmentId = $this->EnrollmentModel->create_enrollment($enrollmentData);

            if (!$enrollmentId) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create enrollment']);
                return;
            }

            // Update student record with enrollment_id if account was created
            if ($createdStudentId) {
                $this->StudentModel->update_student($createdStudentId, ['enrollment_id' => $enrollmentId]);
            }

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Enrollment submitted successfully',
                'enrollment_id' => $enrollmentId,
                'status' => 'Pending',
                'next_steps' => 'Your enrollment is under review. Please check back for updates.'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get enrollment by ID
     * GET /api/enrollments/{id}
     */
    public function api_get_enrollment()
    {
        api_set_json_headers();

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $userRole = $this->session->userdata('role');

            $enrollmentId = uri_segments(3);

            if (!is_numeric($enrollmentId)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid enrollment ID']);
                return;
            }

            $enrollment = $this->EnrollmentModel->get_enrollment_with_details($enrollmentId);

            if (!$enrollment) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Enrollment not found']);
                return;
            }

            // Check authorization (user can only view their own enrollments unless admin)
            if ($userId != $enrollment['created_user_id'] && $userRole !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden']);
                return;
            }

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $enrollment]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get enrollment status details
     * GET /api/enrollments/{id}/status
     * 
     * Returns enrollment details with timeline and document verification status
     */
    public function api_get_enrollment_status()
    {
        api_set_json_headers();

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $userRole = $this->session->userdata('role');

            // Robustly extract enrollment ID from URL: /api/enrollments/{id}/status
            $enrollmentId = segment(3);
            
            if (!is_numeric($enrollmentId)) {
                $uri = trim($_SERVER['REQUEST_URI'], '/');
                $parts = explode('/', $uri);
                // Search for the first numeric part assume it's the ID
                foreach ($parts as $part) {
                    if (is_numeric($part)) {
                        $enrollmentId = $part;
                        break;
                    }
                }
            }

            if (!is_numeric($enrollmentId)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid enrollment ID: ' . $enrollmentId]);
                return;
            }

            // Debug: Log the enrollment ID being searched
            error_log("Searching for enrollment ID: " . $enrollmentId);

            $enrollment = $this->EnrollmentModel->get_enrollment_with_details($enrollmentId);
            
            // Debug: Log what was found
            error_log("Enrollment found: " . ($enrollment ? "YES" : "NO"));
            if ($enrollment) {
                error_log("Enrollment data: " . print_r($enrollment, true));
            }

            if (!$enrollment) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Enrollment not found']);
                return;
            }

            // Check authorization (user can only view their own enrollments unless admin)
            if ($userId != $enrollment['created_user_id'] && $userRole !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden']);
                return;
            }

            // Build timeline based on enrollment status
            $timeline = [];
            if (!empty($enrollment['created_date'])) {
                $timeline[] = [
                    'date' => $enrollment['created_date'],
                    'event' => 'Application submitted'
                ];
            } elseif (!empty($enrollment['created_at'])) {
                $timeline[] = [
                    'date' => $enrollment['created_at'],
                    'event' => 'Application submitted'
                ];
            }
            if (!empty($enrollment['submitted_date'])) {
                $timeline[] = [
                    'date' => $enrollment['submitted_date'],
                    'event' => 'Documents submitted'
                ];
            }
            if (!empty($enrollment['first_reviewed_date'])) {
                $timeline[] = [
                    'date' => $enrollment['first_reviewed_date'],
                    'event' => 'Application under review'
                ];
            }
            if (!empty($enrollment['approved_date'])) {
                $timeline[] = [
                    'date' => $enrollment['approved_date'],
                    'event' => 'Application approved'
                ];
            }
            if (!empty($enrollment['rejected_date'])) {
                $timeline[] = [
                    'date' => $enrollment['rejected_date'],
                    'event' => 'Application rejected'
                ];
            }

            // Prepare response with enrollment status details
            $confirmationNumber = isset($enrollment['confirmation_number']) ? $enrollment['confirmation_number'] : null;
            if (!$confirmationNumber) {
                $sy = $enrollment['school_year'] ?? '';
                // Extract 4 digits from school_year (e.g. "2025-2026" -> "2025")
                preg_match('/\d{4}/', $sy, $matches);
                $year = !empty($matches) ? $matches[0] : '0000';
                $confirmationNumber = 'APP-' . $year . str_pad($enrollmentId, 3, '0', STR_PAD_LEFT);
            }

            $enrollmentStatus = [
                'id' => $enrollment['id'],
                'confirmation_number' => $confirmationNumber,
                'status' => $enrollment['status'] ?? 'Pending',
                'enrollment_type' => $enrollment['enrollment_type'] ?? null,
                'submitted_date' => $enrollment['submitted_date'] ?? $enrollment['created_at'] ?? $enrollment['created_date'] ?? null,
                'first_reviewed_date' => $enrollment['first_reviewed_date'] ?? null,
                'approved_date' => $enrollment['approved_date'] ?? null,
                'rejected_date' => $enrollment['rejected_date'] ?? null,
                'student_name' => $enrollment['student_name'] ?? (trim(($enrollment['learner']['first_name'] ?? '') . ' ' . ($enrollment['learner']['last_name'] ?? '')) ?: (trim(($enrollment['user_first_name'] ?? '') . ' ' . ($enrollment['user_last_name'] ?? '')) ?: 'Unknown')),
                'grade_level' => $enrollment['grade_level'] ?? '',
                'school_year' => $enrollment['school_year'] ?? '',
                'timeline' => $timeline,
                'next_steps' => $this->get_next_steps($enrollment['status'] ?? 'Pending'),
                'rejection_reason' => $enrollment['rejection_reason'] ?? null,
                'documents' => array_map(function($doc) {
                    return [
                        'type' => $doc['document_type'],
                        'status' => $doc['verification_status'],
                        'uploaded' => $doc['upload_date']
                    ];
                }, $enrollment['documents'] ?? []),
                'created_student_id' => $enrollment['created_student_id'] ?? null
            ];

            http_response_code(200);
            $json = json_encode(['success' => true, 'enrollment' => $enrollmentStatus]);
            if ($json === false) {
                echo json_encode(['success' => false, 'message' => 'JSON Error: ' . json_last_error_msg()]);
            } else {
                echo $json;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get all enrollments (admin only or user's own)
     * GET /api/enrollments
     */
    public function api_get_enrollments()
    {
        api_set_json_headers();
        
        // Handle CORS preflight
        header('Access-Control-Allow-Origin: http://localhost:5174');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $userRole = $this->session->userdata('role');

            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $status = $_GET['status'] ?? null;

            if ($userRole === 'admin') {
                // Admins see all enrollments
                $result = $this->EnrollmentModel->get_enrollments($page, $limit, $status);
            } else {
                // Users see only their own enrollments
                $enrollments = $this->EnrollmentModel->get_enrollments_by_user($userId);
                // Ensure enrollments is an array, default to empty array if false/null
                $enrollmentsArray = is_array($enrollments) ? $enrollments : [];
                $totalCount = count($enrollmentsArray);
                $result = [
                    'data' => $enrollmentsArray,
                    'total' => $totalCount,
                    'page' => 1,
                    'limit' => $totalCount,
                    'pages' => $totalCount > 0 ? 1 : 0
                ];
            }

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get enrollment statistics (admin only)
     * GET /api/enrollments/stats
     */
    public function api_get_enrollment_stats()
    {
        api_set_json_headers();

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userRole = $this->session->userdata('role');
            if ($userRole !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden']);
                return;
            }

            $stats = $this->EnrollmentModel->get_enrollment_stats();

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $stats]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get payments for an enrollment
     * GET /api/enrollments/{id}/payments
     */
    public function api_get_enrollment_payments()
    {
        api_set_json_headers();

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $userRole = $this->session->userdata('role');
            
            $enrollmentId = segment(3);
            
            // If segment retrieval fails (depending on routing setup), try parsing URI
            if (!is_numeric($enrollmentId)) {
                $uri = trim($_SERVER['REQUEST_URI'], '/');
                $parts = explode('/', $uri);
                // Look for numeric part assuming /api/enrollments/{id}/payments
                foreach ($parts as $part) {
                    if (is_numeric($part)) {
                        $enrollmentId = $part;
                        break;
                    }
                }
            }

            if (!is_numeric($enrollmentId)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid enrollment ID']);
                return;
            }

            // Verify enrollment exists and user has access
            // We use get_enrollment_with_details to check ownership
            $enrollment = $this->EnrollmentModel->get_enrollment_with_details($enrollmentId);

            if (!$enrollment) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Enrollment not found']);
                return;
            }

            if ($userId != $enrollment['created_user_id'] && $userRole !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden']);
                return;
            }

            $data = $this->EnrollmentModel->get_enrollment_payments($enrollmentId);

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Update enrollment status (admin only)
     * PUT /api/enrollments/{id}/status
     */
    public function api_update_enrollment_status()
    {
        api_set_json_headers();

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $userRole = $this->session->userdata('role');
            if ($userRole !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden']);
                return;
            }

            $enrollmentId = segment(3);
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['status'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Status is required']);
                return;
            }

            $validStatuses = ['Pending', 'Incomplete', 'Under Review', 'Verified', 'Approved', 'Rejected'];
            if (!in_array($input['status'], $validStatuses)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid status']);
                return;
            }

            $updated = $this->EnrollmentModel->update_status($enrollmentId, $input['status'], $userId);

            if (!$updated) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Enrollment not found']);
                return;
            }

            // log_activity($userId, 'enrollment_status_updated', "Enrollment {$enrollmentId} status changed to {$input['status']}", ['enrollment_id' => $enrollmentId]);

            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Enrollment status updated']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Validate enrollment input
     * @param array $input
     * @return array Errors array
     */
    private function validate_enrollment_input($input)
    {
        $errors = [];

        // Learner info validation
        if (empty($input['learner_first_name'])) {
            $errors['learner_first_name'] = 'First name is required';
        }
        if (empty($input['learner_last_name'])) {
            $errors['learner_last_name'] = 'Last name is required';
        }
        if (empty($input['birth_date'])) {
            $errors['birth_date'] = 'Birth date is required';
        }
        if (empty($input['gender'])) {
            $errors['gender'] = 'Gender is required';
        }
        if (empty($input['grade_level'])) {
            $errors['grade_level'] = 'Grade level is required';
        }

        // Address validation
        if (empty($input['current_address'])) {
            $errors['current_address'] = 'Current address is required';
        }
        if (empty($input['current_province'])) {
            $errors['current_province'] = 'Current province is required';
        }
        if (empty($input['current_municipality'])) {
            $errors['current_municipality'] = 'Current municipality is required';
        }
        if (empty($input['current_phone'])) {
            $errors['current_phone'] = 'Contact number is required';
        }

        // Parent contact validation
        if (empty($input['father_name']) && empty($input['mother_name']) && empty($input['guardian_name'])) {
            $errors['contacts'] = 'At least one parent or guardian contact is required';
        }

        return $errors;
    }

    /**
     * Process document uploads
     * @param array $files FILES array
     * @param array $input POST input
     * @return array Processed document metadata
     */
    private function process_document_uploads($files, $input)
    {
        $documents = [];
        $uploadDir = ROOT_DIR . 'public/uploads/enrollments/';

        // Create upload directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Allowed file types
        $allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB

        // Handle single file or array of files
        $fileArray = is_array($files['name']) ? $files : [$files];

        foreach ($fileArray as $key => $file) {
            if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
                continue;
            }

            // Validate file
            $fileInfo = pathinfo($file['name']);
            $ext = strtolower($fileInfo['extension']);

            if (!in_array($ext, $allowedTypes)) {
                continue; // Skip invalid file types
            }

            if ($file['size'] > $maxFileSize) {
                continue; // Skip oversized files
            }

            // Generate unique filename
            $newFileName = 'enrollment_' . uniqid() . '.' . $ext;
            $uploadPath = $uploadDir . $newFileName;

            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                $documents[] = [
                    'file_name' => $file['name'],
                    'file_path' => '/uploads/enrollments/' . $newFileName,
                    'file_type' => $file['type'],
                    'file_size' => $file['size'],
                    'document_type' => $input['document_type'] ?? 'General'
                ];
            }
        }

        return $documents;
    }

    /**
     * Get next steps message based on enrollment status
     * 
     * @param string $status The enrollment status
     * @return string Next steps message
     */
    private function get_next_steps($status)
    {
        $nextSteps = [
            'Pending' => 'Please wait for our review. We will contact you soon with updates.',
            'Incomplete' => 'Please submit all required documents to proceed with your application.',
            'Under Review' => 'Your application is being reviewed. We will notify you of the decision shortly.',
            'Approved' => 'Congratulations! Your enrollment has been approved. Please proceed to payment.',
            'Rejected' => 'Unfortunately, your application was not approved. Please contact the admissions office for more information.'
        ];

        return $nextSteps[$status] ?? 'Please wait for further updates on your application.';
    }

    /**
     * Get latest enrollment for a user (for pre-populating returning student forms)
     * GET /api/enrollments/latest
     */
    public function api_get_latest_enrollment()
    {
        api_set_json_headers();
        
        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $userRole = $this->session->userdata('role');
            $studentName = isset($_GET['student_name']) ? trim($_GET['student_name']) : null;

            // Build WHERE clause based on context
            $whereClause = '';
            $params = [];

            if ($studentName && $userRole === 'admin') {
                // Admin searching by student name - split into words for better matching
                $nameParts = preg_split('/\s+/', $studentName, -1, PREG_SPLIT_NO_EMPTY);
                $searchTerms = array_map(fn($part) => '%' . $part . '%', $nameParts);
                
                // Build dynamic WHERE clause with OR conditions for each name part
                $orConditions = [];
                foreach ($searchTerms as $searchTerm) {
                    $orConditions[] = "(el.first_name LIKE ? OR el.last_name LIKE ? OR el.middle_name LIKE ?)";
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                }
                
                $whereClause = "
                    WHERE (" . implode(" OR ", $orConditions) . ")
                    AND e.status IN ('Approved', 'Verified', 'Pending')
                ";
            } else {
                // Regular user - search their own enrollments
                $whereClause = "WHERE e.created_user_id = ? AND e.status IN ('Approved', 'Verified')";
                $params = [$userId];
            }

            // Get the latest enrollment
            $query = "
                SELECT 
                    e.id,
                    e.grade_level,
                    e.enrollment_type,
                    e.status,
                    e.submitted_date,
                    el.first_name as learner_first_name,
                    el.middle_name as learner_middle_name,
                    el.last_name as learner_last_name,
                    el.birth_date,
                    el.gender,
                    el.psa_birth_cert_number,
                    ef.is_indigenous_ip,
                    ef.is_4ps_beneficiary,
                    ef.has_disability,
                    ef.disability_type,
                    ef.special_language
                FROM enrollments e
                LEFT JOIN enrollment_learners el ON e.id = el.enrollment_id
                LEFT JOIN enrollment_flags ef ON e.id = ef.enrollment_id
                $whereClause
                ORDER BY e.id DESC
                LIMIT 1
            ";
            
            $stmt = $this->db->raw($query, $params);
            $enrollment = $stmt->fetch();

            if (!$enrollment) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'has_previous_enrollment' => false,
                    'is_first_timer' => true,
                    'data' => null
                ]);
                return;
            }

            // Get addresses
            $addressQuery = "
                SELECT address_type, address, barangay, municipality, province, zip_code, phone
                FROM enrollment_addresses
                WHERE enrollment_id = ?
            ";
            $addressStmt = $this->db->raw($addressQuery, [$enrollment['id']]);
            $addresses = $addressStmt->fetchAll();

            // Get parent contacts
            $contactQuery = "
                SELECT contact_type, name, phone, email
                FROM enrollment_parent_contacts
                WHERE enrollment_id = ?
            ";
            $contactStmt = $this->db->raw($contactQuery, [$enrollment['id']]);
            $contacts = $contactStmt->fetchAll();

            // Flatten addresses
            $flattenedData = [
                'enrollment_id' => $enrollment['id'],
                'enrollment_type' => $enrollment['enrollment_type'],
                'status' => $enrollment['status'],
                'grade_level' => $enrollment['grade_level'],
                'submitted_date' => $enrollment['submitted_date'],
                'learner_first_name' => $enrollment['learner_first_name'],
                'learner_middle_name' => $enrollment['learner_middle_name'],
                'learner_last_name' => $enrollment['learner_last_name'],
                'birth_date' => $enrollment['birth_date'],
                'gender' => $enrollment['gender'],
                'psa_birth_cert_number' => $enrollment['psa_birth_cert_number'],
                'is_indigenous_ip' => (bool)$enrollment['is_indigenous_ip'],
                'is_4ps_beneficiary' => (bool)$enrollment['is_4ps_beneficiary'],
                'has_disability' => (bool)$enrollment['has_disability'],
                'disability_type' => $enrollment['disability_type'],
                'special_language' => $enrollment['special_language'],
                'current_address' => null,
                'current_barangay' => null,
                'current_municipality' => null,
                'current_province' => null,
                'current_zip_code' => null,
                'current_phone' => null,
                'permanent_address' => null,
                'permanent_barangay' => null,
                'permanent_municipality' => null,
                'permanent_province' => null,
                'permanent_zip_code' => null,
                'same_as_current' => false,
                'father_name' => null,
                'father_contact' => null,
                'father_email' => null,
                'mother_name' => null,
                'mother_contact' => null,
                'mother_email' => null,
                'guardian_name' => null,
                'guardian_contact' => null,
                'guardian_email' => null
            ];

            // Process addresses
            foreach ($addresses as $addr) {
                if ($addr['address_type'] === 'Current') {
                    $flattenedData['current_address'] = $addr['address'];
                    $flattenedData['current_barangay'] = $addr['barangay'];
                    $flattenedData['current_municipality'] = $addr['municipality'];
                    $flattenedData['current_province'] = $addr['province'];
                    $flattenedData['current_zip_code'] = $addr['zip_code'];
                    $flattenedData['current_phone'] = $addr['phone'];
                } elseif ($addr['address_type'] === 'Permanent') {
                    $flattenedData['permanent_address'] = $addr['address'];
                    $flattenedData['permanent_barangay'] = $addr['barangay'];
                    $flattenedData['permanent_municipality'] = $addr['municipality'];
                    $flattenedData['permanent_province'] = $addr['province'];
                    $flattenedData['permanent_zip_code'] = $addr['zip_code'];
                }
            }

            // Check if same as current
            if ($flattenedData['permanent_address'] && $flattenedData['current_address']) {
                $flattenedData['same_as_current'] = (
                    $flattenedData['permanent_address'] === $flattenedData['current_address'] &&
                    $flattenedData['permanent_barangay'] === $flattenedData['current_barangay'] &&
                    $flattenedData['permanent_municipality'] === $flattenedData['current_municipality'] &&
                    $flattenedData['permanent_province'] === $flattenedData['current_province']
                );
            }

            // Process contacts
            foreach ($contacts as $contact) {
                if ($contact['contact_type'] === 'Father') {
                    $flattenedData['father_name'] = $contact['name'];
                    $flattenedData['father_contact'] = $contact['phone'];
                    $flattenedData['father_email'] = $contact['email'];
                } elseif ($contact['contact_type'] === 'Mother') {
                    $flattenedData['mother_name'] = $contact['name'];
                    $flattenedData['mother_contact'] = $contact['phone'];
                    $flattenedData['mother_email'] = $contact['email'];
                } elseif ($contact['contact_type'] === 'Guardian') {
                    $flattenedData['guardian_name'] = $contact['name'];
                    $flattenedData['guardian_contact'] = $contact['phone'];
                    $flattenedData['guardian_email'] = $contact['email'];
                }
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'has_previous_enrollment' => true,
                'is_first_timer' => false,
                'data' => $flattenedData
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get current grade and calculate next grade for returning students
     * GET /api/students/current-grade
     */
    public function api_get_current_grade()
    {
        api_set_json_headers();
        
        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');

            // Get current grade from students table
            $query = "SELECT year_level FROM students WHERE user_id = ? LIMIT 1";
            $stmt = $this->db->raw($query, [$userId]);
            $student = $stmt->fetch();

            if (!$student) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Student record not found']);
                return;
            }

            $currentGrade = $student['year_level'];
            
            // Grade progression mapping
            $gradeProgression = [
                'Nursery 1' => 'Nursery 2',
                'Nursery 2' => 'Kinder',
                'Kinder' => 'Grade 1',
                'Grade 1' => 'Grade 2',
                'Grade 2' => 'Grade 3',
                'Grade 3' => 'Grade 4',
                'Grade 4' => 'Grade 5',
                'Grade 5' => 'Grade 6',
                'Grade 6' => 'Graduated'
            ];

            $nextGrade = $gradeProgression[$currentGrade] ?? $currentGrade;

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'current_grade' => $currentGrade,
                'next_grade' => $nextGrade,
                'can_enroll' => $nextGrade !== 'Graduated'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Auto-create enrollment for continuing student from past enrollment
     * POST /api/enrollments/auto-create-continuing
     * 
     * Body: {
     *   "past_enrollment_id": 12,
     *   "enrollment_period_id": 2,
     *   "new_grade_level": "Grade 2"
     * }
     */
    public function api_auto_create_continuing()
    {
        api_set_json_headers();

        try {
            // Check authentication
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $userId = $this->session->userdata('user_id');
            $input = json_decode(file_get_contents('php://input'), true) ?? [];

            if (empty($input)) {
                $input = $_POST; // Fallback to POST
            }

            // Validate required fields
            $pastEnrollmentId = $input['past_enrollment_id'] ?? null;
            $enrollmentPeriodId = $input['enrollment_period_id'] ?? null;
            $newGradeLevel = $input['new_grade_level'] ?? null;

            if (!$pastEnrollmentId || !$enrollmentPeriodId || !$newGradeLevel) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields: past_enrollment_id, enrollment_period_id, new_grade_level'
                ]);
                return;
            }

            // Create enrollment from past enrollment
            $newEnrollmentId = $this->EnrollmentModel->create_continuing_from_past(
                $pastEnrollmentId,
                $enrollmentPeriodId,
                $newGradeLevel,
                $userId
            );

            if (!$newEnrollmentId) {
                throw new Exception('Failed to create continuing enrollment');
            }

            // Get the new enrollment details
            $newEnrollment = $this->EnrollmentModel->get_enrollment_with_details($newEnrollmentId);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Enrollment created successfully',
                'enrollment_id' => $newEnrollmentId,
                'enrollment' => $newEnrollment
            ]);
        } catch (Exception $e) {
            error_log('Auto-create continuing enrollment error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get past enrollment preview for continuing student
     * GET /api/enrollments/{id}/preview-for-continuing
     * Shows the data that will be auto-filled for the next enrollment period
     */
    public function api_get_enrollment_preview_for_continuing($enrollmentId)
    {
        api_set_json_headers();

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $enrollment = $this->EnrollmentModel->get_enrollment_with_details($enrollmentId);

            if (!$enrollment) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Enrollment not found']);
                return;
            }

            // Get next grade level
            $gradeProgression = [
                'Nursery 1' => 'Nursery 2',
                'Nursery 2' => 'Kinder',
                'Kinder' => 'Grade 1',
                'Grade 1' => 'Grade 2',
                'Grade 2' => 'Grade 3',
                'Grade 3' => 'Grade 4',
                'Grade 4' => 'Grade 5',
                'Grade 5' => 'Grade 6',
                'Grade 6' => 'Graduated'
            ];

            $nextGrade = $gradeProgression[$enrollment['grade_level']] ?? $enrollment['grade_level'];

            if ($nextGrade === 'Graduated') {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Student has graduated and cannot continue enrollment'
                ]);
                return;
            }

            // Return preview data
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'enrollment_id' => $enrollment['id'],
                'learner' => [
                    'first_name' => $enrollment['learner']['first_name'] ?? '',
                    'middle_name' => $enrollment['learner']['middle_name'] ?? '',
                    'last_name' => $enrollment['learner']['last_name'] ?? '',
                    'birth_date' => $enrollment['learner']['birth_date'] ?? '',
                    'gender' => $enrollment['learner']['gender'] ?? ''
                ],
                'current_grade' => $enrollment['grade_level'],
                'next_grade' => $nextGrade,
                'addresses' => $enrollment['addresses'] ?? [],
                'contacts' => $enrollment['contacts'] ?? [],
                'flags' => [
                    'is_indigenous_ip' => $enrollment['flags']['is_indigenous_ip'] ?? 0,
                    'is_4ps_beneficiary' => $enrollment['flags']['is_4ps_beneficiary'] ?? 0,
                    'has_disability' => $enrollment['flags']['has_disability'] ?? 0
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Create enrollment discount record
     * POST /api/enrollments/{id}/discounts
     * 
     * Called when a student makes a full payment with a discount applied
     * Body: {
     *   "enrollment_id": 1,
     *   "discount_template_id": 0,
     *   "discount_name": "Full Payment Discount",
     *   "discount_type": "Fixed Amount" | "Percentage",
     *   "discount_value": 500 | 10,
     *   "discount_amount": 500,
     *   "payment_id": 123,
     *   "notes": "Applied at payment submission"
     * }
     */
    public function api_create_enrollment_discount()
    {
        api_set_json_headers();

        try {
            if (!$this->session->userdata('logged_in')) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            // Extract enrollment ID from URL: /api/enrollments/{id}/discounts
            $enrollmentId = segment(3);
            if (!is_numeric($enrollmentId)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid enrollment ID']);
                return;
            }

            // Get request data
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No input data provided']);
                return;
            }

            // Validate required fields
            if (empty($data['discount_amount']) || $data['discount_amount'] <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid discount amount']);
                return;
            }

            // For now, we don't require a template_id. If not provided or 0, use NULL
            $templateId = isset($data['discount_template_id']) && $data['discount_template_id'] > 0 ? $data['discount_template_id'] : null;

            // Prepare data for insertion
            $insertData = [
                'enrollment_id' => $enrollmentId,
                'template_id' => $templateId,
                'payment_id' => isset($data['payment_id']) ? $data['payment_id'] : null,
                'applied_amount' => $data['discount_amount'],
                'created_at' => date('Y-m-d H:i:s')
            ];

            // Insert into enrollment_discounts table
            $result = $this->db->table('enrollment_discounts')->insert($insertData);

            if ($result) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Enrollment discount record created successfully',
                    'data' => [
                        'id' => $result,
                        'enrollment_id' => $enrollmentId,
                        'payment_id' => $insertData['payment_id'],
                        'discount_amount' => $data['discount_amount'],
                        'discount_name' => $data['discount_name'] ?? 'Discount',
                        'discount_type' => $data['discount_type'] ?? 'Fixed Amount',
                        'notes' => $data['notes'] ?? null
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create enrollment discount record']);
            }
        } catch (Exception $e) {
            error_log('Create enrollment discount error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }


}
