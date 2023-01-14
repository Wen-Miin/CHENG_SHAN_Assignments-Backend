const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Assignments = new Schema({
    nom: {
        type: String,
        required: true,
    },
    auteur: {
        type: String,
        required: true,
    },
    matiere: {
        type: String,
        required: true,
    },
    dateDeRendu: {
        type: Date,
        required: true,
    },
    note: {
        type: Number,
    },
    rendu: {
        type: Boolean,
        default: false,
    },
    remarque: {
        type: String,
    },
})

module.exports = mongoose.model('assignments', Assignments)
