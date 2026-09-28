-- Rizal's Influence on Filipino Nationalism — database schema + seed data
-- Import via phpMyAdmin (Import tab), or:  mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS rizal_museum_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rizal_museum_db;

DROP TABLE IF EXISTS reflections;
DROP TABLE IF EXISTS timeline;
DROP TABLE IF EXISTS exhibits;

/* ── Exhibits: writings and their meaning ─────────────────────────────── */
CREATE TABLE exhibits (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(160) NOT NULL,
  category    VARCHAR(40)  NOT NULL,          -- Novel, Poem, Essay
  year_written VARCHAR(20) NOT NULL,
  place       VARCHAR(80)  NOT NULL,
  summary     VARCHAR(400) NOT NULL,          -- one-line description shown on the row
  body        TEXT         NOT NULL,          -- what it exposed / how it shaped nationalism
  sort_order  INT          NOT NULL DEFAULT 0
);

/* ── Timeline: birth to Bagumbayan ────────────────────────────────────── */
CREATE TABLE timeline (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  year        SMALLINT     NOT NULL,
  date_label  VARCHAR(40)  NOT NULL,          -- e.g. "June 19"
  title       VARCHAR(160) NOT NULL,
  description TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
);

/* ── Reflections: visitor guestbook ───────────────────────────────────── */
CREATE TABLE reflections (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80)  NOT NULL,
  message    VARCHAR(500) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

/* ── Seed: exhibits ───────────────────────────────────────────────────── */
INSERT INTO exhibits (title, category, year_written, place, summary, body, sort_order) VALUES
('Noli Me Tangere', 'Novel', '1887', 'Berlin',
 'Rizal''s first novel, a portrait of Philippine society under Spanish rule.',
 'Published in Berlin in March 1887, the novel follows Crisóstomo Ibarra as he returns from Europe and finds a country governed by fear. Through the friars, the civil guard and the local elite, Rizal shows how abuse of power was woven into everyday life: in the church, the school and the courtroom. Readers in the Philippines were given a shared picture of their own society for the first time. Spanish authorities banned the book, yet copies circulated in secret, and its characters became a common vocabulary for discussing injustice.',
 1),
('Sobre la Indolencia de los Filipinos', 'Essay', '1890', 'Barcelona',
 'An essay answering the claim that Filipinos were naturally lazy.',
 'Serialized in La Solidaridad in 1890, the essay argues that the so-called indolence of Filipinos was a result of colonial policy, not character. Forced labor, heavy taxes, poor education and the lack of opportunity discouraged effort. Rizal also points to the climate and to the loss of pre-colonial trade. By rejecting a stereotype used to justify Spanish rule, he helped Filipinos see their condition as a product of history that could be changed.',
 2),
('El Filibusterismo', 'Novel', '1891', 'Ghent',
 'The sequel, darker in tone, dedicated to Gomez, Burgos and Zamora.',
 'Published in Ghent in September 1891, the sequel follows Simoun, a wealthy jeweler who plots revenge against the colonial order. The book is more openly political than the Noli. It questions whether reform through Spanish institutions can work and examines the cost of violent revolution. Its dedication to the priests executed in 1872 links Rizal''s work directly to the memory of that injustice. Later generations read it as a warning that liberation requires moral preparation as well as courage.',
 3),
('Mi Último Adiós', 'Poem', '1896', 'Fort Santiago, Manila',
 'A farewell poem written in Rizal''s cell before his execution.',
 'Rizal wrote the poem in the last days before December 30, 1896, and it was found after his death. It has no title in the original manuscript; the name by which it is known was given later. The poem speaks of dying for the country without asking for reward, and it addresses the homeland directly as a beloved. Translated into many languages, it has been read at public gatherings for over a century and remains a common way for Filipinos to express love of country.',
 4);

/* ── Seed: timeline ───────────────────────────────────────────────────── */
INSERT INTO timeline (year, date_label, title, description, sort_order) VALUES
(1861, 'June 19', 'Born in Calamba, Laguna',
 'José Protasio Rizal Mercado y Alonso Realonda is born, the seventh of eleven children in a landholding family.', 1),
(1872, 'February 17', 'Execution of Gomburza',
 'Fathers Gomez, Burgos and Zamora are executed after the Cavite mutiny. Rizal, aged 10, later credits the event with shaping his purpose.', 2),
(1877, 'March', 'Graduates from Ateneo',
 'Rizal finishes his Bachelor of Arts at the Ateneo Municipal and goes on to study at the University of Santo Tomás.', 3),
(1882, 'May 3', 'Leaves for Spain',
 'He sails to Madrid to continue medical studies and joins the circle of Filipino reformists abroad.', 4),
(1887, 'March', 'Noli Me Tangere published',
 'The novel is printed in Berlin with the help of friends and is soon banned in the Philippines.', 5),
(1889, 'February', 'Writes for La Solidaridad',
 'Rizal begins contributing to the reform newspaper of Filipinos in Spain, arguing for representation and equal rights.', 6),
(1891, 'September', 'El Filibusterismo published',
 'The second novel is printed in Ghent and dedicated to Gomburza.', 7),
(1892, 'July 3', 'Founds La Liga Filipina',
 'Back in Manila, Rizal forms a civic association for mutual aid and reform. He is arrested three days later and deported to Dapitan.', 8),
(1892, 'July 17', 'Exile in Dapitan begins',
 'During four years of exile he runs a clinic, teaches boys, and helps build a water system for the town.', 9),
(1896, 'August', 'Katipunan revolt begins',
 'Rizal, on his way to Cuba as a volunteer army doctor, is arrested aboard ship and returned to Manila for trial.', 10),
(1896, 'December 30', 'Executed at Bagumbayan',
 'Convicted of rebellion, Rizal is shot by firing squad at Bagumbayan, now Rizal Park. He is 35.', 11);

/* ── Seed: sample reflection ──────────────────────────────────────────── */
INSERT INTO reflections (name, message) VALUES
('Sample visitor', 'I learned that Rizal chose the pen over the sword, and that his writing gave Filipinos a way to imagine themselves as one people.');
