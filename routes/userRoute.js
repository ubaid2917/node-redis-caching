const express = require("express");
const app = express();
const authController = require("../controller/authController");

app.post("/register", authController.registerUser);
app.post("/login", authController.loginUser);

// get user

app.get("/users", authController.showUsers);

// app.put('/update-author/:id',authorController.updateAuthor);
// app.delete('/delete-author/:id',authorController.deleteAuthor);

module.exports = app;
