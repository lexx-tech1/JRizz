# Rizal and the Nation: a digital exhibit

Topic: **Rizal's Influence on Filipino Nationalism**.

An educational website on how José Rizal's writings and life shaped Filipino nationalism.
Plain HTML, CSS and JavaScript with Three.js for the 3D sections. No server code or database.

## Project structure

```
rizal-museum/
├── assets/                    portraits, book covers, photos
├── css/
│   ├── style.css              design tokens are at the top
│   ├── additions.css
│   ├── improve.css
│   ├── gallery3d.css          3D Gallery styles
│   └── depth3d.css            styles for the other 3D sections
├── js/
│   ├── script.js              Reading Room and Timeline content (edit the data at the top)
│   ├── additions.js
│   ├── book.js                Archive page-turning book
│   ├── nav.js
│   ├── depth.js               CSS 3D: book tilt, timeline drum, hero/archive lean
│   ├── kit3d.js               shared Three.js helpers
│   ├── story3d.js             The Idea: scroll-driven particle story
│   ├── gallery3d.js           3D Gallery (Three.js, loaded from jsDelivr)
│   ├── chain3d.js             Chain of Influence: domino run 1872–1956
│   └── journey3d.js           Journey: globe and voyage
├── index.html
└── README.md
```

## Running it

The 3D sections are JavaScript modules, and browsers block those on pages opened by double-clicking
(`file://`). Serve the folder instead, using any one of these:

- **VS Code:** install the Live Server extension, right-click `index.html`, and choose **Open with Live Server**.
- **Python:** run `python -m http.server` in this folder, then open http://localhost:8000
- **XAMPP:** copy the folder to `C:\xampp\htdocs\rizal-museum`, start Apache, and open http://localhost/rizal-museum/
- **GitHub Pages:** in the repository's Settings → Pages, publish from the `main` branch. The site is static, so it works as is.

An internet connection is needed: Three.js, the fonts, and the globe's Earth images load from CDNs.

## Sections

| Section | What visitors do | Point it makes |
|---|---|---|
| The Idea | Scroll through four particle scenes; move the cursor through them; click for a ripple | Scattered islands → the pen → a shared story → a nation (the flag) |
| 3D Gallery | Walk a rotunda of ten artifacts, answer a question at each, collect passport stamps | What each work or event added to the nation |
| Reading Room | Tilt the 3D books, turn them over | Each work's influence on nationalism |
| Chain of Influence | Push a line of dominoes, all at once or one at a time | How one event pushed the next, from Gomburza (1872) to the Rizal Law (1956) |
| Timeline | Rows roll like a drum as you scroll | Milestones, 1861–1896 |
| Journey | Spin a globe, click pins, play the voyage | Where the ideas were written, and what each place added |
| Archive | The page-turning book leans with the cursor | Primary details on each work |

Gallery stamps are kept in the visitor's browser (localStorage). Each 3D scene has a plain list next to it with the
same content, for keyboard users and browsers without WebGL.

## Editing content

- Reading Room and Timeline: the `EXHIBITS` and `TIMELINE` arrays at the top of `js/script.js`.
- 3D Gallery cards and quizzes: `EXHIBITS` in `js/gallery3d.js`.
- Chain of Influence: `CHAIN` in `js/chain3d.js`.
- Journey stops: `STOPS` in `js/journey3d.js`.
- Archive pages: `PAGES` in `js/book.js`.

All text is inserted with `textContent`. Check dates and wording against your course sources before publishing.
