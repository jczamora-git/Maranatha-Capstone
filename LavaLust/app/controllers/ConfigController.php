<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * ConfigController - Handle application configuration endpoints
 * Exposes feature flags and other configs to the frontend
 */
class ConfigController extends Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get feature flags
     * GET /api/config/features
     * 
     * Returns all feature flags (safe to expose publicly)
     */
    public function api_get_features()
    {
        api_set_json_headers();
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        try {
            // Load feature config
            $features = include(APP_DIR . 'config/features.php');
            
            if (!$features) {
                throw new Exception('Failed to load feature configuration');
            }

            // Return features
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $features,
                'environment' => $this->config->item('environment') ?? 'production'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve features: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get enrollment type configuration
     * GET /api/config/enrollment-types
     * 
     * Returns enabled enrollment types
     */
    public function api_get_enrollment_types()
    {
        api_set_json_headers();
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        try {
            // Load feature config
            $features = include(APP_DIR . 'config/features.php');
            
            if (!$features || !isset($features['enrollment_types'])) {
                throw new Exception('Enrollment types configuration not found');
            }

            // Return enrollment types
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $features['enrollment_types']
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve enrollment types: ' . $e->getMessage()
            ]);
        }
    }
}
