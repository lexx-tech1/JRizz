<?php
require __DIR__ . '/db_config.php';

try {
    $rows = getDB()->query(
        'SELECT id, year, date_label, title, description
         FROM timeline ORDER BY sort_order'
    )->fetchAll();
    respond($rows);
} catch (PDOException $e) {
    error_log($e->getMessage());
    fail('Could not load the timeline.');
}
