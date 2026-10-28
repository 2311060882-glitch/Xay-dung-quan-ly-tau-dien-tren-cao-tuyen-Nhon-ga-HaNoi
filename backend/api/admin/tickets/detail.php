<?php

require_once __DIR__ . '/../../../helpers/journeys.php';
require_method('GET');
require_admin();
$ticketId = route_id();
$ticket = fetch_one_row("SELECT t.*,l.name AS line_name,tt.name AS ticket_type_name,tt.type AS ticket_type,
 CASE WHEN t.status='ACTIVE' AND t.expires_at<=NOW() THEN 'EXPIRED' ELSE t.status END AS status,
 os.name AS origin_station_name,ds.name AS destination_station_name,
 j.origin_station_id AS entry_station_id,es.name AS entry_station_name,(j.id IS NOT NULL) AS has_open_journey
 FROM tickets t JOIN `lines` l ON l.id=t.line_id JOIN ticket_types tt ON tt.id=t.ticket_type_id
 LEFT JOIN journeys j ON j.active_ticket_id=t.id LEFT JOIN stations os ON os.id=t.origin_station_id
 LEFT JOIN stations ds ON ds.id=t.destination_station_id
 LEFT JOIN stations es ON es.id=j.origin_station_id WHERE t.id=?", [$ticketId]);
if (!$ticket) {
    respond(false, 'Không tìm thấy vé.', null, 404);
}
$ticket['owner'] = fetch_one_row('SELECT id,fullname,phone FROM users WHERE id=?', [$ticket['user_id']]);
[$page, $pageSize, $offset] = pagination();
$total = (int) fetch_one_row('SELECT COUNT(*) AS total FROM journeys WHERE ticket_id=?', [$ticketId])['total'];
$ticket['journeys'] = paged(journey_rows('j.ticket_id=?', [$ticketId], $pageSize, $offset), $total, $page, $pageSize);
respond(true, 'Lấy chi tiết vé thành công.', $ticket);
