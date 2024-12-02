const express = require('express');
const app = express(); 
const authorController = require('../controller/authorController');



app.post('/create-author',authorController.createAuthor); 
app.get('/authors',authorController.getAuthors); 
app.put('/update-author/:id',authorController.updateAuthor); 
app.delete('/delete-author/:id',authorController.deleteAuthor); 

module.exports = app;