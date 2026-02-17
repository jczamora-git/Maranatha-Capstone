<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

class DocumentRequirement_model extends Model {

    /**
     * Get all document requirements
     */
    public function get_all_requirements() {
        return $this->db->table('document_requirements')
            ->order_by('grade_level', 'ASC')
            ->order_by('enrollment_type', 'ASC')
            ->order_by('display_order', 'ASC')
            ->get_all();
    }

    /**
     * Get all active document requirements (for display)
     */
    public function get_active_requirements() {
        return $this->db->table('document_requirements')
            ->where('is_active', 1)
            ->order_by('grade_level', 'ASC')
            ->order_by('enrollment_type', 'ASC')
            ->order_by('display_order', 'ASC')
            ->get_all();
    }

    /**
     * Get requirements by grade level and enrollment type
     */
    public function get_requirements_by_criteria($gradeLevel, $enrollmentType = null) {
        // Debug logging
        error_log("Querying for grade_level: '$gradeLevel', enrollment_type: '$enrollmentType'");
        
        if ($enrollmentType) {
            // Get requirements for specific type OR general (NULL type)
            $sql = "SELECT * FROM document_requirements 
                    WHERE grade_level = ? 
                    AND is_active = 1 
                    AND (enrollment_type = ? OR enrollment_type IS NULL)
                    ORDER BY display_order ASC";
            
            error_log("SQL: $sql");
            error_log("Params: [" . $gradeLevel . ", " . $enrollmentType . "]");
            
            $stmt = $this->db->raw($sql, [$gradeLevel, $enrollmentType]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Results count: " . count($results));
            
            return $results;
        } else {
            // Get only general requirements (NULL type)
            $sql = "SELECT * FROM document_requirements 
                    WHERE grade_level = ? 
                    AND is_active = 1 
                    AND enrollment_type IS NULL
                    ORDER BY display_order ASC";
            
            $stmt = $this->db->raw($sql, [$gradeLevel]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    /**
     * Get single requirement by ID
     */
    public function get_requirement_by_id($id) {
        return $this->db->table('document_requirements')
            ->where('id', $id)
            ->get();
    }

    /**
     * Create new requirement
     */
    public function create_requirement($data) {
        $this->db->table('document_requirements')->insert($data);
        return $this->db->insert_id();
    }

    /**
     * Update requirement
     */
    public function update_requirement($id, $data) {
        return $this->db->table('document_requirements')
            ->where('id', $id)
            ->update($data);
    }

    /**
     * Delete requirement
     */
    public function delete_requirement($id) {
        return $this->db->table('document_requirements')
            ->where('id', $id)
            ->delete();
    }

    /**
     * Toggle active status
     */
    public function toggle_active($id) {
        $requirement = $this->get_requirement_by_id($id);
        if (!$requirement) {
            return false;
        }

        $newStatus = $requirement['is_active'] ? 0 : 1;
        return $this->db->table('document_requirements')
            ->where('id', $id)
            ->update(['is_active' => $newStatus]);
    }

    /**
     * Get unique grade levels
     */
    public function get_grade_levels() {
        return $this->db->table('document_requirements')
            ->select('DISTINCT grade_level')
            ->order_by('grade_level', 'ASC')
            ->get_all();
    }
}
?>
