<?php
require __DIR__ . '/db_config.php';

try {
    $rows = getDB()->query(
        'SELECT id, title, category, year_written, place, summary, body
         FROM exhibits ORDER BY sort_order'
    )->fetchAll();
    respond($rows);
} catch (PDOException $e) {
    error_log($e->getMessage());
    fail('Could not load exhibits.');
}
