const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'recipes.db');
const db = new sqlite3.Database(dbPath);

const initSql = require('fs').readFileSync('./sql/create.sql').toString();
db.exec(initSql);

// GET all
app.get('/recipes', (req, res) => {
  db.all("SELECT * FROM recipes", [], (err, rows) => {
    res.status(200).json({ recipes: rows });
  });
});

// GET by id
app.get('/recipes/:id', (req, res) => {
  db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
    res.status(200).json({
      message: "Recipe details by id",
      recipe: [row]
    });
  });
});

// POST
app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;
  if (!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(200).json({ message: "Recipe creation failed!", required: "title, making_time, serves, ingredients, cost" });
  }
  db.run(
    "INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES (?, ?, ?, ?, ?)",
    [title, making_time, serves, ingredients, cost],
    function () {
      res.status(200).json({ message: "Recipe successfully created!" });
    }
  );
});

// PATCH
app.patch('/recipes/:id', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;
  db.run(
    "UPDATE recipes SET title=?, making_time=?, serves=?, ingredients=?, cost=? WHERE id=?",
    [title, making_time, serves, ingredients, cost, req.params.id],
    () => {
      res.status(200).json({
        message: "Recipe successfully updated!",
        recipe: [{ title, making_time, serves, ingredients, cost }]
      });
    }
  );
});

// DELETE
app.delete('/recipes/:id', (req, res) => {
  db.run("DELETE FROM recipes WHERE id=?", [req.params.id], () => {
    res.status(200).json({ message: "Recipe successfully removed!" });
  });
});

module.exports = app;
