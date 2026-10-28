<?php

require_once __DIR__ . '/journeys.php';

function scan_ticket(?string $fixedAction = null, bool $record = true): void
{
    global $conn;

    require_method('POST');
    $adminId = require_admin();
    require_csrf();

    $input = read_json();
    $qr = text_value($input, 'qr_code', 100);
    $stationId = id_value($input, 'station_id');
    $action = $fixedAction ?? choice($input, 'action', ['CHECK_IN', 'CHECK_OUT']);

    $conn->begin_transaction();

    // Hai cổng cùng quét một vé phải chờ khóa vé, rồi đọc lại lượt đang mở.
    $ticket = fetch_one_row(
        'SELECT t.*, tt.type AS ticket_type, tt.name AS ticket_type_name,
            (t.valid_from <= NOW() AND t.expires_at > NOW()) AS in_time
         FROM tickets t
         JOIN ticket_types tt ON tt.id = t.ticket_type_id
         WHERE t.qr_code = ? FOR UPDATE',
        [$qr]
    );
    if (!$ticket) {
        reject_transaction('Mã QR không tồn tại.', 404);
    }

    $station = fetch_one_row('SELECT * FROM stations WHERE id = ?', [$stationId]);
    if (!$station) {
        reject_transaction('Không tìm thấy ga.', 404);
    }
    if ((int) $station['line_id'] !== (int) $ticket['line_id']) {
        reject_transaction('Ga phải thuộc tuyến của vé.', 400);
    }

    $openJourney = fetch_one_row(
        'SELECT * FROM journeys WHERE active_ticket_id = ? FOR UPDATE',
        [$ticket['id']]
    );

    if ($action === 'CHECK_IN') {
        if ($ticket['status'] !== 'ACTIVE' || !$ticket['in_time']) {
            reject_transaction('Vé đã dùng, hết hạn hoặc chưa có hiệu lực.');
        }
        if ($openJourney) {
            reject_transaction('Vé đang có lượt đi chưa kết thúc.');
        }

        if ($ticket['ticket_type'] === 'SINGLE' && $ticket['origin_station_id'] !== null && (int) $ticket['origin_station_id'] !== $stationId) {
            reject_transaction('Vé lượt phải vào đúng ga đi đã mua.', 400);
        }
    } else {
        if (!$openJourney) {
            reject_transaction('Vé chưa có lượt vào ga đang mở.');
        }

        if ((int) $openJourney['origin_station_id'] === $stationId) {
            reject_transaction('Ga ra phải khác ga vào.', 400);
        }
        if ($ticket['ticket_type'] === 'SINGLE' && $ticket['destination_station_id'] !== null && (int) $ticket['destination_station_id'] !== $stationId) {
            reject_transaction('Vé lượt phải ra đúng ga đến đã mua.', 400);
        }
        // Không kiểm tra lại hạn vé: khách đã vào vẫn phải ra được.
    }

    if (!$record) {
        $conn->rollback();
        respond(true, 'Vé hợp lệ. Chưa ghi nhận lượt vào hoặc ra ga.', [
            'valid' => true,
            'action' => $action,
            'ticket_id' => (int) $ticket['id'],
            'ticket_type_name' => $ticket['ticket_type_name'],
            'station_id' => $stationId,
            'station_name' => $station['name']
        ]);
    }

    if ($action === 'CHECK_IN') {
        execute_sql(
            'INSERT INTO journeys (ticket_id, origin_station_id, checked_in_by)
             VALUES (?, ?, ?)',
            [$ticket['id'], $stationId, $adminId]
        );
        $journeyId = $conn->insert_id;
    } else {
        $journeyId = $openJourney['id'];
        execute_sql(
            'UPDATE journeys
             SET destination_station_id = ?, checked_out_at = NOW(), checked_out_by = ?
             WHERE id = ? AND checked_out_at IS NULL',
            [$stationId, $adminId, $journeyId]
        );
        if ($conn->affected_rows !== 1) {
            reject_transaction('Lượt đi đã kết thúc.');
        }

        if ($ticket['ticket_type'] === 'SINGLE') {
            execute_sql("UPDATE tickets SET status = 'USED', used_at = NOW() WHERE id = ?", [$ticket['id']]);
        } else {
            execute_sql(
                "UPDATE tickets SET status = IF(expires_at <= NOW(), 'EXPIRED', 'ACTIVE') WHERE id = ?",
                [$ticket['id']]
            );
        }
    }

    $journey = journey_rows('j.id = ?', [$journeyId], 1)[0];
    $conn->commit();

    respond(true, $action === 'CHECK_IN' ? 'Đã xác nhận vào ga.' : 'Đã xác nhận ra ga.', [
        'action' => $action,
        'station_name' => $station['name'],
        'journey' => $journey
    ], $action === 'CHECK_IN' ? 201 : 200);
}
