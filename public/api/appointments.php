<?php
// appointments.php - API de sincronización segura para SiteGround
// Sincroniza citas y configuración entre el dominio principal y el subdominio admin.

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, Expires, *");
header("Access-Control-Max-Age: 86400");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");
header("X-Accel-Expires: 0");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0777, true);
    @file_put_contents($dataDir . '/.htaccess', "Order Deny,Allow\nDeny from all\n");
}

$dataFile = $dataDir . '/appointments.json';
$settingsFile = $dataDir . '/settings.json';
$rateLimitFile = $dataDir . '/rate_limit.json';

// Detección de IP del cliente
function getClientIp() {
    $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($keys as $k) {
        if (!empty($_SERVER[$k])) {
            $parts = explode(',', $_SERVER[$k]);
            $ip = trim($parts[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

// Protección Anti-Spam: Máximo 60 solicitudes por hora por IP + 1 segundo de cooldown
function checkRateLimit($ip, $rateLimitFile, $maxPerHour = 60) {
    $now = time();
    $data = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        $data = json_decode($raw, true) ?: [];
    }

    // Limpiar registros con más de 1 hora
    $cutoff = $now - 3600;
    foreach ($data as $k => $timestamps) {
        $data[$k] = array_values(array_filter($timestamps, function($t) use ($cutoff) {
            return $t > $cutoff;
        }));
        if (empty($data[$k])) {
            unset($data[$k]);
        }
    }

    $ipHistory = isset($data[$ip]) ? $data[$ip] : [];
    if (count($ipHistory) >= $maxPerHour) {
        return false;
    }

    // Cooldown de 1 segundo entre envíos
    if (!empty($ipHistory) && ($now - end($ipHistory)) < 1) {
        return false;
    }

    $ipHistory[] = $now;
    $data[$ip] = $ipHistory;
    @file_put_contents($rateLimitFile, json_encode($data));
    return true;
}

// Cargar citas existentes
function loadAppointments($filePath) {
    if (file_exists($filePath)) {
        $raw = @file_get_contents($filePath);
        $data = json_decode($raw, true);
        if (is_array($data)) return $data;
    }
    // Si el archivo no existe, iniciamos con agenda limpia vacía
    $emptyAppts = [];
    @file_put_contents($filePath, json_encode($emptyAppts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $emptyAppts;
}

function loadSettings($filePath) {
    if (file_exists($filePath)) {
        $raw = @file_get_contents($filePath);
        $data = json_decode($raw, true);
        if (is_array($data)) return $data;
    }
    return null;
}

function saveFile($filePath, $data) {
    return @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$appointments = loadAppointments($dataFile);
$settings = loadSettings($settingsFile);

// 1. GET: Retornar citas y ajustes
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    if ($type === 'appointments') {
        echo json_encode($appointments, JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($type === 'settings') {
        echo json_encode($settings ?: new stdClass(), JSON_UNESCAPED_UNICODE);
        exit;
    }
    echo json_encode([
        'appointments' => $appointments,
        'settings' => $settings
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST: Crear cita, cambiar estado, eliminar o guardar ajustes
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input || !isset($input['action'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Acción no especificada']);
        exit;
    }

    $action = $input['action'];

    // Registrar nueva cita (desde web pública o manual desde dashboard)
    if ($action === 'create' && isset($input['appointment'])) {
        $newApt = $input['appointment'];

        // 1. Honeypot check: si un bot llenó el campo trampa, simular éxito pero no guardar
        if (!empty($input['website_hp']) || !empty($newApt['website_hp'])) {
            echo json_encode(['success' => true, 'appointment' => $newApt, 'note' => 'verified']);
            exit;
        }

        // 2. Rate limiting por IP del cliente
        $clientIp = getClientIp();
        if (!checkRateLimit($clientIp, $rateLimitFile, 8)) {
            http_response_code(429);
            echo json_encode([
                'error' => 'Has alcanzado el límite de solicitudes de agendamiento por hora. Por favor contáctanos directamente a nuestro WhatsApp: +58 412-4335625'
            ]);
            exit;
        }

        // 3. Sanitización y validación mínima
        $newApt['patientName'] = htmlspecialchars(trim($newApt['patientName'] ?? 'Paciente'), ENT_QUOTES, 'UTF-8');
        $newApt['phone'] = htmlspecialchars(trim($newApt['phone'] ?? ''), ENT_QUOTES, 'UTF-8');
        $newApt['clientIp'] = substr($clientIp, 0, 45);

        // Evitar duplicados por ID
        $exists = false;
        foreach ($appointments as $a) {
            if ($a['id'] === $newApt['id']) {
                $exists = true;
                break;
            }
        }
        if (!$exists) {
            array_unshift($appointments, $newApt);
            saveFile($dataFile, $appointments);
        }
        echo json_encode(['success' => true, 'appointment' => $newApt]);
        exit;
    }

    // Actualizar estado de una cita
    if ($action === 'update_status' && isset($input['id']) && isset($input['status'])) {
        foreach ($appointments as &$apt) {
            if ($apt['id'] === $input['id']) {
                $apt['status'] = $input['status'];
                $apt['updatedAt'] = date('c');
                break;
            }
        }
        saveFile($dataFile, $appointments);
        echo json_encode(['success' => true]);
        exit;
    }

    // Eliminar cita
    if ($action === 'delete' && isset($input['id'])) {
        $appointments = array_values(array_filter($appointments, function($a) use ($input) {
            return $a['id'] !== $input['id'];
        }));
        saveFile($dataFile, $appointments);
        echo json_encode(['success' => true]);
        exit;
    }

    // Guardar ajustes (percepción de disponibilidad, horarios, bloqueo de fechas)
    if ($action === 'save_settings' && isset($input['settings'])) {
        $currentSettings = loadSettings($settingsFile) ?: [];
        $merged = array_merge($currentSettings, $input['settings']);
        saveFile($settingsFile, $merged);
        echo json_encode(['success' => true, 'settings' => $merged]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Acción desconocida']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
