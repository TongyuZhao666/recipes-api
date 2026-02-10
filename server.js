const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./recipes.db');

// 初期化（表不存在时创建）
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
});


// ===================== POST /recipes =====================
app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  if (!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(200).json({
      message: "Recipe creation failed!",
      required: "title, making_time, serves, ingredients, cost"
    });
  }

  const sql = `
    INSERT INTO recipes (title, making_time, serves, ingredients, cost)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [title, making_time, serves, ingredients, cost], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    const recipe = {
      id: this.lastID,
      title,
      making_time,
      serves,
      ingredients,
      cost
    };

    res.status(200).json({
      message: "Recipe successfully created!",
      recipe: recipe
    });
  });
});


// ===================== GET /recipes =====================
app.get('/recipes', (req, res) => {
  db.all("SELECT * FROM recipes", (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      recipes: rows
    });
  });
});


// ===================== GET /recipes/:id =====================
app.get('/recipes/:id', (req, res) => {
  db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
    if (!row) {
      return res.status(200).json({ message: "No recipe found" });
    }

    res.status(200).json({
      message: "Recipe details by id",
      recipe: row
    });
  });
});


// ===================== PATCH /recipes/:id =====================
app.patch('/recipes/:id', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  const sql = `
    UPDATE recipes
    SET title = ?, making_time = ?, serves = ?, ingredients = ?, cost = ?
    WHERE id = ?
  `;

  db.run(sql, [title, making_time, serves, ingredients, cost, req.params.id], function () {
    db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, updatedRecipe) => {
      res.status(200).json({
        message: "Recipe successfully updated!",
        recipe: updatedRecipe
      });
    });
  });
});


// ===================== DELETE /recipes/:id =====================
app.delete('/recipes/:id', (req, res) => {
  db.run("DELETE FROM recipes WHERE id = ?", [req.params.id], function () {
    res.status(200).json({
      message: "Recipe successfully removed!"
    });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
