<?php

require_once __DIR__ . '/../../helpers/journeys.php';
require_method('GET');
$userId = require_login();
[$page, $pageSize, $offset] = pagination();
$total = (int) fetch_one_row('SELECT COUNT(*) AS total FROM journeys j JOIN tickets t ON t.id=j.ticket_id WHERE t.user_id=?', [$userId])['total'];
respond(true, 'Lấy lịch sử đi tàu thành công.', paged(journey_rows('t.user_id=?', [$userId], $pageSize, $offset), $total, $page, $pageSize));
