const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true,
    },
   

}) 

module.exports = mongoose.model('author', authorSchema)