CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  making_time TEXT,
  serves TEXT,
  ingredients TEXT,
  cost INTEGER
);

INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES
('チキンカレー', '45分', '4人', '玉ねぎ,肉,スパイス', 1000),
('オムライス', '30分', '2人', '玉ねぎ,卵,スパイス,醤油', 700);
