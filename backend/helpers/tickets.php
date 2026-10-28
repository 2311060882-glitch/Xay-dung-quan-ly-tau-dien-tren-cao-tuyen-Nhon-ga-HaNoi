<?php

require_once __DIR__ . '/api.php';

// Chỉ trả dữ liệu vé công khai; thông tin chủ vé được kiểm tra tại từng API.
function ticket_rows(string $where, array $params, string $order = ''): array
{
    $rows = fetch_all_rows(
        "SELECT t.relative_id,t.passenger_name,t.id, t.line_id, t.ticket_type_id, t.qr_code, t.purchase_price,
            t.purchased_at, t.valid_from, t.expires_at, t.used_at,
            CASE
                WHEN t.status = 'ACTIVE' AND t.expires_at <= NOW() THEN 'EXPIRED'
                ELSE t.status
            END AS status,
            l.name AS line_name,
            tt.name AS ticket_type_name, tt.type AS ticket_type,
            t.origin_station_id, t.destination_station_id,
            os.name AS origin_station_name, ds.name AS destination_station_name,
            j.origin_station_id AS entry_station_id, es.name AS entry_station_name,
            (j.id IS NOT NULL) AS has_open_journey
         FROM tickets t
         JOIN `lines` l ON l.id = t.line_id
         JOIN ticket_types tt ON tt.id = t.ticket_type_id
         LEFT JOIN journeys j ON j.active_ticket_id = t.id
         LEFT JOIN stations os ON os.id = t.origin_station_id
         LEFT JOIN stations ds ON ds.id = t.destination_station_id
         LEFT JOIN stations es ON es.id = j.origin_station_id
         WHERE $where $order",
        $params
    );

    foreach ($rows as &$ticket) {
        foreach (['id', 'line_id', 'ticket_type_id', 'origin_station_id', 'destination_station_id', 'entry_station_id'] as $field) {
            $ticket[$field] = $ticket[$field] === null ? null : (int) $ticket[$field];
        }
        $ticket['has_open_journey'] = (bool) $ticket['has_open_journey'];
    }
    unset($ticket);

    return $rows;
}
