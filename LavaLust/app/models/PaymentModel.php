<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Payment Model
 * Handles payment data operations
 */
class PaymentModel extends Model
{
    protected $table = 'payments';

    /**
     * Check if a reference number already exists
     */
    public function reference_exists($reference_number)
    {
        $result = $this->db->table($this->table)
                           ->where('reference_number', $reference_number)
                           ->get();
        
        // Returns true only if a record was found (result is not empty/null/false)
        return !empty($result) && $result !== false && $result !== null;
    }

    /**
     * Get all payments with optional filters
     */
    public function get_all($filters = [])
    {
        $query = $this->db->table($this->table . ' p');
        
        // Join with users table to get student info
        $query = $query->left_join('users u', 'p.student_id = u.id')
                       ->left_join('students s', 'p.student_id = s.user_id')
                       ->left_join('academic_periods ap', 'p.academic_period_id = ap.id');

        // Apply filters
        if (!empty($filters['student_id'])) {
            $query = $query->where('p.student_id', $filters['student_id']);
        }

        if (!empty($filters['academic_period_id'])) {
            $query = $query->where('p.academic_period_id', $filters['academic_period_id']);
        }

        if (!empty($filters['payment_type'])) {
            $query = $query->where('p.payment_type', $filters['payment_type']);
        }

        if (!empty($filters['status'])) {
            $query = $query->where('p.status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query = $query->where('p.payment_date >=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query = $query->where('p.payment_date <=', $filters['date_to']);
        }

        // Select fields
        $query = $query->select('p.*, 
                                 u.first_name, u.last_name, u.email,
                                 s.student_id as student_number,
                                 ap.school_year, ap.quarter,
                                 CONCAT(u.first_name, " ", u.last_name) as student_name');

        return $query->order_by('p.created_at', 'DESC')->get_all();
    }

    /**
     * Get single payment by ID
     */
    public function get_payment($id)
    {
        return $this->db->table($this->table . ' p')
                        ->left_join('users u', 'p.student_id = u.id')
                        ->left_join('students s', 'p.student_id = s.user_id')
                        ->left_join('academic_periods ap', 'p.academic_period_id = ap.id')
                        ->left_join('users received', 'p.received_by = received.id')
                        ->left_join('users verified', 'p.verified_by = verified.id')
                        ->select('p.*, 
                                 u.first_name, u.last_name, u.email,
                                 s.student_id as student_number,
                                 ap.school_year, ap.quarter,
                                 CONCAT(u.first_name, " ", u.last_name) as student_name,
                                 CONCAT(received.first_name, " ", received.last_name) as received_by_name,
                                 CONCAT(verified.first_name, " ", verified.last_name) as verified_by_name')
                        ->where('p.id', $id)
                        ->get();
    }

    /**
     * Get student's payment history
     */
    public function get_student_payments($student_id, $academic_period_id = null)
    {
        $query = $this->db->table($this->table)
                          ->where('student_id', $student_id);

        if ($academic_period_id) {
            $query = $query->where('academic_period_id', $academic_period_id);
        }

        return $query->order_by('payment_date', 'DESC')->get_all();
    }

    /**
     * Create new payment
     */
    public function create($data)
    {
        // Set defaults
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');

        // Set default status if not provided
        if (!isset($data['status'])) {
            $data['status'] = 'Approved';
        }

        // Set is_refund default
        if (!isset($data['is_refund'])) {
            $data['is_refund'] = 0;
        }

        // Generate receipt number if not provided
        if (!isset($data['receipt_number']) || empty($data['receipt_number'])) {
            $data['receipt_number'] = $this->generate_receipt_number();
        }

        // Insert payment record
        $payment_id = $this->db->table($this->table)->insert($data);

        // If this is a Tuition Installment payment, update installment and payment plan
        if ($payment_id && !empty($data['installment_id']) && $data['payment_type'] === 'Tuition Installment') {
            $this->update_installment_payment($data['installment_id'], $data['amount']);
        }

        return $payment_id;
    }

    /**
     * Update installment when payment is made
     */
    private function update_installment_payment($installment_id, $payment_amount)
    {
        // Get installment details
        $installment = $this->db->table('installments')
                               ->where('id', $installment_id)
                               ->get();

        if (!$installment) {
            return false;
        }

        // Calculate new amounts
        $new_amount_paid = $installment['amount_paid'] + $payment_amount;
        $new_balance = $installment['amount_due'] - $new_amount_paid;

        // Determine status
        $status = 'Pending';
        if ($new_balance <= 0) {
            $status = 'Paid';
            $new_balance = 0;
        } elseif ($new_amount_paid > 0) {
            $status = 'Partial';
        }

        // Check if overdue
        $today = date('Y-m-d');
        if ($status !== 'Paid' && $installment['due_date'] < $today) {
            $status = 'Overdue';
        }

        // Update installment
        $this->db->table('installments')
                ->where('id', $installment_id)
                ->update([
                    'amount_paid' => $new_amount_paid,
                    'balance' => $new_balance,
                    'status' => $status,
                    'paid_date' => $status === 'Paid' ? date('Y-m-d') : null,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

        // Update payment plan totals
        $this->update_payment_plan_totals($installment['payment_plan_id']);

        return true;
    }

    /**
     * Update payment plan totals based on installment payments
     */
    private function update_payment_plan_totals($payment_plan_id)
    {
        // Get payment plan
        $plan = $this->db->table('payment_plans')
                        ->where('id', $payment_plan_id)
                        ->get();

        if (!$plan) {
            return false;
        }

        // Calculate total paid from all installments
        $installments = $this->db->table('installments')
                                ->where('payment_plan_id', $payment_plan_id)
                                ->get_all();

        $total_paid = 0;
        foreach ($installments as $inst) {
            $total_paid += $inst['amount_paid'];
        }

        $new_balance = $plan['total_tuition'] - $total_paid;

        // Determine status
        $status = $plan['status'];
        if ($new_balance <= 0) {
            $status = 'Completed';
            $new_balance = 0;
        } elseif ($total_paid > 0) {
            $status = 'Active';
        }

        // Update payment plan
        $this->db->table('payment_plans')
                ->where('id', $payment_plan_id)
                ->update([
                    'total_paid' => $total_paid,
                    'balance' => $new_balance,
                    'status' => $status,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

        return true;
    }

    /**
     * Generate unique receipt number
     */
    private function generate_receipt_number()
    {
        $prefix = 'RCP-';
        $date = date('Ym');
        $random = rand(1000, 9999);
        return $prefix . $date . '-' . $random;
    }

    /**
     * Update payment
     */
    public function update($id, $data)
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        return $this->db->table($this->table)
                        ->where('id', $id)
                        ->update($data);
    }

    /**
     * Delete payment
     */
    public function delete($id)
    {
        return $this->db->table($this->table)
                        ->where('id', $id)
                        ->delete();
    }

    /**
     * Get total payments for a student in an academic period
     */
    public function get_student_total_paid($student_id, $academic_period_id)
    {
        $result = $this->db->table($this->table)
                           ->select_sum('amount')
                           ->where('student_id', $student_id)
                           ->where('academic_period_id', $academic_period_id)
                           ->where('status !=', 'Rejected')
                           ->where('is_refund', 0)
                           ->get();

        return $result ? floatval($result['amount']) : 0.00;
    }

    /**
     * Get payment statistics for dashboard
     */
    public function get_payment_stats($academic_period_id = null)
    {
        $query = $this->db->table($this->table);

        if ($academic_period_id) {
            $query = $query->where('academic_period_id', $academic_period_id);
        }

        $totalResult = $query->select_sum('amount')
                             ->where('status !=', 'Rejected')
                             ->where('is_refund', 0)
                             ->get();

        $total = $totalResult ? floatval($totalResult['amount']) : 0.00;

        $statusCounts = [
            'pending' => 0,
            'verified' => 0,
            'approved' => 0,
            'rejected' => 0
        ];

        $statuses = ['Pending', 'Verified', 'Approved', 'Rejected'];
        foreach ($statuses as $status) {
            $countQuery = $this->db->table($this->table);
            if ($academic_period_id) {
                $countQuery = $countQuery->where('academic_period_id', $academic_period_id);
            }
            $count = $countQuery->where('status', $status)->count_all();
            $statusCounts[strtolower($status)] = $count;
        }

        return [
            'total_amount' => $total,
            'status_counts' => $statusCounts
        ];
    }
}
