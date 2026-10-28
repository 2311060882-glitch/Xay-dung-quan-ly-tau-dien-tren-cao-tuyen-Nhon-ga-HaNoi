<?php

// Tương tự tạo HTTP response trong Java. Hàm này gửi JSON rồi kết thúc request (exit).
function respond(bool $success, string $message, $data = null, int $status = 200, ?array $errors = null): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    $response = [
        'status' => $status,
        'message' => $message,
        'data' => $success ? $data : null
    ];
    if (!$success) {
        if ($errors !== null) {
            $response['error'] = 'Validation Failed';
            $response['errors'] = (object) $errors;
        } else {
            $labels = [
                400 => 'Bad Request',
                401 => 'Unauthorized',
                403 => 'Forbidden',
                404 => 'Resource Not Found',
                405 => 'Method Not Allowed',
                409 => 'Conflict',
                415 => 'Unsupported Media Type',
                500 => 'Internal Server Error',
                501 => 'Not Implemented'
            ];
            $response['error'] = $labels[$status] ?? 'Request Failed';
            $requestPath = explode('?', $_SERVER['REQUEST_URI'] ?? '');
            $response['path'] = $requestPath[0];
            $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
            $response['timestamp'] = $now->format('Y-m-d\TH:i:s.vP');
        }
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function validation_error(array $errors): void
{
    respond(false, 'Dữ liệu không hợp lệ', null, 400, $errors);
}
