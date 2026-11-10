-- 学習データの全件削除専用。必要時に限り、対象DBと件数を確認して実行する。
USE kadaidb;
SELECT DATABASE(), COUNT(*) AS target_count FROM tasks;
-- 次の行は意図的にコメントにしてある。講師の案内で解除して実行する。
-- DELETE FROM tasks;
