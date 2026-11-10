-- 再実行すると同じ内容が追加される。採番されたIDは環境によって異なる。
USE kadaidb;
INSERT INTO tasks (title, detail, completed) VALUES
  ('Javaの復習', '変数と条件分岐を確認する', FALSE),
  ('DB接続の確認', '一覧に表示されるか確認する', TRUE);
