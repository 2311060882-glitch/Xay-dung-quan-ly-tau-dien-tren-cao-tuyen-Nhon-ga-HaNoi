<?php

require_once __DIR__ . '/../../helpers/request.php';

require_method('GET');

// Lấy line_id từ URL và kiểm tra là số nguyên dương.
$lineId = filter_input(
    INPUT_GET,
    'line_id',
    FILTER_VALIDATE_INT,
    ['options' => ['min_range' => 1]]
);

if ($lineId === false || $lineId === null) {
    respond(false, 'line_id phải là số nguyên dương.', null, 400);
}

require_once __DIR__ . '/../../config/database.php';

try {
    // Kiểm tra tuyến có tồn tại không.
    $stmt = $conn->prepare(
        'SELECT id FROM `lines` WHERE id = ?'
    );

    $stmt->bind_param('i', $lineId);
    $stmt->execute();

    $line = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$line) {
        respond(false, 'Không tìm thấy tuyến tàu.', null, 404);
    }

    // Lấy các ga theo thứ tự trong tuyến.
    $stmt = $conn->prepare(
        'SELECT id, line_id, name, order_index
         FROM `stations`
         WHERE line_id = ?
         ORDER BY order_index'
    );

    $stmt->bind_param('i', $lineId);
    $stmt->execute();

    $result = $stmt->get_result();
    $stations = [];

    while ($row = $result->fetch_assoc()) {
        $stations[] = [
            'id' => (int) $row['id'],
            'line_id' => (int) $row['line_id'],
            'name' => $row['name'],
            'order_index' => (int) $row['order_index']
        ];
    }

    $stmt->close();

    respond(
        true,
        'Lấy danh sách ga thành công.',
        $stations
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy danh sách ga.', null, 500);
}