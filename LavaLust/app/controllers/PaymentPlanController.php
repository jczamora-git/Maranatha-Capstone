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
        $this->call->model('PaymentScheduleTemplateModel');
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
                empty($input['total_tuition']) || empty($input['template_id'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields (student_id, academic_period_id, total_tuition, template_id)'
                ]);
                return;
            }

            // Fetch template and its installments
            $template = $this->PaymentScheduleTemplateModel->get_by_id($input['template_id']);
            if (!$template || $template['status'] !== 'active') {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid or inactive payment schedule template'
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
                'schedule_type' => $template['schedule_type'],
                'number_of_installments' => $template['number_of_installments'],
                'template_id' => $input['template_id'],
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

            // Generate installments from template
            $installments = $this->generate_installments_from_template(
                $plan_id,
                $input['total_tuition'],
                $template,
                $input['academic_period_id'],
                $input['start_date'] ?? date('Y-m-d')
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
     * Update "Upon Enrollment" installments with actual enrollment date
     * PUT /api/payment-plans/{id}/set-enrollment-date
     */
    public function set_enrollment_date($plan_id)
    {
        header('Content-Type: application/json');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['enrollment_date'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'enrollment_date is required'
                ]);
                return;
            }
            
            // Update all installments with NULL due_date (Upon Enrollment) for this plan
            $updated = $this->db->table('installments')
                ->where('payment_plan_id', $plan_id)
                ->where('due_date', null)
                ->update(['due_date' => $input['enrollment_date']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Enrollment date set for Upon Enrollment installments',
                'installments_updated' => $updated
            ]);
        } catch (Exception $e) {
            error_log("Error setting enrollment date: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error setting enrollment date: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Generate installment schedule based on schedule type
     * For Quarterly: 4 payments (Aug, Nov, Feb, May)
     * For Monthly: 10 payments (Aug-May school year, 15th of each month)
     * For Semestral: 2 payments (Aug, Jan)
     * For Tri Semestral: 3 payments (Aug, Dec, Apr)
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
        // Semestral: 2 payments
        elseif ($schedule_type === 'Semestral') {
            $due_dates = [
                $start_year . '-08-15',  // 1st Semester
                ($start_year + 1) . '-01-15'   // 2nd Semester
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
        // Tri Semestral: 3 payments
        elseif ($schedule_type === 'Tri Semestral') {
            $due_dates = [
                $start_year . '-08-15',  // 1st Tri Semester
                $start_year . '-12-15',  // 2nd Tri Semester
                ($start_year + 1) . '-04-15'   // 3rd Tri Semester
            ];
            
            for ($i = 0; $i < min($num_installments, 3); $i++) {
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

        
        return $installments;
    }

    /**
     * Generate installments from template (NEW METHOD)
     * Uses week-of-month scheduling from payment_schedule_installment_templates
     */
    private function generate_installments_from_template($plan_id, $total_amount, $template, $academic_period_id, $start_date)
    {
        $installments = [];
        
        // Get template installments
        $template_installments = $template['installments'] ?? [];
        
        if (empty($template_installments)) {
            error_log("No template installments found for template: " . $template['id']);
            return $installments;
        }
        
        // Get academic period for school year
        $period = $this->db->table('academic_periods')
                          ->where('id', $academic_period_id)
                          ->get();
        
        $school_year = $period ? $period['school_year'] : date('Y') . '-' . (date('Y') + 1);
        $year_parts = explode('-', $school_year);
        $start_year = (int)$year_parts[0];
        
        // Calculate amount per installment
        $num_installments = count($template_installments);
        $amount_per_installment = round($total_amount / $num_installments, 2);
        
        // Adjust last installment for rounding differences
        $total_allocated = $amount_per_installment * ($num_installments - 1);
        $last_installment_amount = $total_amount - $total_allocated;
        
        foreach ($template_installments as $index => $template_inst) {
            $due_date = $this->calculate_due_date_from_template(
                $template_inst,
                $start_year,
                $start_date
            );
            
            // Create installment data
            $installment_data = [
                'payment_plan_id' => $plan_id,
                'installment_number' => $template_inst['installment_number'],
                'amount_due' => ($index === $num_installments - 1) ? $last_installment_amount : $amount_per_installment,
                'amount_paid' => 0,
                'balance' => ($index === $num_installments - 1) ? $last_installment_amount : $amount_per_installment,
                'status' => 'Pending',
                'late_fee' => 0,
                'days_overdue' => 0
            ];
            
            // Only set due_date if it's not null (Upon Enrollment can be null for flexibility)
            if ($due_date !== null) {
                $installment_data['due_date'] = $due_date;
            }
            
            $installments[] = $installment_data;
        }
        
        return $installments;
    }
    
    /**
     * Calculate actual due date from template week-of-month rule
     * Returns NULL for "Upon Enrollment" if no enrollment date provided (for flexibility)
     */
    private function calculate_due_date_from_template($template_inst, $start_year, $enrollment_date)
    {
        $week_of_month = $template_inst['week_of_month'];
        $month = $template_inst['month'];
        
        // Handle "Upon Enrollment"
        if ($week_of_month === 'Upon Enrollment') {
            // If no enrollment date provided, return NULL for flexibility
            // This allows setting the due date later when actual enrollment happens
            if (empty($enrollment_date) || $enrollment_date === '0000-00-00') {
                return null;
            }
            return $enrollment_date;
        }
        
        // Parse month ("01" to "12")
        $month_num = (int)$month;
        
        // Determine year (Jan-Jul is next year, Aug-Dec is current year)
        $year = ($month_num >= 1 && $month_num <= 7) ? $start_year + 1 : $start_year;
        
        // Calculate day based on week
        $day = $this->get_day_from_week($week_of_month, $year, $month_num);
        
        return sprintf('%04d-%02d-%02d', $year, $month_num, $day);
    }
    
    /**
     * Get actual day number from week-of-month label
     */
    private function get_day_from_week($week_label, $year, $month)
    {
        // Week definitions:
        // 1st week = 1-7 → use day 5 (Friday of 1st week)
        // 2nd week = 8-14 → use day 12 (Friday of 2nd week)
        // 3rd week = 15-21 → use day 19 (Friday of 3rd week)
        // 4th week = 22-28 → use day 26 (Friday of 4th week)
        // Last week = use 2nd to last day of month
        
        switch ($week_label) {
            case '1st week':
                return 5;
            case '2nd week':
                return 12;
            case '3rd week':
                return 19;
            case '4th week':
                return 26;
            case 'Last week':
                // Get last day of month minus 1
                $last_day = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                return max(1, $last_day - 1);
            default:
                return 15; // Default to mid-month
        }
    }
}
