const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./recipes.db');

// 404 for root
app.get('/', (req, res) => {
  res.sendStatus(404);
});

// GET all recipes
app.get('/recipes', (req, res) => {
  db.all("SELECT id, title, making_time, serves, ingredients, cost FROM recipes", [], (err, rows) => {
    res.status(200).json({ recipes: rows });
  });
});

// GET recipe by id
app.get('/recipes/:id', (req, res) => {
  db.get("SELECT id, title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
    res.status(200).json({
      message: "Recipe details by id",
      recipe: row
    });
  });
});

// POST create recipe
app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  if (!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(200).json({
      message: "Recipe creation failed!",
      required: "title, making_time, serves, ingredients, cost"
    });
  }

  db.run(
    "INSERT INTO recipes (title, making_time, serves, ingredients, cost, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
    [title, making_time, serves, ingredients, cost],
    function () {
      db.get("SELECT id, title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?", [this.lastID], (err, recipe) => {
        res.status(200).json({
          message: "Recipe successfully created!",
          recipe: recipe
        });
      });
    }
  );
});

// PATCH update recipe
app.patch('/recipes/:id', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  db.run(
    "UPDATE recipes SET title=?, making_time=?, serves=?, ingredients=?, cost=?, updated_at=datetime('now') WHERE id=?",
    [title, making_time, serves, ingredients, cost, req.params.id],
    function () {
      db.get("SELECT title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?", [req.params.id], (err, recipe) => {
        res.status(200).json({
          message: "Recipe successfully updated!",
          recipe: recipe
        });
      });
    }
  );
});

// DELETE recipe
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
