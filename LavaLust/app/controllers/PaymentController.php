<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Payment Controller
 * Handles payment operations and API endpoints
 */
class PaymentController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->call->model('PaymentModel');
        $this->call->model('PaymentDiscountApplicationModel');
    }

    /**
     * Check if a reference number already exists
     * GET /api/payments/check-reference?reference=MCC-INV-20260206-123456-789
     */
    public function check_reference()
    {
        header('Content-Type: application/json');
        
        try {
            $reference = $this->io->get('reference');
            
            if (empty($reference)) {
                echo json_encode([
                    'success' => false,
                    'exists' => false,
                    'message' => 'Reference number is required'
                ]);
                return;
            }

            // Check if reference number exists in payments table
            $exists = $this->PaymentModel->reference_exists($reference);

            echo json_encode([
                'success' => true,
                'exists' => $exists,
                'reference' => $reference
            ]);

        } catch (Exception $e) {
            error_log('Check reference error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'exists' => false,
                'message' => 'Error checking reference number'
            ]);
        }
    }

    /**
     * Get all payments with optional filters
     * GET /api/payments
     */
    public function get_payments()
    {
        header('Content-Type: application/json');
        
        try {
            // Safely get GET parameters - check if they exist first
            $filters = [];
            
            if (isset($_GET['student_id']) && !empty($_GET['student_id'])) {
                $filters['student_id'] = $_GET['student_id'];
            }
            
            if (isset($_GET['academic_period_id']) && !empty($_GET['academic_period_id'])) {
                $filters['academic_period_id'] = $_GET['academic_period_id'];
            }
            
            if (isset($_GET['payment_type']) && !empty($_GET['payment_type'])) {
                $filters['payment_type'] = $_GET['payment_type'];
            }
            
            if (isset($_GET['status']) && !empty($_GET['status'])) {
                $filters['status'] = $_GET['status'];
            }
            
            if (isset($_GET['date_from']) && !empty($_GET['date_from'])) {
                $filters['date_from'] = $_GET['date_from'];
            }
            
            if (isset($_GET['date_to']) && !empty($_GET['date_to'])) {
                $filters['date_to'] = $_GET['date_to'];
            }

            $payments = $this->PaymentModel->get_all($filters);

            echo json_encode([
                'success' => true,
                'data' => $payments,
                'count' => count($payments)
            ]);

        } catch (Exception $e) {
            error_log('Get payments error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching payments'
            ]);
        }
    }

    /**
     * Get payments for a specific student
     * GET /api/payments/student/{student_id}
     */
    public function get_payments_by_student($student_id)
    {
        header('Content-Type: application/json');
        
        try {
            // Validate student_id
            if (!is_numeric($student_id) || $student_id <= 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid student ID'
                ]);
                return;
            }

            // Get payments for this student
            $payments = $this->PaymentModel->get_all(['student_id' => $student_id]);

            echo json_encode([
                'success' => true,
                'payments' => $payments,
                'count' => count($payments)
            ]);

        } catch (Exception $e) {
            error_log('Get payments by student error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching payments for student'
            ]);
        }
    }

    /**
     * Get single payment by ID
     * GET /api/payments/{id}
     */
    public function get_payment($id)
    {
        header('Content-Type: application/json');
        
        try {
            $payment = $this->PaymentModel->get_payment($id);

            if (!$payment) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Payment not found'
                ]);
                return;
            }

            echo json_encode([
                'success' => true,
                'data' => $payment
            ]);

        } catch (Exception $e) {
            error_log('Get payment error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching payment'
            ]);
        }
    }

    /**
     * Create new payment
     * POST /api/payments
     * Supports both JSON and multipart/form-data for file uploads
     */
    public function create_payment()
    {
        header('Content-Type: application/json');

        try {
            $data = [];
            $proof_of_payment_url = null;

            // Check if this is a multipart form request (with file upload)
            $content_type = $_SERVER['CONTENT_TYPE'] ?? '';
            if (strpos($content_type, 'multipart/form-data') !== false) {
                // Handle multipart form data with file upload
                $data = $_POST;

                // Handle proof of payment file upload
                if (isset($_FILES['proof_of_payment']) && $_FILES['proof_of_payment']['error'] !== UPLOAD_ERR_NO_FILE) {
                    // Load the proof of payment helper
                    require_once APP_DIR . 'helpers/proof_of_payment_helper.php';

                    $upload_result = upload_proof_of_payment('proof_of_payment');

                    if (!$upload_result['success']) {
                        echo json_encode([
                            'success' => false,
                            'message' => 'File upload failed: ' . $upload_result['message']
                        ]);
                        return;
                    }

                    $proof_of_payment_url = $upload_result['relative_path'];
                }
            } else {
                // Handle regular JSON request
                $data = json_decode(file_get_contents('php://input'), true);
            }

            // Log the received data for debugging
            error_log('Payment creation request: ' . json_encode($data));

            // Validate required fields
            if (empty($data['student_id']) || empty($data['amount']) || empty($data['payment_for'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields: student_id, amount, and payment_for are required'
                ]);
                return;
            }

            // Add proof of payment URL if uploaded
            if ($proof_of_payment_url) {
                $data['proof_of_payment_url'] = $proof_of_payment_url;
            }

            // Note: We don't check for duplicate reference numbers here since the frontend
            // already generates unique references and validates them. This avoids false positives.

            $paymentId = $this->PaymentModel->create($data);

            if ($paymentId) {
                $payment = $this->PaymentModel->get_payment($paymentId);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Payment created successfully',
                    'data' => $payment
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to create payment'
                ]);
            }

        } catch (Exception $e) {
            error_log('Create payment error: ' . $e->getMessage());
            error_log('Create payment trace: ' . $e->getTraceAsString());
            echo json_encode([
                'success' => false,
                'message' => 'Error creating payment: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update payment
     * PUT /api/payments/{id}
     */
    public function update_payment($id)
    {
        header('Content-Type: application/json');
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            // Check if reference number is being changed and if new one exists
            if (!empty($data['reference_number'])) {
                $currentPayment = $this->PaymentModel->get_payment($id);
                if ($currentPayment['reference_number'] !== $data['reference_number']) {
                    $exists = $this->PaymentModel->reference_exists($data['reference_number']);
                    if ($exists) {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Reference number already exists'
                        ]);
                        return;
                    }
                }
            }

            $success = $this->PaymentModel->update($id, $data);

            if ($success) {
                $payment = $this->PaymentModel->get_payment($id);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Payment updated successfully',
                    'data' => $payment
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to update payment'
                ]);
            }

        } catch (Exception $e) {
            error_log('Update payment error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error updating payment'
            ]);
        }
    }

    /**
     * Delete payment
     * DELETE /api/payments/{id}
     */
    public function delete_payment($id)
    {
        header('Content-Type: application/json');
        
        try {
            $success = $this->PaymentModel->delete($id);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Payment deleted successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to delete payment'
                ]);
            }

        } catch (Exception $e) {
            error_log('Delete payment error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting payment'
            ]);
        }
    }

    /**
     * Get applicable discounts for a payment
     * GET /api/payments/applicable-discounts?student_id=123&payment_type=Tuition%20Full%20Payment
     */
    public function get_applicable_discounts()
    {
        header('Content-Type: application/json');
        
        try {
            $student_id = $this->io->get('student_id');
            $payment_type = $this->io->get('payment_type');
            
            if (empty($student_id) || empty($payment_type)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Student ID and payment type are required'
                ]);
                return;
            }

            $discounts = $this->PaymentDiscountApplicationModel->get_applicable_discounts($student_id, $payment_type);

            echo json_encode([
                'success' => true,
                'data' => $discounts
            ]);

        } catch (Exception $e) {
            error_log('Get applicable discounts error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching discounts'
            ]);
        }
    }

    /**
     * Get discounts applied to a payment
     * GET /api/payments/{id}/discounts
     */
    public function get_payment_discounts($payment_id)
    {
        header('Content-Type: application/json');
        
        try {
            $discounts = $this->PaymentDiscountApplicationModel->get_payment_discounts($payment_id);

            echo json_encode([
                'success' => true,
                'data' => $discounts
            ]);

        } catch (Exception $e) {
            error_log('Get payment discounts error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching payment discounts: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Apply discount to a payment
     * POST /api/payments/{id}/discounts
     * Body: { discount_id: number, original_amount: number }
     */
    public function apply_discount($payment_id)
    {
        header('Content-Type: application/json');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['discount_id'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Discount ID is required'
                ]);
                return;
            }

            $discount_id = $input['discount_id'];
            $original_amount = $input['original_amount'] ?? 0;

            // Get discount details (using new dictionary_templates table)
            $discount = $this->db->table('discount_templates')
                ->where('id', $discount_id)
                ->get();

            if (!$discount) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Discount not found'
                ]);
                return;
            }

            // Calculate discount amount
            // Map value_type -> discount_type, value -> discount_value
            $discount_amount = $this->PaymentDiscountApplicationModel->calculate_discount_amount(
                $original_amount,
                $discount['value_type'],
                $discount['value']
            );

            // Apply discount
            $result = $this->PaymentDiscountApplicationModel->apply_discount(
                $payment_id,
                $discount_id,
                $discount_amount
            );

            echo json_encode($result);

        } catch (Exception $e) {
            error_log('Apply discount error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error applying discount: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove discount from a payment
     * DELETE /api/payments/{id}/discounts/{discount_id}
     */
    public function remove_discount($payment_id, $discount_id)
    {
        header('Content-Type: application/json');
        
        try {
            $result = $this->PaymentDiscountApplicationModel->remove_discount($payment_id, $discount_id);
            echo json_encode($result);

        } catch (Exception $e) {
            error_log('Remove discount error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error removing discount'
            ]);
        }
    }

    /**
     * Recalculate payment totals after discount changes
     * PUT /api/payments/{id}/recalculate
     */
    public function recalculate_totals($payment_id)
    {
        header('Content-Type: application/json');
        
        try {
            $result = $this->PaymentDiscountApplicationModel->recalculate_payment_total($payment_id);
            
            if ($result['success']) {
                // Get updated payment
                $payment = $this->PaymentModel->get_payment($payment_id);
                
                echo json_encode([
                    'success' => true,
                    'data' => $payment,
                    'total_discount' => $result['total_discount']
                ]);
            } else {
                echo json_encode($result);
            }

        } catch (Exception $e) {
            error_log('Recalculate totals error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error recalculating totals'
            ]);
        }
    }

    /**
     * Upload proof of payment file for existing payment
     * POST /api/payments/{id}/upload-proof
     */
    public function upload_proof($payment_id)
    {
        header('Content-Type: application/json');

        try {
            // Check if payment exists
            $payment = $this->PaymentModel->get_payment($payment_id);
            if (!$payment) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Payment not found'
                ]);
                return;
            }

            // Load the proof of payment helper
            require_once APP_DIR . 'helpers/proof_of_payment_helper.php';

            // Upload the file
            $upload_result = upload_proof_of_payment('proof_of_payment');

            if (!$upload_result['success']) {
                echo json_encode([
                    'success' => false,
                    'message' => 'File upload failed: ' . $upload_result['message']
                ]);
                return;
            }

            // Update payment with proof of payment URL
            $update_data = [
                'proof_of_payment_url' => $upload_result['relative_path']
            ];

            $update_result = $this->PaymentModel->update($payment_id, $update_data);

            if ($update_result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Proof of payment uploaded successfully',
                    'data' => [
                        'file_url' => $upload_result['file_url'],
                        'file_name' => $upload_result['file_name'],
                        'file_size' => $upload_result['file_size']
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to update payment with proof of payment'
                ]);
            }

        } catch (Exception $e) {
            error_log('Upload proof error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error uploading proof of payment: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete proof of payment file
     * DELETE /api/payments/{id}/delete-proof
     */
    public function delete_proof($payment_id)
    {
        header('Content-Type: application/json');

        try {
            // Check if payment exists
            $payment = $this->PaymentModel->get_payment($payment_id);
            if (!$payment) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Payment not found'
                ]);
                return;
            }

            // Check if payment has a proof of payment file
            if (empty($payment['proof_of_payment_url'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No proof of payment file found for this payment'
                ]);
                return;
            }

            // Load the proof of payment helper
            require_once APP_DIR . 'helpers/proof_of_payment_helper.php';

            // Delete the file
            $delete_result = delete_proof_of_payment($payment['proof_of_payment_url']);

            if (!$delete_result['success']) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to delete file: ' . $delete_result['message']
                ]);
                return;
            }

            // Update payment to remove proof of payment URL
            $update_data = [
                'proof_of_payment_url' => null
            ];

            $update_result = $this->PaymentModel->update($payment_id, $update_data);

            if ($update_result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Proof of payment deleted successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to update payment record'
                ]);
            }

        } catch (Exception $e) {
            error_log('Delete proof error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting proof of payment: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get proof of payment file information
     * GET /api/payments/{id}/proof-info
     */
    public function get_proof_info($payment_id)
    {
        header('Content-Type: application/json');

        try {
            // Check if payment exists
            $payment = $this->PaymentModel->get_payment($payment_id);
            if (!$payment) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Payment not found'
                ]);
                return;
            }

            // Check if payment has a proof of payment file
            if (empty($payment['proof_of_payment_url'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No proof of payment file found for this payment'
                ]);
                return;
            }

            // Load the proof of payment helper
            require_once APP_DIR . 'helpers/proof_of_payment_helper.php';

            // Get file information
            $file_info = get_proof_of_payment_info($payment['proof_of_payment_url']);

            if ($file_info['success']) {
                echo json_encode([
                    'success' => true,
                    'data' => $file_info
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => $file_info['message']
                ]);
            }

        } catch (Exception $e) {
            error_log('Get proof info error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error retrieving proof of payment information: ' . $e->getMessage()
            ]);
        }
    }
}
