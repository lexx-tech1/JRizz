# Rizal and the Nation: a digital exhibit

Topic: **Rizal's Influence on Filipino Nationalism**.

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
│   ├── additions.css
│   ├── gallery3d.css          3D Gallery styles
│   └── depth3d.css            styles for the other 3D sections
├── js/
│   ├── script.js
│   ├── additions.js
│   ├── depth.js               CSS 3D: book tilt, timeline drum, hero/archive lean
│   ├── kit3d.js               shared Three.js helpers
│   ├── story3d.js             The Idea: scroll-driven particle story
│   ├── gallery3d.js           3D Gallery (Three.js, loaded from jsDelivr)
│   ├── chain3d.js             Chain of Influence: domino run 1872–1956
│   ├── journey3d.js           Journey: globe and voyage
│   └── lanterns3d.js          Reflections as parol lanterns
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

## 3D sections

Every section has a 3D, interactive layer tied to the topic:

| Section | What visitors do | Point it makes |
|---|---|---|
| The Idea | Scroll through four particle scenes; move the cursor through them; click for a ripple | Scattered islands → the pen → a shared story → a nation (the flag) |
| 3D Gallery | Walk a rotunda of ten artifacts, answer a question at each, collect passport stamps | What each work or event added to the nation |
| Reading Room | Tilt the 3D books, turn them over | Each work's influence on nationalism (from the database) |
| Chain of Influence | Push a line of dominoes, all at once or one at a time | How one event pushed the next, from Gomburza (1872) to the Rizal Law (1956) |
| Timeline | Rows roll like a drum as you scroll | Milestones, 1861–1896 (from the database) |
| Journey | Spin a globe, click pins, play the voyage | Where the ideas were written, and what each place added |
| Archive | The page-turning book leans with the cursor | Primary details on each work |
| Reflections | Each reflection is a parol lantern; posting one sends a new lantern up | Visitors' own takeaways |

The 3D sections use Three.js from jsDelivr, and the globe loads NASA Blue Marble imagery from the three-globe
package, so they need an internet connection. They do not need the PHP API, except Reading Room, Timeline and
Reflections, which show database content. Gallery stamps are kept in the visitor's browser (localStorage).
Each 3D scene has a plain list next to it with the same content, for keyboard users and browsers without WebGL.

## Notes

- Reflections are validated on the server (name up to 80 characters, message 10 to 500) and inserted with prepared statements.
- The frontend renders all text with `textContent`, so visitor input is never treated as HTML.
- Seed text is a starting point. Check dates and wording against your course sources before publishing.
