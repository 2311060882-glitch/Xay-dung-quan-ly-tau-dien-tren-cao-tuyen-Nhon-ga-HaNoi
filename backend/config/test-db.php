<?php

require_once __DIR__ . '/../helpers/request.php';

require_method('GET');

require_once __DIR__ . '/../config/database.php';

try {
    $result = $conn->query('SHOW TABLES');

    $tables = [];

    while ($row = $result->fetch_row()) {
        $tables[] = $row[0];
    }

    respond(
        true,
        'Kết nối database thành công.',
        [
            'database' => $dbname,
            'tables' => $tables
        ]
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy danh sách bảng.', null, 500);
}