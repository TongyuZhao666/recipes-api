const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./recipes.db');

// 初始化数据库
const initSQL = fs.readFileSync('./sql/create.sql', 'utf8');
db.exec(initSQL);

// 访问根路径必须返回404（题目要求）
app.get('/', (req, res) => {
  res.status(404).send('Not Found');
});


// ================= POST /recipes =================
app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  if (!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(200).json({
      message: "Recipe creation failed!"
    });
  }

  const sql = `
    INSERT INTO recipes (title, making_time, serves, ingredients, cost)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [title, making_time, serves, ingredients, cost], function (err) {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    res.status(200).json({
      recipe: {
        id: this.lastID,
        title,
        making_time,
        serves,
        ingredients,
        cost
      }
    });
  });
});


// ================= GET /recipes =================
app.get('/recipes', (req, res) => {
  db.all('SELECT * FROM recipes', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    res.status(200).json({ recipes: rows });
  });
});


// ================= GET /recipes/:id =================
app.get('/recipes/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    res.status(200).json({ recipe: row });
  });
});


// ================= PATCH /recipes/:id =================
app.patch('/recipes/:id', (req, res) => {
  const id = req.params.id;
  const { title, making_time, serves, ingredients, cost } = req.body;

  const sql = `
    UPDATE recipes
    SET title = ?, making_time = ?, serves = ?, ingredients = ?, cost = ?
    WHERE id = ?
  `;

  db.run(sql, [title, making_time, serves, ingredients, cost, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
      res.status(200).json({ recipe: row });
    });
  });
});


// ================= DELETE /recipes/:id =================
app.delete('/recipes/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM recipes WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    res.status(200).json({ message: "Recipe successfully removed!" });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
