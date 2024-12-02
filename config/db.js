const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/node-redis', {})

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error connecting to the database:', error);
});

db.once('open', () => {
  console.log('Connection successful');
});

module.exports = db;