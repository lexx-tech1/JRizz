<?php
require __DIR__ . '/db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed.', 405);
}

// The frontend sends JSON: { "name": "...", "message": "..." }
$input   = json_decode(file_get_contents('php://input'), true) ?? [];
$name    = trim((string)($input['name'] ?? ''));
$message = trim((string)($input['message'] ?? ''));

if ($name === '' || mb_strlen($name) > 80) {
    fail('Enter a name of up to 80 characters.', 400);
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 500) {
    fail('Write a reflection between 10 and 500 characters.', 400);
}

try {
    $db   = getDB();
    $stmt = $db->prepare('INSERT INTO reflections (name, message) VALUES (?, ?)');
    $stmt->execute([$name, $message]);

    $id   = (int)$db->lastInsertId();
    $stmt = $db->prepare('SELECT id, name, message, created_at FROM reflections WHERE id = ?');
    $stmt->execute([$id]);
    respond($stmt->fetch(), 201);
} catch (PDOException $e) {
    error_log($e->getMessage());
    fail('Could not save your reflection. Try again.');
}
