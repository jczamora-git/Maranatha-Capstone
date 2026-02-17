<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Year Level Model
 * Handles year_levels table operations
 */
class YearLevelModel extends Model
{
    protected $table = 'year_levels';

    /**
     * Get all year levels ordered by order field
     */
    public function get_all()
    {
        return $this->db->table($this->table)
                        ->select('id, name, `order`')
                        ->order_by('`order`', 'ASC')
                        ->get_all();
    }

    /**
     * Get a single year level by id
     */
    public function find_by_id($id)
    {
        return $this->db->table($this->table)
                        ->select('id, name, `order`')
                        ->where('id', $id)
                        ->get();
    }

    /**
     * Get a year level by name
     */
    public function find_by_name($name)
    {
        return $this->db->table($this->table)
                        ->select('id, name, `order`')
                        ->where('name', $name)
                        ->get();
    }

    /**
     * Insert a new year level
     */
    public function insert($data)
    {
        try {
            // Validate input
            if (!isset($data['name']) || empty(trim($data['name']))) {
                error_log("Insert error: Year level name is required");
                return false;
            }
            
            // Use raw() method with prepared statement to handle reserved keyword 'order'
            $sql = "INSERT INTO `year_levels` (`name`, `order`) VALUES (?, ?)";
            $stmt = $this->db->raw($sql, [
                trim($data['name']),
                isset($data['order']) ? (int)$data['order'] : 0
            ]);
            
            // Small delay to ensure database write completes
            usleep(100);
            
            // Get the newly created year level by name and order to retrieve its ID
            // First try with query builder
            $result = $this->db->table($this->table)
                              ->where('name', trim($data['name']))
                              ->where('order', isset($data['order']) ? (int)$data['order'] : 0)
                              ->get();
            
            if ($result && isset($result['id'])) {
                error_log("Insert success: Year level ID " . $result['id']);
                return (int)$result['id'];
            }
            
            error_log("Insert: Query builder result: " . json_encode($result));
            
            // If query builder where() doesn't work with reserved keyword, use raw query
            $getIdSql = "SELECT `id` FROM `year_levels` WHERE `name` = ? AND `order` = ? ORDER BY `id` DESC LIMIT 1";
            $idStmt = $this->db->raw($getIdSql, [
                trim($data['name']),
                isset($data['order']) ? (int)$data['order'] : 0
            ]);
            $idResult = $idStmt->fetch();
            
            error_log("Insert: Raw query result: " . json_encode($idResult));
            
            if ($idResult && isset($idResult['id'])) {
                error_log("Insert success (raw): Year level ID " . $idResult['id']);
                return (int)$idResult['id'];
            }
            
            error_log("Insert error: Could not retrieve inserted ID");
            return false;
        } catch (Exception $e) {
            error_log("Insert error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Update a year level
     */
    public function update($id, $data)
    {
        try {
            $updates = [];
            $params = [];
            
            if (isset($data['name'])) {
                $updates[] = "`name` = ?";
                $params[] = $data['name'];
            }
            if (isset($data['order'])) {
                $updates[] = "`order` = ?";
                $params[] = $data['order'];
            }
            
            if (empty($updates)) {
                return false;
            }
            
            $params[] = $id;
            $sql = "UPDATE `year_levels` SET " . implode(", ", $updates) . " WHERE `id` = ?";
            
            $stmt = $this->db->raw($sql, $params);
            return true;
        } catch (Exception $e) {
            error_log("Update error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a year level
     */
    public function delete($id)
    {
        return $this->db->table($this->table)
                        ->where('id', $id)
                        ->delete();
    }
}
