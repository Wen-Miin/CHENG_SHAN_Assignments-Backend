const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const routes = require('./routes')

const app = express()

const corsOptions = {
    origin: [
        'https://front.miage-assignment.cf',
        // add more urls here to allow cross origin
    ],
}

// gère le cross domain
app.use(cors(corsOptions))
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})

// parse requests of content-type - application/json
app.use(bodyParser.json())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// on dit a notre app d'utiliser notre objet routes qui représente une architecture de routes bien définies.
app.use('/', routes)

module.exports = app
