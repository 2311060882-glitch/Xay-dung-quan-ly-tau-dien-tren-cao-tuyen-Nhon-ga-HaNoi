<?php
// Trả JSON theo một cấu trúc chung.
function respond(bool $success, string $message, $data = null, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
