<?php
require_once __DIR__ . '/../helpers/response.php';

if (isset($argv[1])) {
    $_SERVER['REQUEST_URI'] = '/tickets/book?id=8';
    register_shutdown_function(function () {
        echo "\n" . http_response_code();
    });
    switch ($argv[1]) {
        case 'success':
            respond(true, 'Created', ['id' => 8], 201);
            break;
        case 'missing':
            respond(false, 'Missing', null, 404);
            break;
        case 'validation':
            validation_error(['fullname' => 'Required']);
            break;
        case 'server':
            respond(false, 'Database error', ['error_message' => 'private'], 500);
            break;
    }
    exit(1);
}

foreach (['success' => 201, 'missing' => 404, 'validation' => 400, 'server' => 500] as $case => $status) {
    $output = [];
    exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__) . ' ' . escapeshellarg($case), $output, $exitCode);
    $httpStatus = (int) array_pop($output);
    $body = json_decode(implode("\n", $output), true, 512, JSON_THROW_ON_ERROR);
    $valid = $exitCode === 0 && $httpStatus === $status && $body['status'] === $status
        && !array_key_exists('success', $body) && isset($body['message']) && array_key_exists('data', $body);
    if ($case === 'success') {
        $valid = $valid && $body['data'] === ['id' => 8] && count($body) === 3;
    } elseif ($case === 'validation') {
        $valid = $valid && $body['data'] === null && $body['error'] === 'Validation Failed'
            && $body['errors'] === ['fullname' => 'Required'] && count($body) === 5;
    } else {
        $valid = $valid && $body['data'] === null && $body['path'] === '/tickets/book'
            && $body['error'] === ($case === 'missing' ? 'Resource Not Found' : 'Internal Server Error')
            && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+00:00$/', $body['timestamp']);
    }
    if (!$valid) {
        throw new RuntimeException('Failed response case: ' . $case);
    }
}
echo "4 response checks passed.\n";
