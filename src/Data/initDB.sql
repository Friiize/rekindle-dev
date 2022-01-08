CREATE DATABASE IF NOT EXISTS rekindle_dev;

USE rekindle_dev;

CREATE TABLE IF NOT EXISTS achievements
(
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    achievement     VARCHAR(255) NOT NULL,
    description     text         NOT NULL,
    created_by_tag  VARCHAR(255),
    created_by_id   BIGINT(30),
    created_at      datetime,
    modified_by_tag VARCHAR(255),
    modified_by_id  BIGINT(30),
    modified_at     datetime
);

CREATE TABLE IF NOT EXISTS serments
(
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    leader_id           VARCHAR(255),
    leader_character_id VARCHAR(255),
    description         text         NOT NULL,
    assigned_game       VARCHAR(255),
    created_by_tag      VARCHAR(255),
    created_by_id       BIGINT(30),
    created_at          datetime,
    modified_by_tag     VARCHAR(255),
    modified_by_id      BIGINT(30),
    modified_at         datetime
);

CREATE TABLE IF NOT EXISTS rp_characters
(
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rp_name         VARCHAR(255),
    rp_firstname    VARCHAR(255),
    rp_surname      VARCHAR(255),
    rp_age          INT(3),
    rp_title        VARCHAR(255),
    rp_class        VARCHAR(255),
    serment_id      INT UNSIGNED,
    joined_at       datetime,
    FOREIGN KEY (serment_id) REFERENCES serments (id),
    assigned_game   VARCHAR(255),
    rp_backstory    TEXT(1512),
    user_tag        VARCHAR(255) NOT NULL,
    created_by_tag  VARCHAR(255),
    created_by_id   BIGINT(30),
    created_at      datetime,
    modified_by_tag VARCHAR(255),
    modified_by_id  BIGINT(30),
    modified_at     datetime
);

CREATE TABLE IF NOT EXISTS users
(
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT(30),
    user_tag        VARCHAR(255) NOT NULL,
    achievement_id  INT UNSIGNED,
    created_by_tag  VARCHAR(255),
    created_by_id   BIGINT(30),
    created_at      datetime,
    modified_by_tag VARCHAR(255),
    modified_by_id  BIGINT(30),
    modified_at     datetime
);

CREATE TABLE IF NOT EXISTS user_achievement
(
    user_id        BIGINT UNSIGNED REFERENCES users (id),
    achievement_id INT UNSIGNED REFERENCES achievements (id),
    obtained_at    datetime
);
