<?php
// Database connection + small JSON helpers shared by every endpoint.
// Defaults match a fresh XAMPP/Laragon install (user "root", empty password).
// Change them here if your MySQL login is different.

const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASS = '';
const DB_NAME = 'rizal_museum_db';

// const DB_HOST = 'sql313.infinityfree.com';
// const DB_USER = 'if0_43035121';
// const DB_PASS = 'nN4VrSnEu5awvUH';
// const DB_NAME = 'if0_43035121_rizal_museum_db';

header('Content-Type: application/json; charset=utf-8');

function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function respond($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $message, int $status = 500): void
{
    respond(['error' => $message], $status);
}
