# Rizal and the Nation: a digital exhibit

An educational web app on how José Rizal's writings and life shaped Filipino nationalism.
Vanilla HTML/CSS/JS frontend, PHP API, MySQL database. Runs on localhost with XAMPP or Laragon.

## Project structure

```
rizal-museum/
├── api/
│   ├── db_config.php          DB login + JSON helpers
│   ├── get_exhibits.php
│   ├── get_timeline.php
│   ├── get_reflections.php
│   └── submit_reflection.php
├── assets/                    portraits, book covers, photos
├── css/
│   ├── style.css              design tokens are at the top
│   └── additions.css
├── js/
│   ├── script.js
│   └── additions.js
├── database.sql
├── index.html
└── README.md
```

## Setup (XAMPP)

1. Copy this folder to `C:\xampp\htdocs\rizal-museum`.
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. Open http://localhost/phpmyadmin, go to **Import**, choose `database.sql`, and click Import.
   This creates the `rizal_museum_db` database with sample data.
4. If your MySQL user or password is not `root` / empty, edit `api/db_config.php`.
5. Open http://localhost/rizal-museum/

Use the Apache URL above. Opening `index.html` by double-clicking will not work because the PHP files need to run through the server.

## API

| Method | Path | Purpose |
|---|---|---|
| GET  | `api/get_exhibits.php`      | Literary works and their impact |
| GET  | `api/get_timeline.php`      | Milestones, 1861 to 1896 |
| GET  | `api/get_reflections.php`   | Latest 100 visitor reflections |
| POST | `api/submit_reflection.php` | Save a reflection `{ name, message }` |

## Notes

- Reflections are validated on the server (name up to 80 characters, message 10 to 500) and inserted with prepared statements.
- The frontend renders all text with `textContent`, so visitor input is never treated as HTML.
- Seed text is a starting point. Check dates and wording against your course sources before publishing.
