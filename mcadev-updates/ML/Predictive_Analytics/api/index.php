<?php
/**
 * Predictive Analytics Dashboard - PHP Backend API
 * 
 * This backend loads Python models via subprocess calls and serves predictions.
 * Endpoints:
 *  - /api/enrollment/predict - Predict enrollment for a year
 *  - /api/enrollment/forecast - Multi-year enrollment forecast
 *  - /api/payment/predict - Predict payment for a year
 *  - /api/payment/forecast - Multi-year payment forecast
 *  - /api/historical - Get historical data
 *  - /api/analysis - Get most/least enrolled analysis
 *  - /api/metrics - Get model performance metrics
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration — paths resolved relative to this file
define('PYTHON_PATH', 'python');
define('BASE_DIR',    realpath(__DIR__ . '/..')  ?: __DIR__ . '/..');
define('MODELS_PATH', realpath(__DIR__ . '/../saved_models') ?: __DIR__ . '/../saved_models');
define('DATA_PATH',   realpath(__DIR__ . '/..') ?: __DIR__ . '/..');

// Router
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove trailing slash
$request_uri = rtrim($request_uri, '/');

try {
    switch (true) {
        // Enrollment endpoints
        case preg_match('#^/api/enrollment/predict$#', $request_uri):
            handleEnrollmentPredict();
            break;
        case preg_match('#^/api/enrollment/forecast$#', $request_uri):
            handleEnrollmentForecast();
            break;
        
        // Payment endpoints
        case preg_match('#^/api/payment/predict$#', $request_uri):
            handlePaymentPredict();
            break;
        case preg_match('#^/api/payment/forecast$#', $request_uri):
            handlePaymentForecast();
            break;
        
        // Data endpoints
        case preg_match('#^/api/historical$#', $request_uri):
            handleHistoricalData();
            break;
        case preg_match('#^/api/analysis$#', $request_uri):
            handleAnalysis();
            break;
        case preg_match('#^/api/metrics$#', $request_uri):
            handleMetrics();
            break;
        
        // Health check
        case preg_match('#^/api/health$#', $request_uri):
            echo json_encode(['status' => 'ok', 'timestamp' => date('Y-m-d H:i:s')]);
            break;
        
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Handle enrollment prediction for specific year and grade
 */
function handleEnrollmentPredict() {
    $input = getJsonInput();
    $year = $input['year'] ?? date('Y') + 1;
    $grade = $input['grade'] ?? 'TotalOverall';
    
    $result = executePythonScript('enrollment_predict', [
        'year' => $year,
        'grade' => $grade
    ]);
    
    echo json_encode($result);
}

/**
 * Handle multi-year enrollment forecast
 */
function handleEnrollmentForecast() {
    $input = getJsonInput();
    $years = $input['years'] ?? 5;
    $grade = $input['grade'] ?? 'TotalOverall';
    
    $result = executePythonScript('enrollment_forecast', [
        'years' => $years,
        'grade' => $grade
    ]);
    
    echo json_encode($result);
}

/**
 * Handle payment prediction
 */
function handlePaymentPredict() {
    $input = getJsonInput();
    $year = $input['year'] ?? date('Y') + 1;
    
    $result = executePythonScript('payment_predict', [
        'year' => $year
    ]);
    
    echo json_encode($result);
}

/**
 * Handle multi-year payment forecast
 */
function handlePaymentForecast() {
    $input = getJsonInput();
    $years = $input['years'] ?? 5;
    
    $result = executePythonScript('payment_forecast', [
        'years' => $years
    ]);
    
    echo json_encode($result);
}

/**
 * Handle historical data retrieval
 */
function handleHistoricalData() {
    $dataFile = DATA_PATH . '/enrollment_data.txt';
    
    if (!file_exists($dataFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'Historical data not found']);
        return;
    }
    
    $data = [];
    $headers = [];
    
    if (($handle = fopen($dataFile, "r")) !== FALSE) {
        $row = 0;
        while (($line = fgetcsv($handle)) !== FALSE) {
            if ($row === 0) {
                $headers = $line;
            } else {
                $record = [];
                foreach ($headers as $i => $header) {
                    $value = $line[$i] ?? null;
                    // Convert numeric strings to numbers
                    if (is_numeric($value)) {
                        $value = strpos($value, '.') !== false ? (float)$value : (int)$value;
                    }
                    $record[$header] = $value;
                }
                // Only add years 2018-2025
                if (isset($record['Year']) && $record['Year'] >= 2018 && $record['Year'] <= 2025) {
                    $data[] = $record;
                }
            }
            $row++;
        }
        fclose($handle);
    }
    echo json_encode([
        'success' => true,
        'count' => count($data),
        'data' => $data
    ]);
}

/**
 * Handle most/least enrolled analysis
 */
function handleAnalysis() {
    $input = $_GET;
    $year = $input['year'] ?? null;
    
    $dataFile = DATA_PATH . '/enrollment_data.txt';
    
    if (!file_exists($dataFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'Historical data not found']);
        return;
    }
    
    $data = [];
    $headers = [];
    $gradeColumns = ['Nursery 1', 'Nursery 2', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
    
    if (($handle = fopen($dataFile, "r")) !== FALSE) {
        $row = 0;
        while (($line = fgetcsv($handle)) !== FALSE) {
            if ($row === 0) {
                $headers = $line;
            } else {
                $record = [];
                foreach ($headers as $i => $header) {
                    $value = $line[$i] ?? null;
                    if (is_numeric($value)) {
                        $value = strpos($value, '.') !== false ? (float)$value : (int)$value;
                    }
                    $record[$header] = $value;
                }
                $data[] = $record;
            }
            $row++;
        }
        fclose($handle);
    }
    
    // Filter by year if specified
    if ($year) {
        $data = array_filter($data, function($row) use ($year) {
            return $row['Year'] == $year;
        });
    }
    
    // Analyze most and least enrolled per year
    $analysis = [];
    foreach ($data as $yearData) {
        $yearNum = $yearData['Year'];
        $gradeEnrollments = [];
        
        foreach ($gradeColumns as $grade) {
            if (isset($yearData[$grade])) {
                $gradeEnrollments[$grade] = $yearData[$grade];
            }
        }
        
        if (!empty($gradeEnrollments)) {
            arsort($gradeEnrollments);
            $grades = array_keys($gradeEnrollments);
            $values = array_values($gradeEnrollments);
            
            $analysis[] = [
                'year' => $yearNum,
                'most_enrolled' => [
                    'grade' => $grades[0],
                    'count' => $values[0]
                ],
                'least_enrolled' => [
                    'grade' => end($grades),
                    'count' => end($values)
                ],
                'total' => $yearData['TotalOverall'] ?? array_sum($gradeEnrollments),
                'payment' => $yearData['Total_Payment'] ?? 0,
                'grades' => $gradeEnrollments
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'count' => count($analysis),
        'analysis' => $analysis
    ]);
}

/**
 * Handle model metrics retrieval
 */
function handleMetrics() {
    $prophMetrics = MODELS_PATH . '/prophet_metrics.json';
    $dlMetrics = MODELS_PATH . '/dl_metrics.json';
    
    $result = [
        'prophet' => null,
        'deep_learning' => null
    ];
    
    if (file_exists($prophMetrics)) {
        $result['prophet'] = json_decode(file_get_contents($prophMetrics), true);
    }
    
    if (file_exists($dlMetrics)) {
        $result['deep_learning'] = json_decode(file_get_contents($dlMetrics), true);
    }
    
    echo json_encode([
        'success' => true,
        'metrics' => $result
    ]);
}

/**
 * Execute Python prediction script
 */
function executePythonScript($action, $params) {
    $scriptPath = __DIR__ . '/predictor.py';
    
    // Build JSON input
    $jsonInput = json_encode([
        'action' => $action,
        'params' => $params
    ]);
    
    // Use proc_open to pass JSON via stdin (avoids Windows shell escaping issues)
    $descriptors = [
        0 => ['pipe', 'r'],  // stdin
        1 => ['pipe', 'w'],  // stdout
        2 => ['pipe', 'w']   // stderr
    ];
    
    $command = PYTHON_PATH . ' ' . escapeshellarg($scriptPath);
    $process = proc_open($command, $descriptors, $pipes);
    
    if (!is_resource($process)) {
        throw new Exception("Failed to start Python process");
    }
    
    // Write JSON to stdin
    fwrite($pipes[0], $jsonInput);
    fclose($pipes[0]);
    
    // Read output
    $output = stream_get_contents($pipes[1]);
    $errors = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    
    proc_close($process);
    
    // Combine output and errors for parsing
    $fullOutput = $output . $errors;
    
    if (empty($fullOutput)) {
        throw new Exception("No output from Python script");
    }
    
    $output = $fullOutput;
    
    // Find JSON in output (in case there are warnings)
    if (preg_match('/\{.*\}/s', $output, $matches)) {
        $result = json_decode($matches[0], true);
        if ($result !== null) {
            return $result;
        }
    }
    
    // Try direct decode
    $result = json_decode($output, true);
    if ($result === null) {
        throw new Exception("Invalid response from Python: " . substr($output, 0, 500));
    }
    
    return $result;
}

/**
 * Get JSON input from request body
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return $_GET;
    }
    $data = json_decode($input, true);
    return $data ?? [];
}
