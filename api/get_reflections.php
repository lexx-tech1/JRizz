<?php
require __DIR__ . '/db_config.php';

try {
    $rows = getDB()->query(
        'SELECT id, name, message, created_at
         FROM reflections ORDER BY created_at DESC, id DESC LIMIT 100'
    )->fetchAll();
    respond($rows);
} catch (PDOException $e) {
    error_log($e->getMessage());
    fail('Could not load reflections.');
}
