<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Payment Penalty Controller
 * 
 * Handles penalty-related operations:
 * - Recording penalties when payments are made
 * - Waiving penalties (admin only)
 * - Retrieving penalty history
 */
class PaymentPenaltyController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->call->model('PaymentPenaltyModel');
        $this->call->helper('jwt_helper');
        
        // Verify authentication
        $this->user = verify_jwt_token();
        if (!$this->user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            exit;
        }
    }

    /**
     * Record a penalty when payment is made
     * POST /api/payment-penalties/record
     * 
     * Body: {
     *   installment_id: number,
     *   penalty_amount: number,
     *   days_overdue: number,
     *   payment_id: number (optional, can be set later)
     * }
     */
    public function record_penalty()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['installment_id']) || !isset($input['penalty_amount']) || !isset($input['days_overdue'])) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Missing required fields: installment_id, penalty_amount, days_overdue'
                ]);
                return;
            }

            $penaltyData = [
                'installment_id' => $input['installment_id'],
                'penalty_amount' => $input['penalty_amount'],
                'days_overdue' => $input['days_overdue'],
                'payment_id' => $input['payment_id'] ?? null,
                'waived' => 0,
                'waived_by' => null,
                'waived_at' => null,
                'waived_reason' => null
            ];

            $penaltyId = $this->PaymentPenaltyModel->create($penaltyData);

            if ($penaltyId) {
                http_response_code(201);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Penalty recorded successfully',
                    'penalty_id' => $penaltyId
                ]);
            } else {
                throw new Exception('Failed to record penalty');
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to record penalty: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Waive a penalty (admin only)
     * PUT /api/payment-penalties/{id}/waive
     * 
     * Body: {
     *   reason: string
     * }
     */
    public function waive_penalty($penaltyId)
    {
        try {
            // Check admin permission
            if ($this->user->role !== 'admin' && $this->user->role !== 'finance') {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Only admin or finance users can waive penalties'
                ]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['reason']) || trim($input['reason']) === '') {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Waiver reason is required'
                ]);
                return;
            }

            $waiveData = [
                'waived' => 1,
                'waived_by' => $this->user->id,
                'waived_at' => date('Y-m-d H:i:s'),
                'waived_reason' => $input['reason']
            ];

            $success = $this->PaymentPenaltyModel->waive_penalty($penaltyId, $waiveData);

            if ($success) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Penalty waived successfully'
                ]);
            } else {
                throw new Exception('Failed to waive penalty');
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to waive penalty: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get penalty history for an installment
     * GET /api/payment-penalties/installment/{installment_id}
     */
    public function get_by_installment($installmentId)
    {
        try {
            $penalties = $this->PaymentPenaltyModel->get_by_installment($installmentId);

            echo json_encode([
                'status' => 'success',
                'data' => $penalties
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to fetch penalties: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get penalty by ID
     * GET /api/payment-penalties/{id}
     */
    public function get_by_id($penaltyId)
    {
        try {
            $penalty = $this->PaymentPenaltyModel->get_by_id($penaltyId);

            if ($penalty) {
                echo json_encode([
                    'status' => 'success',
                    'data' => $penalty
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Penalty not found'
                ]);
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to fetch penalty: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get all penalties for a student
     * GET /api/payment-penalties/student/{student_id}
     */
    public function get_by_student($studentId)
    {
        try {
            $penalties = $this->PaymentPenaltyModel->get_by_student($studentId);

            echo json_encode([
                'status' => 'success',
                'data' => $penalties
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to fetch penalties: ' . $e->getMessage()
            ]);
        }
    }
}
?>
