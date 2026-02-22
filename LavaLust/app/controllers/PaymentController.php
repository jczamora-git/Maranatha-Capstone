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
        $this->call->model('PaymentPenaltyModel');
        $this->call->database();
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
     * Check if a service period has already been paid
     * GET /api/payments/check-service-period?student_id=123&month=3&year=2026
     */
    public function check_service_period()
    {
        header('Content-Type: application/json');
        
        try {
            $student_id = $this->io->get('student_id');
            $month = $this->io->get('month');
            $year = $this->io->get('year');
            
            if (empty($student_id) || empty($month) || empty($year)) {
                echo json_encode([
                    'success' => false,
                    'paid' => false,
                    'message' => 'student_id, month, and year are required'
                ]);
                return;
            }

            // Check if this student already paid for this service period
            $result = $this->db->table('payments')
                ->where('student_id', $student_id)
                ->where('is_recurring_service', 1)
                ->where('service_period_month', $month)
                ->where('service_period_year', $year)
                ->where_in('status', ['Approved', 'Verified', 'Pending'])
                ->get();

            $paid = !empty($result);

            echo json_encode([
                'success' => true,
                'paid' => $paid,
                'student_id' => $student_id,
                'month' => $month,
                'year' => $year
            ]);

        } catch (Exception $e) {
            error_log('Check service period error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'paid' => false,
                'message' => 'Error checking service period'
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

            // Add has_been_refunded flag to each payment
            foreach ($payments as &$payment) {
                $refundCheck = $this->db->raw(
                    "SELECT COUNT(*) as refund_count FROM payments WHERE original_payment_id = ? AND is_refund = 1",
                    [$payment['id']]
                );
                $refundRows = $refundCheck ? $refundCheck->fetchAll(PDO::FETCH_ASSOC) : [];
                $payment['has_been_refunded'] = !empty($refundRows) && intval($refundRows[0]['refund_count'] ?? 0) > 0;
            }
            unset($payment); // Break reference

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

            // Extract penalty information (don't save to payments table)
            $penalty_amount = isset($data['penalty_amount']) ? $data['penalty_amount'] : 0;
            $days_overdue = isset($data['days_overdue']) ? $data['days_overdue'] : 0;
            $installment_id = isset($data['installment_id']) ? $data['installment_id'] : null;
            $explanation_id = isset($data['explanation_id']) ? $data['explanation_id'] : null;
            
            // Remove penalty fields from payment data (these go to payment_installment_penalties table)
            unset($data['penalty_amount']);
            unset($data['days_overdue']);
            unset($data['explanation_id']);

            // Handle recurring service payments (like Service Fee)
            if (isset($data['is_recurring_service']) && $data['is_recurring_service'] == 1) {
                // Validate service period fields
                if (empty($data['service_period_month']) || empty($data['service_period_year'])) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Service period month and year are required for recurring service payments'
                    ]);
                    return;
                }

                // Check if this service period has already been paid
                $existingPayment = $this->db->table('payments')
                    ->where('student_id', $data['student_id'])
                    ->where('is_recurring_service', 1)
                    ->where('service_period_month', $data['service_period_month'])
                    ->where('service_period_year', $data['service_period_year'])
                    ->where_in('status', ['Approved', 'Verified', 'Pending'])
                    ->get();

                if (!empty($existingPayment)) {
                    $monthName = date('F', mktime(0, 0, 0, $data['service_period_month'], 1));
                    echo json_encode([
                        'success' => false,
                        'message' => "Service Fee for {$monthName} {$data['service_period_year']} has already been paid"
                    ]);
                    return;
                }
            }

            // Note: We don't check for duplicate reference numbers here since the frontend
            // already generates unique references and validates them. This avoids false positives.

            $paymentId = $this->PaymentModel->create($data);

            if ($paymentId) {
                // Debug logging
                error_log('Payment created with ID: ' . $paymentId);
                error_log('Penalty amount: ' . $penalty_amount);
                error_log('Installment ID: ' . $installment_id);
                error_log('Days overdue: ' . $days_overdue);
                
                // If there's a penalty, create a penalty record
                if ($penalty_amount > 0 && $installment_id) {
                    error_log('Entering penalty creation block...');
                    try {
                        // Get the original installment amount
                        error_log('Fetching installment data for ID: ' . $installment_id);
                        $installment = $this->db->table('installments')
                            ->where('id', $installment_id)
                            ->get();
                        
                        error_log('Installment query result: ' . print_r($installment, true));
                        
                        // get() returns a single row as associative array
                        $original_amount = ($installment && isset($installment['amount_due'])) ? $installment['amount_due'] : 0;
                        
                        error_log('Original amount: ' . $original_amount);
                        
                        $penaltyData = [
                            'installment_id' => $installment_id,
                            'penalty_percentage' => 5.00, // 5% as per school policy
                            'penalty_amount' => $penalty_amount,
                            'original_amount' => $original_amount,
                            'days_overdue' => $days_overdue,
                            'applied_at' => date('Y-m-d H:i:s')
                        ];
                        
                        // Include explanation_id if provided
                        if ($explanation_id) {
                            $penaltyData['explanation_id'] = $explanation_id;
                        }
                        
                        error_log('Penalty data to insert: ' . print_r($penaltyData, true));
                        
                        $penaltyId = $this->PaymentPenaltyModel->create($penaltyData);
                        
                        error_log('PaymentPenaltyModel->create returned: ' . ($penaltyId ? $penaltyId : 'false'));
                        
                        if ($penaltyId) {
                            error_log('SUCCESS: Penalty record created (ID: ' . $penaltyId . ') for installment ' . $installment_id . ': ₱' . $penalty_amount);
                        } else {
                            error_log('FAILED: create() returned false for installment ' . $installment_id);
                        }
                    } catch (Throwable $e) {
                        error_log('EXCEPTION creating penalty record: ' . $e->getMessage());
                        error_log('Error file: ' . $e->getFile() . ' line ' . $e->getLine());
                        error_log('Error trace: ' . $e->getTraceAsString());
                        // Don't fail the payment if penalty record fails
                    }
                } else {
                    error_log('Penalty creation skipped - penalty_amount: ' . $penalty_amount . ', installment_id: ' . $installment_id);
                }
                
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
     * Create a refund payment linked to an original payment
     * POST /api/payments/{id}/refund
     * Body: { amount: number, reason: string, remarks?: string, payment_date?: string, received_by?: int }
     */
    public function create_refund($id)
    {
        header('Content-Type: application/json');

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $refundAmount = isset($input['amount']) ? floatval($input['amount']) : 0;
            $refundReason = trim($input['reason'] ?? '');

            if ($refundAmount <= 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Refund amount must be greater than 0'
                ]);
                return;
            }

            if ($refundReason === '') {
                echo json_encode([
                    'success' => false,
                    'message' => 'Refund reason is required'
                ]);
                return;
            }

            $originalPayment = $this->PaymentModel->get_payment($id);
            if (!$originalPayment) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Original payment not found'
                ]);
                return;
            }

            if (!empty($originalPayment['is_refund']) && intval($originalPayment['is_refund']) === 1) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Cannot refund a refund record'
                ]);
                return;
            }

            if (($originalPayment['status'] ?? '') !== 'Approved') {
                echo json_encode([
                    'success' => false,
                    'message' => 'Only approved payments can be refunded'
                ]);
                return;
            }

            $originalNetAmount = isset($originalPayment['net_amount'])
                ? floatval($originalPayment['net_amount'])
                : (floatval($originalPayment['amount']) - floatval($originalPayment['total_discount'] ?? 0));

            $refundedStmt = $this->db->raw(
                "SELECT COALESCE(SUM(amount), 0) as refunded_total
                 FROM payments
                 WHERE original_payment_id = ? AND is_refund = 1 AND status != 'Rejected'",
                [$id]
            );
            $refundedRows = $refundedStmt ? $refundedStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $alreadyRefunded = !empty($refundedRows) ? floatval($refundedRows[0]['refunded_total'] ?? 0) : 0;
            $remainingRefundable = max(0, $originalNetAmount - $alreadyRefunded);

            if ($refundAmount > $remainingRefundable) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Refund amount exceeds remaining refundable amount of ₱' . number_format($remainingRefundable, 2)
                ]);
                return;
            }

            $usedTx = null;
            if (method_exists($this->db, 'transaction')) {
                $this->db->transaction();
                $usedTx = 'transaction';
            } elseif (method_exists($this->db, 'beginTransaction')) {
                $this->db->beginTransaction();
                $usedTx = 'beginTransaction';
            }

            $refundDate = !empty($input['payment_date']) ? $input['payment_date'] : date('Y-m-d');
            $remarks = trim($input['remarks'] ?? '');
            if ($remarks === '') {
                $remarks = 'Refund for payment ' . ($originalPayment['receipt_number'] ?? ('#' . $id));
            }

            $refundData = [
                'student_id' => $originalPayment['student_id'] ?? null,
                'enrollment_id' => $originalPayment['enrollment_id'] ?? null,
                'academic_period_id' => $originalPayment['academic_period_id'],
                'payment_type' => $originalPayment['payment_type'],
                'payment_for' => 'Refund - ' . ($originalPayment['payment_for'] ?? 'Payment'),
                'amount' => $refundAmount,
                'net_amount' => -$refundAmount, // Negative amount for refunds
                'total_discount' => 0,
                'payment_method' => $originalPayment['payment_method'] ?? 'Cash',
                'payment_date' => $refundDate,
                'reference_number' => null,
                'installment_id' => $originalPayment['installment_id'] ?? null,
                'status' => 'Approved',
                'is_refund' => 1,
                'refund_reason' => $refundReason,
                'original_payment_id' => $id,
                'remarks' => $remarks,
                'received_by' => $input['received_by'] ?? null
            ];

            $refundId = $this->PaymentModel->create($refundData);
            if (!$refundId) {
                throw new Exception('Failed to create refund payment record');
            }

            // Reverse installment/payment-plan totals if original payment was linked to installment
            if (!empty($originalPayment['installment_id'])) {
                $this->reverse_installment_refund(intval($originalPayment['installment_id']), $refundAmount);
            }

            if (($usedTx === 'transaction' || $usedTx === 'beginTransaction') && method_exists($this->db, 'commit')) {
                $this->db->commit();
            }

            $refundPayment = $this->PaymentModel->get_payment($refundId);
            echo json_encode([
                'success' => true,
                'message' => 'Refund created successfully',
                'data' => $refundPayment
            ]);
        } catch (Exception $e) {
            if (method_exists($this->db, 'roll_back')) {
                $this->db->roll_back();
            } elseif (method_exists($this->db, 'rollback')) {
                $this->db->rollback();
            } elseif (method_exists($this->db, 'rollBack')) {
                $this->db->rollBack();
            }

            error_log('Create refund error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error creating refund: ' . $e->getMessage()
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

    /**
     * Get all payment penalties (for admin overview)
     * GET /api/payment-installment-penalties
     */
    public function get_all_penalties()
    {
        header('Content-Type: application/json');
        
        try {
            $penalties = $this->db->table('payment_installment_penalties')
                ->order_by('applied_at', 'DESC')
                ->get_all();

            echo json_encode([
                'success' => true,
                'data' => $penalties,
                'count' => count($penalties),
                'total_penalty_amount' => array_sum(array_map(function($p) {
                    return floatval($p['penalty_amount']);
                }, $penalties))
            ]);

        } catch (Exception $e) {
            error_log('Get penalties error: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error retrieving penalties: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Reverse installment totals when a refund is created
     */
    private function reverse_installment_refund($installmentId, $refundAmount)
    {
        $installment = $this->db->table('installments')
            ->where('id', $installmentId)
            ->get();

        if (!$installment) {
            return false;
        }

        $currentAmountPaid = floatval($installment['amount_paid'] ?? 0);
        $amountDue = floatval($installment['amount_due'] ?? 0);

        $newAmountPaid = max(0, $currentAmountPaid - $refundAmount);
        $newBalance = max(0, $amountDue - $newAmountPaid);

        $newStatus = 'Pending';
        if ($newBalance <= 0) {
            $newStatus = 'Paid';
        } elseif ($newAmountPaid > 0) {
            $newStatus = 'Partial';
        }

        $today = date('Y-m-d');
        if ($newStatus !== 'Paid' && !empty($installment['due_date']) && $installment['due_date'] < $today) {
            $newStatus = 'Overdue';
        }

        $this->db->table('installments')
            ->where('id', $installmentId)
            ->update([
                'amount_paid' => $newAmountPaid,
                'balance' => $newBalance,
                'status' => $newStatus,
                'paid_date' => $newStatus === 'Paid' ? ($installment['paid_date'] ?: date('Y-m-d')) : null,
                'updated_at' => date('Y-m-d H:i:s')
            ]);

        if (!empty($installment['payment_plan_id'])) {
            $this->recalculate_payment_plan_totals(intval($installment['payment_plan_id']));
        }

        return true;
    }

    /**
     * Recalculate payment plan totals from installments
     */
    private function recalculate_payment_plan_totals($paymentPlanId)
    {
        $plan = $this->db->table('payment_plans')
            ->where('id', $paymentPlanId)
            ->get();

        if (!$plan) {
            return false;
        }

        $installments = $this->db->table('installments')
            ->where('payment_plan_id', $paymentPlanId)
            ->get_all();

        $totalPaid = 0;
        foreach ($installments as $installment) {
            $totalPaid += floatval($installment['amount_paid'] ?? 0);
        }

        $planTotal = floatval($plan['total_tuition'] ?? 0);
        $newBalance = max(0, $planTotal - $totalPaid);

        $newStatus = 'Active';
        if ($newBalance <= 0) {
            $newStatus = 'Completed';
        } elseif ($totalPaid <= 0) {
            $newStatus = 'Active';
        }

        $this->db->table('payment_plans')
            ->where('id', $paymentPlanId)
            ->update([
                'total_paid' => $totalPaid,
                'balance' => $newBalance,
                'status' => $newStatus,
                'updated_at' => date('Y-m-d H:i:s')
            ]);

        return true;
    }
}

