const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./recipes.db');

/* ========= 正确初始化数据库（关键） ========= */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      making_time TEXT,
      serves TEXT,
      ingredients TEXT,
      cost INTEGER
    )
  `);

  db.get("SELECT COUNT(*) as count FROM recipes", (err, row) => {
    if (row.count === 0) {
      db.run(`
        INSERT INTO recipes (title, making_time, serves, ingredients, cost)
        VALUES
        ('チキンカレー','45分','4人','玉ねぎ,肉,スパイス',1000),
        ('オムライス','30分','2人','玉ねぎ,卵,スパイス,醤油',700)
      `);
    }
  });
});

/* ========= Root 必须 404 ========= */
app.get('/', (req, res) => {
  res.status(404).send('Not Found');
});

/* ========= POST /recipes ========= */
app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  if (!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(200).json({
      message: "Recipe creation failed!",
      required: "title, making_time, serves, ingredients, cost"
    });
  }

  db.run(
    `INSERT INTO recipes (title, making_time, serves, ingredients, cost)
     VALUES (?, ?, ?, ?, ?)`,
    [title, making_time, serves, ingredients, cost],
    function () {
      db.get(
        "SELECT id, title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?",
        [this.lastID],
        (err, recipe) => {
          res.status(200).json({
            message: "Recipe successfully created!",
            recipe: [recipe]
          });
        }
      );
    }
  );
});

/* ========= GET /recipes ========= */
app.get('/recipes', (req, res) => {
  db.all(
    "SELECT id, title, making_time, serves, ingredients, cost FROM recipes",
    [],
    (err, rows) => {
      res.status(200).json({ recipes: rows });
    }
  );
});

/* ========= GET /recipes/:id ========= */
app.get('/recipes/:id', (req, res) => {
  db.get(
    "SELECT id, title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?",
    [req.params.id],
    (err, row) => {
      res.status(200).json({
        message: "Recipe details by id",
        recipe: [row]
      });
    }
  );
});

/* ========= PATCH /recipes/:id ========= */
app.patch('/recipes/:id', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  db.run(
    `UPDATE recipes
     SET title=?, making_time=?, serves=?, ingredients=?, cost=?
     WHERE id=?`,
    [title, making_time, serves, ingredients, cost, req.params.id],
    function () {
      db.get(
        "SELECT title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?",
        [req.params.id],
        (err, recipe) => {
          res.status(200).json({
            message: "Recipe successfully updated!",
            recipe: [recipe]
          });
        }
      );
    }
  );
});

/* ========= DELETE /recipes/:id ========= */
app.delete('/recipes/:id', (req, res) => {
  db.run("DELETE FROM recipes WHERE id = ?", [req.params.id], function () {
    if (this.changes === 0) {
      return res.status(200).json({ message: "No Recipe found" });
    }
    res.status(200).json({ message: "Recipe successfully removed!" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
