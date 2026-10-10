<?php
require_once __DIR__ . '/../helpers/response.php';
// Chỉnh các thông số theo MySQL/MariaDB trên máy bạn.
$host = '127.0.0.1';
$port = 3306; // Nếu MySQL của bạn chạy ở 3307, sửa tại đây.
$username = 'root';
$password = '';
$dbname = 'metro';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
    $conn = new mysqli($host, $username, $password, $dbname, $port);
    $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    respond(
        false,
        'Lỗi kết nối database.',
        [
            'error_code' => $e->getCode(),
            'error_message' => $e->getMessage()
        ],
        500
    );
}
