<?php
// Chỉ dùng cùng database fixture của bài kiểm tra, không dùng làm router production.
if (PHP_SAPI !== 'cli-server' || !preg_match('/^metro_gate_fixture_[0-9]+$/', getenv('METRO_DB_NAME') ?: '')) {
    http_response_code(403);
    exit;
}
$path = ltrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$method = null;
foreach (file(__DIR__ . '/../.htaccess', FILE_IGNORE_NEW_LINES) as $line) {
    if (preg_match('/^RewriteCond %\{REQUEST_METHOD\} =(\w+)/', $line, $m)) {
        $method = $m[1];
    } elseif (preg_match('/^RewriteRule (\S+) (\S+)/', $line, $m)) {
        if (($method === null || $method === $_SERVER['REQUEST_METHOD']) && preg_match('~'.$m[1].'~', $path)) {
            $target = preg_replace('~'.$m[1].'~', $m[2], $path);
            $query = parse_url($target, PHP_URL_QUERY);
            if ($query) { parse_str($query, $params); $_GET = $params + $_GET; }
            require __DIR__ . '/../' . parse_url($target, PHP_URL_PATH);
            exit;
        }
        $method = null;
    }
}
http_response_code(404);
