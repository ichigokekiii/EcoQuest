-- ============================================================
--  EcoQuest Database Schema
--  Generated from: Database_Relations.png & DB_Relation_na_mas_madali_makita.png
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecoquest
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecoquest;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE users (
    id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    username      VARCHAR(50)       NOT NULL UNIQUE,
    email         VARCHAR(100)      NOT NULL UNIQUE,
    password_hash VARCHAR(255)      NOT NULL,
    points        INT UNSIGNED      NOT NULL DEFAULT 0,
    created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ============================================================
-- 2. trashCategories
-- ============================================================
CREATE TABLE trashCategories (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)  NOT NULL UNIQUE,         -- e.g. Plastic, Paper, Metal
    description TEXT,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ============================================================
-- 3. routes
-- ============================================================
CREATE TABLE routes (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150)  NOT NULL,
    description TEXT,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ============================================================
-- 4. missions
--    • belongs to a route (has many)
--    • may optionally require a trashCategory
-- ============================================================
CREATE TABLE missions (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    route_id         INT UNSIGNED  NOT NULL,
    category_id      INT UNSIGNED  DEFAULT NULL,       -- may require category (optional)
    title            VARCHAR(150)  NOT NULL,
    description      TEXT,
    target_quantity  INT UNSIGNED  NOT NULL DEFAULT 1,
    points_reward    INT UNSIGNED  NOT NULL DEFAULT 0,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_missions_route    FOREIGN KEY (route_id)    REFERENCES routes        (id) ON DELETE CASCADE,
    CONSTRAINT fk_missions_category FOREIGN KEY (category_id) REFERENCES trashCategories (id) ON DELETE SET NULL
);

-- ============================================================
-- 5. routeSessions
--    • started/completed by a user
--    • uses a route
--    • uses trashCategories optionally (junction handled via trashSubmissions)
-- ============================================================
CREATE TABLE routeSessions (
    id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED  NOT NULL,
    route_id       INT UNSIGNED  NOT NULL,
    status         ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
    points_earned  INT UNSIGNED  NOT NULL DEFAULT 0,
    started_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at   TIMESTAMP     DEFAULT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_rs_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_rs_route FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
);

-- ============================================================
-- 6. trashSubmissions
--    • submitted by a user
--    • belongs to a routeSession
--    • classified as a trashCategory
-- ============================================================
CREATE TABLE trashSubmissions (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id          INT UNSIGNED  NOT NULL,
    route_session_id INT UNSIGNED  NOT NULL,
    category_id      INT UNSIGNED  NOT NULL,
    quantity         INT UNSIGNED  NOT NULL DEFAULT 1,
    image_url        VARCHAR(500)  DEFAULT NULL,
    submitted_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ts_user     FOREIGN KEY (user_id)          REFERENCES users          (id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_session  FOREIGN KEY (route_session_id) REFERENCES routeSessions  (id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_category FOREIGN KEY (category_id)      REFERENCES trashCategories(id) ON DELETE RESTRICT
);

-- ============================================================
-- 7. achievements  (earned / unlocked by a user)
-- ============================================================
CREATE TABLE achievements (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED  NOT NULL,
    title       VARCHAR(150)  NOT NULL,
    description TEXT,
    earned_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ach_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ============================================================
-- 8. rewards
--    • redeemed through users (many-to-many via redemptions)
-- ============================================================
CREATE TABLE rewards (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name          VARCHAR(150)  NOT NULL,
    description   TEXT,
    points_cost   INT UNSIGNED  NOT NULL DEFAULT 0,
    stock         INT           DEFAULT NULL,          -- NULL = unlimited
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ============================================================
-- 9. redemptions
--    • a user redeems a reward
-- ============================================================
CREATE TABLE redemptions (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id      INT UNSIGNED  NOT NULL,
    reward_id    INT UNSIGNED  NOT NULL,
    status       ENUM('pending', 'approved', 'rejected', 'claimed') NOT NULL DEFAULT 'pending',
    redeemed_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_red_user   FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT fk_red_reward FOREIGN KEY (reward_id) REFERENCES rewards (id) ON DELETE RESTRICT
);

-- ============================================================
-- 10. notifications  (received by a user; triggered by redemptions)
-- ============================================================
CREATE TABLE notifications (
    id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED  NOT NULL,
    redemption_id  INT UNSIGNED  DEFAULT NULL,
    type           VARCHAR(50)   NOT NULL,             -- e.g. 'reward_approved', 'mission_complete'
    message        TEXT          NOT NULL,
    is_read        TINYINT(1)    NOT NULL DEFAULT 0,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user       FOREIGN KEY (user_id)       REFERENCES users       (id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_redemption FOREIGN KEY (redemption_id) REFERENCES redemptions (id) ON DELETE SET NULL
);

-- ============================================================
-- 11. missionProgress
--    • tracks per-user progress on a mission (contains progress for missions)
--    • driven by trashSubmissions
-- ============================================================
CREATE TABLE missionProgress (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED  NOT NULL,
    mission_id          INT UNSIGNED  NOT NULL,
    route_session_id    INT UNSIGNED  DEFAULT NULL,
    current_quantity    INT UNSIGNED  NOT NULL DEFAULT 0,
    is_completed        TINYINT(1)    NOT NULL DEFAULT 0,
    completed_at        TIMESTAMP     DEFAULT NULL,
    updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mp_user_mission (user_id, mission_id),
    CONSTRAINT fk_mp_user    FOREIGN KEY (user_id)          REFERENCES users         (id) ON DELETE CASCADE,
    CONSTRAINT fk_mp_mission FOREIGN KEY (mission_id)       REFERENCES missions      (id) ON DELETE CASCADE,
    CONSTRAINT fk_mp_session FOREIGN KEY (route_session_id) REFERENCES routeSessions (id) ON DELETE SET NULL
);
