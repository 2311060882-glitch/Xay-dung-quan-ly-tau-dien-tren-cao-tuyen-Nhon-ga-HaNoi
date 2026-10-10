<?php



require_once __DIR__ . '/../../helpers/request.php';
require_method('GET');
require_once __DIR__ . '/../../config/database.php';
try {
   $sql = "
    SELECT id, name, status
    FROM `lines`
    ORDER BY id
";
    $result = $conn->query($sql);
$lines = [];

    while ($row = $result->fetch_assoc()) {
        $lines[] = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'status' => $row['status']
        ];
    }
    respond(
        true,
        'Lấy danh sách tuyến thành công.',
        $lines
    );
} catch (mysqli_sql_exception $e) {
        error_log($e->getMessage());

    respond(false, 'Không thể lấy danh sách tuyến.', null, 500);
}
