<?php
require_once __DIR__ . '/../helpers/request.php';
require_method('GET');
respond(true, 'Backend PHP đang hoạt động.', ['php_version' => PHP_VERSION]);
