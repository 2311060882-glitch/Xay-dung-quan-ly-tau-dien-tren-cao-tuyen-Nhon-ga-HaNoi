<?php

// Điểm nạp chung cho các API mới: request, session, CSRF và database.
require_once __DIR__ . '/request.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/../config/database.php';
// Tương tự bộ xử lý exception chung: ghi log chi tiết, trả lỗi ngắn cho frontend.
function handle_api_exception(Throwable $exception): void
{
    global $conn;
    $conn->rollback();
    error_log((string) $exception);
    respond(false, 'Không thể xử lý yêu cầu. Vui lòng thử lại.', null, 500);
}
set_exception_handler('handle_api_exception');

// SELECT nhiều dòng: kết quả tương tự List<Map<String, Object>> trong Java.
function fetch_all_rows(string $sql, array $params = []): array
{
    global $conn;
    $result = $conn->execute_query($sql, $params);
    return $result->fetch_all(MYSQLI_ASSOC);
}

// SELECT một dòng: trả associative array hoặc null nếu không tìm thấy.
function fetch_one_row(string $sql, array $params = []): ?array
{
    $rows = fetch_all_rows($sql, $params);
    if (empty($rows)) {
        return null;
    }
    return $rows[0];
}

// INSERT / UPDATE / DELETE. Dấu ? và $params tương tự PreparedStatement.
function execute_sql(string $sql, array $params = []): void
{
    global $conn;
    $conn->execute_query($sql, $params);
}

function reject_transaction(string $message, int $status = 409): void
{
    global $conn;
    $conn->rollback();
    respond(false, $message, null, $status);
}

// Các hàm dưới đây kiểm tra đầu vào trước khi thực hiện nghiệp vụ.
function id_value(array $input, string $key): int
{
    $value = $input[$key] ?? null;
    if (!is_int($value) && !is_string($value)) {
        validation_error([$key => 'Phải là số nguyên dương hợp lệ.']);
    }
    if (!preg_match('/^[1-9][0-9]*$/', (string) $value)) {
        validation_error([$key => 'Phải là số nguyên dương hợp lệ.']);
    }
    if (filter_var($value, FILTER_VALIDATE_INT) === false || (int) $value > 4294967295) {
        validation_error([$key => 'Phải là số nguyên dương hợp lệ.']);
    }
    return (int) $value;
}

function text_value(array $input, string $key, int $max = 100): string
{
    $value = $input[$key] ?? null;
    if (!is_string($value)) {
        validation_error([$key => 'Chuỗi từ 1 đến ' . $max . ' ký tự.']);
    }
    $value = trim($value);
    $length = preg_match_all('/./us', $value);
    if ($length === false || $length < 1 || $length > $max) {
        validation_error([$key => 'Chuỗi từ 1 đến ' . $max . ' ký tự.']);
    }
    return $value;
}

function choice(array $input, string $key, array $allowed): string
{
    $value = $input[$key] ?? null;
    if (!is_string($value) || !in_array($value, $allowed, true)) {
        validation_error([$key => 'Giá trị hợp lệ: ' . implode(', ', $allowed)]);
    }
    return $value;
}

function date_value(array $input, string $key, bool $time = false): string
{
    $value = $input[$key] ?? null;
    $format = $time ? 'Y-m-d H:i:s' : 'Y-m-d';
    if (!is_string($value) || strpos($value, chr(0)) !== false) {
        validation_error([$key => 'Dùng định dạng ' . $format]);
    }
    $date = DateTimeImmutable::createFromFormat('!' . $format, $value);
    if (!$date || $date->format($format) !== $value) {
        validation_error([$key => 'Dùng định dạng ' . $format]);
    }
    return $value;
}

function pagination(): array
{
    $page = isset($_GET['page']) ? id_value($_GET, 'page') : 1;
    $pageSize = isset($_GET['per_page']) ? id_value($_GET, 'per_page') : 20;
    if ($page > 1000000 || $pageSize > 100) {
        validation_error(['pagination' => 'page tối đa 1000000, per_page tối đa 100.']);
    }
    return [$page, $pageSize, ($page - 1) * $pageSize];
}

function paged(array $items, int $total, int $page, int $pageSize): array
{
    return [
        'items' => $items,
        'pagination' => [
            'page' => $page,
            'per_page' => $pageSize,
            'total' => $total,
            'total_pages' => (int) ceil($total / $pageSize)
        ]
    ];
}

function ticket_filters(bool $withStatus = true): array
{
    $where = ['1=1'];
    $params = [];
    foreach (['from', 'to'] as $key) {
        if (isset($_GET[$key])) {
            $params[] = date_value($_GET, $key);
            $where[] = $key === 'from' ? 't.purchased_at >= ?' : 't.purchased_at < DATE_ADD(?, INTERVAL 1 DAY)';
        }
    }
    if (isset($_GET['from'], $_GET['to']) && $_GET['from'] > $_GET['to']) {
        validation_error(['to' => 'Ngày kết thúc phải từ ngày bắt đầu.']);
    }
    foreach (['line_id', 'ticket_type_id'] as $key) {
        if (isset($_GET[$key])) {
            $where[] = 't.' . $key . ' = ?';
            $params[] = id_value($_GET, $key);
        }
    }
    if ($withStatus && isset($_GET['status'])) {
        $where[] = "(CASE WHEN t.status='ACTIVE' AND t.expires_at <= NOW() THEN 'EXPIRED' ELSE t.status END) = ?";
        $params[] = choice($_GET, 'status', ['ACTIVE', 'USED', 'EXPIRED']);
    }
    return [implode(' AND ', $where), $params];
}

function route_id(): int
{
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (preg_match('~/([0-9]+)(?:/(?:status))?/?$~', $path, $match)) {
        return id_value(['id' => $match[1]], 'id');
    }
    // Hỗ trợ mở trực tiếp file PHP khi học và debug.
    return id_value($_GET, 'id');
}
