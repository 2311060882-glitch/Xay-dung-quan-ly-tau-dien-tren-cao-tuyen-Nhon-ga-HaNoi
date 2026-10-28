<?php

require_once __DIR__ . '/../../../helpers/api.php';
require_method('GET');
require_admin();
[$where, $params] = ticket_filters(false);
$groupBy = isset($_GET['group_by']) ? choice($_GET, 'group_by', ['day', 'line', 'ticket_type']) : 'day';
// Ten cot chi lay tu danh sach co dinh, khong ghep SQL tu du lieu nguoi dung.
$groupColumns = ['day' => 'DATE(t.purchased_at)', 'line' => 't.line_id', 'ticket_type' => 't.ticket_type_id'];
$groupLabels = ['day' => 'DATE(t.purchased_at)', 'line' => 'l.name', 'ticket_type' => 'tt.name'];
$groupColumn = $groupColumns[$groupBy];
$groupLabel = $groupLabels[$groupBy];
$summary = fetch_one_row("SELECT COUNT(*) AS tickets_sold,COALESCE(SUM(t.purchase_price),0) AS revenue FROM tickets t WHERE $where", $params);
$groups = fetch_all_rows("SELECT $groupColumn AS group_key,$groupLabel AS label,COUNT(*) AS tickets_sold,COALESCE(SUM(t.purchase_price),0) AS revenue
 FROM tickets t JOIN `lines` l ON l.id=t.line_id JOIN ticket_types tt ON tt.id=t.ticket_type_id
 WHERE $where GROUP BY $groupColumn,$groupLabel ORDER BY $groupColumn", $params);
respond(true, 'Thống kê bán vé thành công.', ['group_by' => $groupBy, 'summary' => $summary, 'groups' => $groups]);
