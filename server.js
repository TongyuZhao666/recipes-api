const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./recipes.db');

// ---------- POST /recipes ----------
app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  // 参数缺失
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

// ---------- GET /recipes ----------
app.get('/recipes', (req, res) => {
  db.all("SELECT * FROM recipes", (err, rows) => {
    res.status(200).json({
      recipes: rows
    });
  });
});

// ---------- GET /recipes/:id ----------
app.get('/recipes/:id', (req, res) => {
  db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
    res.status(200).json({
      recipe: row
    });
  });
});

// ---------- PATCH /recipes/:id ----------
app.patch('/recipes/:id', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  const sql = `
    UPDATE recipes
    SET title=?, making_time=?, serves=?, ingredients=?, cost=?
    WHERE id=?
  `;

  db.run(sql, [title, making_time, serves, ingredients, cost, req.params.id], () => {
    db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
      res.status(200).json({
        recipe: row
      });
    });
  });
});

// ---------- DELETE /recipes/:id ----------
app.delete('/recipes/:id', (req, res) => {
  db.run("DELETE FROM recipes WHERE id = ?", [req.params.id], () => {
    res.status(200).json({
      message: "Recipe successfully removed!"
    });
  });
});

module.exports = app;
