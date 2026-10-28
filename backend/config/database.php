<?php
require_once __DIR__ . '/../helpers/response.php';
// Chỉnh các thông số theo MySQL/MariaDB trên máy bạn.
$host = '127.0.0.1';
$port = (int) (getenv('METRO_DB_PORT') ?: 3306);
$username = getenv('METRO_DB_USER') ?: 'root';
$password = getenv('METRO_DB_PASSWORD') ?: '';
$dbname = getenv('METRO_DB_NAME') ?: 'metro';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
    $conn = new mysqli($host, $username, $password, $dbname, $port);
    $conn->set_charset('utf8mb4');
    $conn->query("SET time_zone = '+07:00'");
    date_default_timezone_set('Asia/Ho_Chi_Minh');
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
