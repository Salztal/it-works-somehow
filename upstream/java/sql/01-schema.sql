-- 初回だけ、管理者で実行する。既存のtasksは上書きしない。
CREATE DATABASE IF NOT EXISTS kadaidb
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kadaidb;
CREATE TABLE tasks (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  detail VARCHAR(1000) NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
