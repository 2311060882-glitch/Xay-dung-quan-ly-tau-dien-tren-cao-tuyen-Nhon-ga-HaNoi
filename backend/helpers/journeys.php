<?php

require_once __DIR__ . '/api.php';
function journey_rows(string $where, array $params, int $pageSize = 100, int $offset = 0): array
{
    return fetch_all_rows("SELECT j.id, j.ticket_id, t.user_id, u.fullname, u.phone,
        t.line_id, l.name AS line_name, j.origin_station_id, os.name AS origin_station_name,
        j.destination_station_id, ds.name AS destination_station_name, j.checked_in_at, j.checked_out_at,
        j.checked_in_by, j.checked_out_by,
        CASE WHEN j.checked_out_at IS NULL THEN 'IN_PROGRESS' ELSE 'COMPLETED' END AS status
        FROM journeys j JOIN tickets t ON t.id=j.ticket_id JOIN users u ON u.id=t.user_id
        JOIN `lines` l ON l.id=t.line_id
        JOIN stations os ON os.id=j.origin_station_id LEFT JOIN stations ds ON ds.id=j.destination_station_id
        WHERE $where ORDER BY j.checked_in_at DESC,j.id DESC LIMIT ? OFFSET ?", [...$params, $pageSize, $offset]);
}
