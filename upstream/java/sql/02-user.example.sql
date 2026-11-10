-- 管理者用の設定例。CHANGE_ME_LOCALを自分の学習用パスワードへ変更する。
-- すでに同名ユーザーがある場合は、無断で変更せず講師に確認する。
CREATE USER 'kadaiuser'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME_LOCAL';
GRANT SELECT, INSERT, UPDATE, DELETE ON kadaidb.* TO 'kadaiuser'@'127.0.0.1';
