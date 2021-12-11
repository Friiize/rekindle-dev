CREATE DATABASE IF NOT EXISTS rekindle_dev;

USE rekindle_dev;

CREATE TABLE IF NOT EXISTS achievements
(
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    achievement     VARCHAR(255) NOT NULL,
    description     text         NOT NULL,
    created_by_tag  VARCHAR(255),
    created_by_id   INT(20),
    created_at      datetime,
    modified_by_tag VARCHAR(255),
    modified_by_id  INT(20),
    modified_at     datetime
);

CREATE TABLE IF NOT EXISTS serments
(
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    leader_tag      VARCHAR(255),
    logo_src        VARCHAR(255) NOT NULL,
    description     text         NOT NULL,
    footer_img_src  VARCHAR(255),
    created_by_tag  VARCHAR(255),
    created_by_id   INT(20),
    created_at      datetime,
    modified_by_tag VARCHAR(255),
    modified_by_id  INT(20),
    modified_at     datetime
);

CREATE TABLE IF NOT EXISTS users
(
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_tag        VARCHAR(255) NOT NULL,
    rp_name         VARCHAR(255),
    rp_firstname    VARCHAR(255),
    rp_surname      VARCHAR(255),
    rp_age          INT(3),
    rp_title        VARCHAR(255),
    rp_class        VARCHAR(255),
    serment_id      INT UNSIGNED,
    FOREIGN KEY (serment_id) REFERENCES serments (id),
    achievement_id  INT UNSIGNED,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id),
    created_by_tag  VARCHAR(255),
    created_by_id   INT(20),
    created_at      datetime,
    modified_by_tag VARCHAR(255),
    modified_by_id  INT(20),
    modified_at     datetime
);

CREATE TABLE IF NOT EXISTS user_achievement
(
    user_id        INT UNSIGNED,
    FOREIGN KEY (user_id) REFERENCES users (id),
    achievement_id INT UNSIGNED,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id)
);
