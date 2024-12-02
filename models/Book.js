const mongoose = require('mongoose');

const BookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author_id: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },

}) 

module.exports = mongoose.model('book', BookSchema)