<?php

require_once __DIR__ . '/response.php';
function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('Allow: ' . $method);
        respond(false, 'Phương thức không được hỗ trợ.', null, 405);
    }
}

function read_json(): array
{
    $contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($contentType !== 'application/json') {
        respond(false, 'Content-Type phải là application/json.', null, 415);
    }
    $raw = file_get_contents('php://input');
    try {
        $value = json_decode($raw, false, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        respond(false, 'Dữ liệu JSON không hợp lệ.', null, 400);
    }
    if (!is_object($value)) {
        respond(false, 'Dữ liệu gửi lên phải là một JSON object.', null, 400);
    }
    return (array) $value;
}
