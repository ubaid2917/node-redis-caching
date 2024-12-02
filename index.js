const express  = require('express');
const app  = express();  
require('dotenv').config()
const {Redis} = require('./config/redis-config')
const db = require('./config/db');
const routes = require('./routes/index'); 
const bodyParser = require("body-parser"); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(routes);


app.get('/', function(req,res) {
    res.send('Hello World!');
}) 

app.listen(8000, ()=> {
    console.log('Server running on port 8000');  // Logging the server's status upon start.  // This is a simple example of a server running on port 8000. You could replace it with your own server setup.  // You can also add more functionalities to this server, like handling different routes, implementing middleware, etc.  // For example, you could add a route to handle a GET request to '/api/data' and respond with some data.  // This is just a basic example. In a production environment, you would need to consider security, error handling, and more.  // For example, you might want to use middleware to validate the request headers, handle errors gracefully, etc.  // Also, you might want to use a database or a real-time database to store and retrieve data.  // For example, you could use MongoDB or Firebase Realtime Database.  // Remember to handle sensitive
})