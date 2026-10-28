<?php

require_once __DIR__ . '/api.php';

// Đồng bộ khi mở danh sách; không cần event nền.
function sync_automatic_trips(): void
{
    global $conn;

    $clock = fetch_one_row('SELECT UNIX_TIMESTAMP() AS timestamp');
    $currentSlot = intdiv((int) $clock['timestamp'], 900) * 900;
    $lines = fetch_all_rows("SELECT id FROM `lines` WHERE status = 'ACTIVE'");

    foreach ($lines as $line) {
        foreach (['OUTBOUND', 'INBOUND'] as $direction) {
            foreach ([$currentSlot, $currentSlot + 900] as $departure) {
                $status = $departure === $currentSlot ? 'RUNNING' : 'SCHEDULED';
                execute_sql(
                    "INSERT INTO trips (line_id, trip_code, direction, departure_time, capacity, status)
                     VALUES (
                        ?, CONCAT('AUTO-', ?, '-', ?, '-', DATE_FORMAT(FROM_UNIXTIME(?), '%Y%m%d%H%i')),
                        ?, FROM_UNIXTIME(?), 100, ?
                     )
                     ON DUPLICATE KEY UPDATE trip_code = VALUES(trip_code)",
                    [$line['id'], $line['id'], $direction, $departure, $direction, $departure, $status]
                );
            }
        }
    }

    $candidates = fetch_all_rows(
        "SELECT id FROM trips
         WHERE trip_code LIKE 'AUTO-%'
           AND status IN ('SCHEDULED', 'RUNNING')
           AND departure_time <= NOW()
         ORDER BY id"
    );

    foreach ($candidates as $candidate) {
        $conn->begin_transaction();
        $trip = fetch_one_row(
            'SELECT *, departure_time <= DATE_SUB(NOW(), INTERVAL 15 MINUTE) AS finished
             FROM trips WHERE id = ? FOR UPDATE',
            [$candidate['id']]
        );

        if ($trip && in_array($trip['status'], ['SCHEDULED', 'RUNNING'], true)) {
            if ($trip['finished']) {
                execute_sql("UPDATE trips SET status = 'COMPLETED' WHERE id = ?", [$trip['id']]);
            } elseif (!$trip['finished'] && $trip['status'] === 'SCHEDULED') {
                execute_sql("UPDATE trips SET status = 'RUNNING' WHERE id = ?", [$trip['id']]);
            }
        }
        $conn->commit();
    }
}
