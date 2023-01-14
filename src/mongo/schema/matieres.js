const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Matieres = new Schema({
    nom: {
        type: String,
        required: true,
    },
    professeur: {
        type: String,
        required: true,
    },
    imageMatiere: {
        type: Buffer,
    },
    imageProf: {
        type: Buffer,
    },
})

export default mongoose.model('matieres', Matieres)
