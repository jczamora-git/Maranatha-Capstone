<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

class ChatbotController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->call->database();
        $this->call->model('ChatbotKnowledgeModel');
        $this->call->model('ChatbotConversationModel');
        $this->call->library('session');
    }

    public function api_get_knowledge()
    {
        api_set_json_headers();

        if (!$this->session->userdata('logged_in') || $this->session->userdata('role') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: admin only']);
            return;
        }

        try {
            $search = $_GET['search'] ?? null;
            $list = $this->ChatbotKnowledgeModel->get_all($search);

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $list]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function api_create_knowledge()
    {
        api_set_json_headers();

        if (!$this->session->userdata('logged_in') || $this->session->userdata('role') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: admin only']);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['title']) || empty($data['content'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Title and content are required']);
                return;
            }

            $payload = [
                'title' => trim($data['title']),
                'content' => trim($data['content']),
                'tags' => $data['tags'] ?? null,
                'route' => $data['route'] ?? null,
                'is_active' => isset($data['is_active']) ? (int) !!$data['is_active'] : 1,
                'created_by' => $this->session->userdata('user_id') ?? null,
                'updated_by' => $this->session->userdata('user_id') ?? null,
            ];

            $res = $this->ChatbotKnowledgeModel->create_entry($payload);
            if ($res) {
                http_response_code(201);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create knowledge entry']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function api_update_knowledge($id)
    {
        api_set_json_headers();

        if (!$this->session->userdata('logged_in') || $this->session->userdata('role') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: admin only']);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['title']) || empty($data['content'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Title and content are required']);
                return;
            }

            $payload = [
                'title' => trim($data['title']),
                'content' => trim($data['content']),
                'tags' => $data['tags'] ?? null,
                'route' => $data['route'] ?? null,
                'is_active' => isset($data['is_active']) ? (int) !!$data['is_active'] : 1,
                'updated_by' => $this->session->userdata('user_id') ?? null,
            ];

            $res = $this->ChatbotKnowledgeModel->update_entry($id, $payload);
            if ($res) {
                http_response_code(200);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update knowledge entry']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function api_delete_knowledge($id)
    {
        api_set_json_headers();

        if (!$this->session->userdata('logged_in') || $this->session->userdata('role') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: admin only']);
            return;
        }

        try {
            $res = $this->ChatbotKnowledgeModel->delete_entry($id);
            if ($res) {
                http_response_code(200);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete knowledge entry']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function api_toggle_knowledge($id)
    {
        api_set_json_headers();

        if (!$this->session->userdata('logged_in') || $this->session->userdata('role') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: admin only']);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $isActive = !empty($data['is_active']);

            $res = $this->ChatbotKnowledgeModel->toggle_active(
                $id,
                $isActive,
                $this->session->userdata('user_id') ?? null
            );

            if ($res) {
                http_response_code(200);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update status']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function api_chat()
    {
        api_set_json_headers();

        if (!$this->session->userdata('logged_in')) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $message = trim($data['message'] ?? '');
            $instructions = trim($data['instructions'] ?? '');
            $role = $this->session->userdata('role') ?? 'student';
            $knowledgeOnly = (bool) config_item('chat_knowledge_only');

            if ($message === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Message is required']);
                return;
            }

            if (!$this->isSystemQuestion($message)) {
                $response = 'I can only answer questions about the Campus Companion system. Try asking about admin pages, enrollments, payments, or settings.';
                $source = 'guard';

                $this->ChatbotConversationModel->create_entry([
                    'user_id' => $this->session->userdata('user_id') ?? null,
                    'role' => $role,
                    'message' => $message,
                    'normalized_message' => $this->normalizeMessage($message),
                    'reply' => $response,
                    'source' => $source,
                ]);

                error_log('Chatbot source: ' . $source);

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'reply' => $response,
                    'source' => $source
                ]);
                return;
            }

            if ($role !== 'admin' && $this->isAdminRouteQuestion($message)) {
                $response = 'The admin dashboard is only available to admin accounts. If you believe you need access, please contact an administrator.';
                $source = 'guard';

                $this->ChatbotConversationModel->create_entry([
                    'user_id' => $this->session->userdata('user_id') ?? null,
                    'role' => $role,
                    'message' => $message,
                    'normalized_message' => $this->normalizeMessage($message),
                    'reply' => $response,
                    'source' => $source,
                ]);

                error_log('Chatbot source: ' . $source);

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'reply' => $response,
                    'source' => $source
                ]);
                return;
            }

            $normalizedMessage = $this->normalizeMessage($message);
            $allowedCacheSources = $knowledgeOnly ? ['knowledge', 'guard'] : null;
            $cached = $this->ChatbotConversationModel->find_cached_reply($normalizedMessage, $role, $allowedCacheSources);

            if (!empty($cached) && !empty($cached['reply'])) {
                $response = $cached['reply'];
                $source = 'cache';
            } else {
                $knowledge = $this->ChatbotKnowledgeModel->get_active_for_query($message, 5);
                $knowledge = $this->filterKnowledgeByRole($knowledge, $role);
                $shortcut = $this->buildShortcutReply($message, $knowledge);
                if ($shortcut) {
                    $response = $shortcut;
                    $source = 'knowledge';
                } elseif ($knowledgeOnly) {
                    $response = 'I do not have that information yet. Please contact an administrator or add it to the knowledge base.';
                    $source = 'knowledge';
                } else {
                    $response = $this->callChatModel($message, $knowledge, $instructions);
                    $source = 'llm';
                }
            }

            $this->ChatbotConversationModel->create_entry([
                'user_id' => $this->session->userdata('user_id') ?? null,
                'role' => $role,
                'message' => $message,
                'normalized_message' => $normalizedMessage,
                'reply' => $response,
                'source' => $source,
            ]);

            error_log('Chatbot source: ' . $source);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'reply' => $response,
                'source' => $source
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    private function normalizeMessage($message)
    {
        $value = mb_strtolower(trim($message));
        $value = preg_replace('/\s+/', ' ', $value);
        return $value;
    }

    private function isSystemQuestion($message)
    {
        $text = mb_strtolower($message);
        $keywords = [
            'campus companion', 'admin', 'dashboard', 'user', 'users', 'teacher', 'teachers',
            'student', 'students', 'subject', 'subjects', 'section', 'sections',
            'enrollment', 'enrollments', 'enrollee', 'payment', 'payments', 'payment plan',
            'installment', 'tuition', 'uniform', 'gcash', 'school service', 'rfid',
            'attendance', 'campus', 'campuses', 'announcement', 'announcements',
            'grading', 'grades', 'pdf', 'report', 'reports', 'feedback', 'sentiment',
            'chatbot', 'knowledge', 'settings', 'academic period', 'enrollment period',
            'document requirement', 'discount', 'penalty', 'waiver', 'schedule'
        ];

        foreach ($keywords as $keyword) {
            if (mb_strpos($text, $keyword) !== false) {
                return true;
            }
        }

        if (preg_match('/\/(admin|teacher|student|enrollee)\//', $text)) {
            return true;
        }

        return false;
    }

    private function isAdminRouteQuestion($message)
    {
        $text = mb_strtolower($message);
        $keywords = [
            'admin dashboard', 'admin page', 'admin panel', 'admin route',
            '/admin', 'admin portal'
        ];

        foreach ($keywords as $keyword) {
            if (mb_strpos($text, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    private function filterKnowledgeByRole($knowledge, $role)
    {
        if (!is_array($knowledge) || empty($knowledge)) {
            return [];
        }

        $prefixes = $this->getAllowedRoutePrefixes($role);
        if ($prefixes === null) {
            return $knowledge;
        }

        $filtered = [];
        foreach ($knowledge as $item) {
            $route = trim($item['route'] ?? '');
            if ($route === '') {
                $filtered[] = $item;
                continue;
            }

            if ($this->isRouteAllowed($route, $prefixes)) {
                $filtered[] = $item;
            }
        }

        return $filtered;
    }

    private function getAllowedRoutePrefixes($role)
    {
        switch ($role) {
            case 'admin':
                return null;
            case 'teacher':
                return ['/teacher/', '/adviser/', '/admin/enrollments'];
            case 'student':
                return ['/student/', '/enrollment/', '/enrollee/'];
            case 'enrollee':
                return ['/enrollee/', '/enrollment/'];
            default:
                return [];
        }
    }

    private function isRouteAllowed($route, $prefixes)
    {
        foreach ($prefixes as $prefix) {
            if (mb_strpos($route, $prefix) === 0) {
                return true;
            }
        }

        return false;
    }

    private function buildShortcutReply($message, $knowledge)
    {
        if (!is_array($knowledge) || empty($knowledge)) {
            return null;
        }

        $needle = mb_strtolower(trim($message));
        if ($needle === '') {
            return null;
        }

        foreach ($knowledge as $item) {
            $title = trim($item['title'] ?? '');
            $content = trim($item['content'] ?? '');
            $route = trim($item['route'] ?? '');
            $tags = trim($item['tags'] ?? '');

            $titleLower = mb_strtolower($title);
            if ($title !== '' && (mb_strpos($needle, $titleLower) !== false || mb_strpos($titleLower, $needle) !== false)) {
                $reply = $content !== '' ? $content : $title;
                if ($route !== '') {
                    $reply .= ' [link:' . $title . '|' . $route . ']';
                }
                error_log('Chatbot shortcut match: ' . $title);
                return $reply;
            }

            if ($tags !== '') {
                $tagParts = array_filter(array_map('trim', explode(',', $tags)));
                foreach ($tagParts as $tag) {
                    $tagLower = mb_strtolower($tag);
                    if ($tag !== '' && mb_strpos($needle, $tagLower) !== false) {
                        $reply = $content !== '' ? $content : $title;
                        if ($route !== '') {
                            $reply .= ' [link:' . ($title !== '' ? $title : 'Open page') . '|' . $route . ']';
                        }
                        error_log('Chatbot shortcut match (tag): ' . $tag);
                        return $reply;
                    }
                }
            }

            if ($title !== '') {
                $words = preg_split('/\s+/', $titleLower);
                foreach ($words as $word) {
                    if (mb_strlen($word) < 4) {
                        continue;
                    }
                    if (mb_strpos($needle, $word) !== false) {
                        $reply = $content !== '' ? $content : $title;
                        if ($route !== '') {
                            $reply .= ' [link:' . $title . '|' . $route . ']';
                        }
                        error_log('Chatbot shortcut match (word): ' . $word);
                        return $reply;
                    }
                }
            }
        }

        return null;
    }

    private function callChatModel($message, $knowledge, $instructions)
    {
        $hfToken = config_item('sentiment_hf_token');
        $hfUrl = config_item('chat_hf_url');
        $hfModel = config_item('chat_hf_model');
        $basePrompt = config_item('chat_system_prompt') ?: '';

        if (empty($hfToken)) {
            throw new Exception('Hugging Face API token not configured');
        }

        if (empty($hfUrl) || empty($hfModel)) {
            throw new Exception('Chat model not configured');
        }

        $knowledgeLines = [];
        if (is_array($knowledge)) {
            foreach ($knowledge as $item) {
                $title = trim($item['title'] ?? '');
                $content = trim($item['content'] ?? '');
                $tags = trim($item['tags'] ?? '');
                $route = trim($item['route'] ?? '');
                if ($title === '' && $content === '') {
                    continue;
                }
                $line = $title !== '' ? $title . ': ' . $content : $content;
                if ($route !== '' && $title !== '') {
                    $line .= ' Use this page: [link:' . $title . '|' . $route . ']';
                } elseif ($route !== '') {
                    $line .= ' Use this page: [link:Open page|' . $route . ']';
                }
                if ($tags !== '') {
                    $line .= ' (tags: ' . $tags . ')';
                }
                $knowledgeLines[] = $line;
            }
        }

        $systemParts = [];
        if ($basePrompt !== '') {
            $systemParts[] = $basePrompt;
        }
        if (!empty($instructions)) {
            $systemParts[] = 'Admin instructions: ' . $instructions;
        }
        if (!empty($knowledgeLines)) {
            $systemParts[] = 'Knowledge base:\n- ' . implode("\n- ", $knowledgeLines);
        }

        $systemContent = implode("\n\n", $systemParts);
        if ($systemContent === '') {
            $systemContent = 'You are a helpful assistant for the Campus Companion system.';
        }

        $payload = [
            'model' => $hfModel,
            'stream' => false,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemContent
                ],
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ]
        ];

        $ch = curl_init($hfUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "Authorization: Bearer $hfToken"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            throw new Exception("Chat model error: HTTP $httpCode");
        }

        $data = json_decode($response, true);
        $content = $data['choices'][0]['message']['content'] ?? '';
        $content = trim($content);

        if ($content === '') {
            throw new Exception('Empty chatbot response');
        }

        return $content;
    }
}
