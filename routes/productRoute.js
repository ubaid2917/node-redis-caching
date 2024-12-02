const express = require("express");
const app = express();
const productController = require("../controller/productController");
const { verifyToken } = require("../config/jwt");

app.post("/create-product", verifyToken, productController.createProduct);
app.get("/products", verifyToken, productController.getProducts);
// app.get('/books',bookController.getBooks);
// app.put('/update-book/:id',bookController.updateBook);
// app.delete('/delete-book/:id',bookController.deleteBook);

module.exports = app;
