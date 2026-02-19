<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Payment Penalty Model
 * 
 * Handles database operations for payment_installment_penalties table
 */
class PaymentPenaltyModel extends Model
{
    /**
     * Create a new penalty record
     */
    public function create($data)
    {
        try {
            $this->db->table('payment_installment_penalties')->insert($data);
            return $this->db->insert_id();
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::create error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get penalty by ID
     */
    public function get_by_id($penaltyId)
    {
        try {
            $result = $this->db->table('payment_installment_penalties pip')
                ->select('
                    pip.*,
                    i.installment_number,
                    i.due_date,
                    i.balance,
                    pp.student_id,
                    CONCAT(u.first_name, " ", u.last_name) as waived_by_name
                ')
                ->left_join('installments i', 'i.installment_id = pip.installment_id')
                ->left_join('payment_plans pp', 'pp.payment_plan_id = i.payment_plan_id')
                ->left_join('users u', 'u.user_id = pip.waived_by')
                ->where('pip.penalty_id', $penaltyId)
                ->get();

            return $result ? $result[0] : null;
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::get_by_id error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get all penalties for an installment
     */
    public function get_by_installment($installmentId)
    {
        try {
            return $this->db->table('payment_installment_penalties pip')
                ->select('
                    pip.*,
                    CONCAT(u.first_name, " ", u.last_name) as waived_by_name
                ')
                ->left_join('users u', 'u.user_id = pip.waived_by')
                ->where('pip.installment_id', $installmentId)
                ->order_by('pip.created_at', 'DESC')
                ->get_all();
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::get_by_installment error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get all penalties for a student
     */
    public function get_by_student($studentId)
    {
        try {
            return $this->db->table('payment_installment_penalties pip')
                ->select('
                    pip.*,
                    i.installment_number,
                    i.due_date,
                    i.balance,
                    pp.tuition_package_name,
                    CONCAT(u.first_name, " ", u.last_name) as waived_by_name
                ')
                ->join('installments i', 'i.installment_id = pip.installment_id')
                ->join('payment_plans pp', 'pp.payment_plan_id = i.payment_plan_id')
                ->left_join('users u', 'u.user_id = pip.waived_by')
                ->where('pp.student_id', $studentId)
                ->order_by('pip.created_at', 'DESC')
                ->get_all();
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::get_by_student error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Waive a penalty
     */
    public function waive_penalty($penaltyId, $waiveData)
    {
        try {
            $this->db->table('payment_installment_penalties')
                ->where('penalty_id', $penaltyId)
                ->update($waiveData);

            return $this->db->affected_rows() > 0;
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::waive_penalty error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if installment has any unwaived penalties
     */
    public function has_unwaived_penalty($installmentId)
    {
        try {
            $result = $this->db->table('payment_installment_penalties')
                ->where('installment_id', $installmentId)
                ->where('waived', 0)
                ->get();

            return !empty($result);
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::has_unwaived_penalty error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get total unwaived penalties for an installment
     */
    public function get_total_unwaived_penalty($installmentId)
    {
        try {
            $result = $this->db->table('payment_installment_penalties')
                ->select('SUM(penalty_amount) as total_penalty')
                ->where('installment_id', $installmentId)
                ->where('waived', 0)
                ->get();

            return $result && isset($result[0]['total_penalty']) ? (float)$result[0]['total_penalty'] : 0;
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::get_total_unwaived_penalty error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Update penalty with payment ID
     */
    public function update_payment_id($penaltyId, $paymentId)
    {
        try {
            $this->db->table('payment_installment_penalties')
                ->where('penalty_id', $penaltyId)
                ->update(['payment_id' => $paymentId]);

            return $this->db->affected_rows() > 0;
        } catch (Exception $e) {
            error_log('PaymentPenaltyModel::update_payment_id error: ' . $e->getMessage());
            return false;
        }
    }
}
?>
