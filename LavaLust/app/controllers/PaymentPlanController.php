<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Payment Plan Controller
 * Handles payment plan and installment API endpoints
 */
class PaymentPlanController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->call->model('PaymentPlanModel');
        $this->call->model('InstallmentModel');
    }

    /**
     * Get all payment plans
     * GET /api/payment-plans
     */
    public function get_plans()
    {
        header('Content-Type: application/json');
        
        try {
            $filters = [];
            
            // Check for filters using isset to avoid undefined key warnings
            if (isset($_GET['student_id'])) {
                $filters['student_id'] = $_GET['student_id'];
            }
            if (isset($_GET['academic_period_id'])) {
                $filters['academic_period_id'] = $_GET['academic_period_id'];
            }
            if (isset($_GET['status'])) {
                $filters['status'] = $_GET['status'];
            }
            if (isset($_GET['payment_type'])) {
                $filters['payment_type'] = $_GET['payment_type'];
            }

            $plans = $this->PaymentPlanModel->get_all($filters);
            
            echo json_encode([
                'success' => true,
                'data' => $plans ?: []
            ]);
        } catch (Exception $e) {
            error_log("Error fetching payment plans: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch payment plans'
            ]);
        }
    }

    /**
     * Get single payment plan
     * GET /api/payment-plans/{id}
     */
    public function get_plan($id)
    {
        header('Content-Type: application/json');
        
        try {
            $plan = $this->PaymentPlanModel->get_plan($id);
            
            if (!$plan) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Payment plan not found'
                ]);
                return;
            }

            echo json_encode([
                'success' => true,
                'data' => $plan
            ]);
        } catch (Exception $e) {
            error_log("Error fetching payment plan: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch payment plan'
            ]);
        }
    }

    /**
     * Create new payment plan with installments
     * POST /api/payment-plans
     */
    public function create_plan()
    {
        header('Content-Type: application/json');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (empty($input['student_id']) || empty($input['academic_period_id']) || 
                empty($input['total_tuition']) || empty($input['schedule_type'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                return;
            }

            // Check if student already has active plan for this period
            if ($this->PaymentPlanModel->has_active_plan($input['student_id'], $input['academic_period_id'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Student already has an active payment plan for this academic period'
                ]);
                return;
            }

            // Create payment plan
            $plan_data = [
                'student_id' => $input['student_id'],
                'enrollment_id' => $input['enrollment_id'] ?? null,
                'academic_period_id' => $input['academic_period_id'],
                'total_tuition' => $input['total_tuition'],
                'total_paid' => 0,
                'balance' => $input['total_tuition'],
                'schedule_type' => $input['schedule_type'],
                'number_of_installments' => $input['number_of_installments'] ?? 1,
                'status' => 'Active'
            ];

            $plan_id = $this->PaymentPlanModel->create($plan_data);

            if (!$plan_id) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to create payment plan'
                ]);
                return;
            }

            // Generate installments based on the academic period
            $installments = $this->generate_installments(
                $plan_id,
                $input['total_tuition'],
                $input['number_of_installments'],
                $input['academic_period_id'],
                $input['schedule_type']
            );

            $installments_created = $this->InstallmentModel->create_batch($installments);

            echo json_encode([
                'success' => true,
                'message' => 'Payment plan created successfully',
                'data' => [
                    'plan_id' => $plan_id,
                    'installments_created' => $installments_created
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error creating payment plan: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error creating payment plan: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update payment plan
     * PUT /api/payment-plans/{id}
     */
    public function update_plan($id)
    {
        header('Content-Type: application/json');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->PaymentPlanModel->update($id, $input);
            
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Payment plan updated successfully' : 'Failed to update payment plan'
            ]);
        } catch (Exception $e) {
            error_log("Error updating payment plan: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error updating payment plan'
            ]);
        }
    }

    /**
     * Delete payment plan
     * DELETE /api/payment-plans/{id}
     */
    public function delete_plan($id)
    {
        header('Content-Type: application/json');
        
        try {
            // Delete associated installments first
            $this->InstallmentModel->delete_by_plan($id);
            
            // Delete payment plan
            $result = $this->PaymentPlanModel->delete($id);
            
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Payment plan deleted successfully' : 'Failed to delete payment plan'
            ]);
        } catch (Exception $e) {
            error_log("Error deleting payment plan: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting payment plan'
            ]);
        }
    }

    /**
     * Get installments for a payment plan
     * GET /api/payment-plans/{id}/installments
     */
    public function get_installments($plan_id)
    {
        header('Content-Type: application/json');
        
        try {
            $installments = $this->InstallmentModel->get_by_plan($plan_id);
            
            echo json_encode([
                'success' => true,
                'data' => $installments ?: []
            ]);
        } catch (Exception $e) {
            error_log("Error fetching installments: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch installments'
            ]);
        }
    }

    /**
     * Update installment (due date, amount, etc.)
     * PUT /api/payment-plans/installments/{id}
     */
    public function update_installment($installment_id)
    {
        header('Content-Type: application/json');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $update_data = [];
            if (isset($input['due_date'])) {
                $update_data['due_date'] = $input['due_date'];
            }
            if (isset($input['amount_due'])) {
                $update_data['amount_due'] = $input['amount_due'];
                // Recalculate balance
                $installment = $this->InstallmentModel->get_installment($installment_id);
                if ($installment) {
                    $update_data['balance'] = $input['amount_due'] - $installment['amount_paid'];
                }
            }
            
            $result = $this->InstallmentModel->update($installment_id, $update_data);
            
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Installment updated successfully' : 'Failed to update installment'
            ]);
        } catch (Exception $e) {
            error_log("Error updating installment: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error updating installment: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Generate installment schedule based on schedule type
     * For Quarterly: Uses academic period start dates
     * For Monthly: Spreads across 10 months (Aug-May school year)
     * For Semi-Annual: 2 payments (start and midpoint)
     * For Custom: Spreads evenly based on number of installments
     */
    private function generate_installments($plan_id, $total_tuition, $num_installments, $academic_period_id, $schedule_type)
    {
        $installments = [];
        $amount_per_installment = $total_tuition / $num_installments;
        
        // Get academic period info to determine school year start
        $period = $this->db->table('academic_periods')
                          ->where('id', $academic_period_id)
                          ->get();
        
        // Default start date (August 1st of the school year)
        $school_year = $period ? $period['school_year'] : date('Y') . '-' . (date('Y') + 1);
        $year_parts = explode('-', $school_year);
        $start_year = $year_parts[0];
        
        // Quarterly installments based on quarters
        if ($schedule_type === 'Quarterly') {
            $due_dates = [
                $start_year . '-08-15',  // 1st Quarter
                $start_year . '-11-15',  // 2nd Quarter
                ($start_year + 1) . '-02-15',  // 3rd Quarter
                ($start_year + 1) . '-05-15'   // 4th Quarter
            ];
            
            for ($i = 0; $i < min($num_installments, 4); $i++) {
                $installments[] = [
                    'payment_plan_id' => $plan_id,
                    'installment_number' => $i + 1,
                    'amount_due' => $amount_per_installment,
                    'amount_paid' => 0,
                    'balance' => $amount_per_installment,
                    'due_date' => $due_dates[$i],
                    'status' => 'Pending',
                    'late_fee' => 0,
                    'days_overdue' => 0
                ];
            }
        }
        // Semi-Annual: 2 payments
        elseif ($schedule_type === 'Semi-Annual') {
            $due_dates = [
                $start_year . '-08-15',  // Start of year
                ($start_year + 1) . '-01-15'   // Midpoint
            ];
            
            for ($i = 0; $i < min($num_installments, 2); $i++) {
                $installments[] = [
                    'payment_plan_id' => $plan_id,
                    'installment_number' => $i + 1,
                    'amount_due' => $amount_per_installment,
                    'amount_paid' => 0,
                    'balance' => $amount_per_installment,
                    'due_date' => $due_dates[$i],
                    'status' => 'Pending',
                    'late_fee' => 0,
                    'days_overdue' => 0
                ];
            }
        }
        // Monthly: 10 months (Aug-May)
        elseif ($schedule_type === 'Monthly') {
            $months = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5]; // Aug to May
            
            for ($i = 0; $i < min($num_installments, 10); $i++) {
                $month = $months[$i];
                $year = $month >= 8 ? $start_year : ($start_year + 1);
                $due_date = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-15';
                
                $installments[] = [
                    'payment_plan_id' => $plan_id,
                    'installment_number' => $i + 1,
                    'amount_due' => $amount_per_installment,
                    'amount_paid' => 0,
                    'balance' => $amount_per_installment,
                    'due_date' => $due_date,
                    'status' => 'Pending',
                    'late_fee' => 0,
                    'days_overdue' => 0
                ];
            }
        }
        // Full Payment or Custom
        else {
            $current_date = new DateTime($start_year . '-08-15');
            
            for ($i = 1; $i <= $num_installments; $i++) {
                $installments[] = [
                    'payment_plan_id' => $plan_id,
                    'installment_number' => $i,
                    'amount_due' => $amount_per_installment,
                    'amount_paid' => 0,
                    'balance' => $amount_per_installment,
                    'due_date' => $current_date->format('Y-m-d'),
                    'status' => 'Pending',
                    'late_fee' => 0,
                    'days_overdue' => 0
                ];
                
                // For custom, space out by 1 month
                if ($i < $num_installments) {
                    $current_date->modify('+1 month');
                }
            }
        }
        
        return $installments;
    }
}
