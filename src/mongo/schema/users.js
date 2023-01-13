const mongoose = require('mongoose')

const Schema = mongoose.Schema

const student = 'STUDENT'
const teacher = 'TEACHER'
const admin = 'ADMIN'

const Users = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: 'string',
        default: student,
        enum: [student, teacher, admin],
        required: true,
    },
})

module.exports = mongoose.model('users', Users)
