<?php

require_once __DIR__ . '/../../helpers/request.php';

require_method('GET');

require_once __DIR__ . '/../../config/database.php';

try {
    $sql = "
        SELECT id, name, type, price, valid_days, requires_priority
        FROM `ticket_types`
        ORDER BY id
    ";

    $result = $conn->query($sql);

    $ticketTypes = [];

    while ($row = $result->fetch_assoc()) {
        $ticketTypes[] = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'type' => $row['type'],
            'price' => $row['price'],
            'requires_priority' => (bool) $row['requires_priority'],
            'valid_days' => (int) $row['valid_days']
        ];
    }

    respond(
        true,
        'Lấy danh sách loại vé thành công.',
        $ticketTypes
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy danh sách loại vé.', null, 500);
}
