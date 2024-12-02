const express = require('express');
const app = express(); 


app.use('/api',require('./bookRoute')); 
app.use('/api',require('./authorRoute')); 
app.use('/api',require('./userRoute')); 
app.use('/api',require('./productRoute')); 
module.exports = app;