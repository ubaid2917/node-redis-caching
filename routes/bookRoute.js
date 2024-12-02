const express = require('express');
const app = express(); 
const bookController = require('../controller/bookController');



app.post('/create-book',bookController.createBook); 
app.get('/books',bookController.getBooks); 
app.put('/update-book/:id',bookController.updateBook); 
app.delete('/delete-book/:id',bookController.deleteBook); 

module.exports = app;