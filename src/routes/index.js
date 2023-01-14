const express = require('express')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../mongo')
const { jwtSecretKey } = require('../config')

// on créer une instance d'express router
const router = express.Router()

// génération d'un token
function generateToken(username) {
    jwt.sign({ username }, jwtSecretKey)
}

// récupération du token
function getToken(req) {
    _.replace(req.headers.authorization, 'Bearer ', '')
}

// on dit a nos routes d'utiliser a travers un préfix une autre instance d'express router.
router.get('/', async (req, res) => {
    const { username } = await db.users.findUserByToken(getToken(req)) // on récupère le token et on récupère le nom d'utilisateur par son token

    // on créé un objet de filtre a passer dans mongo
    const filterParams = {
        rendu,
        username,
    }

    // on récupère tous les assignments avec les filtres
    const assignments = await db.assignments.findAll(filterParams, page, limit)

    // on construit la réponse que l'on va renvoyer au client
    const responsePayload = {
        data: assignments,
        pagination: { page, limit, total: await db.assignments.count() },
    }

    // un petit console log pour garder de la traçabilité au niveau de notre api
    console.log(
        `User ${username} retrieved assignments at page: ${page} and limit: ${limit}.`
    )

    // on renvoie au client (le frontend) la réponse construite un peu plus haut avec les assignments dans data et les informations de pagination dans pagination
    res.json(responsePayload)
})

// on crée une route pour récupérer les informations de l'utilisateur
router.get('/me', async (req, res) => {
    const token = getToken(req) // on récupère le token dans le header de la requête

    const usernameAlreadyExists = await db.users.userExistsByToken(token) // on vérifie que le token existe
    if (!usernameAlreadyExists) {
        // si le token n'existe pas
        const errorMessage = `User is not authenticated.`
        console.log(errorMessage)
        return res.status(401).json({ message: errorMessage })
    }
    const user = await db.users.findUserByToken(token) // on récupère les informations de l'utilisateur

    res.json(user)
})

// on dit a nos routes d'utiliser a travers un préfix une autre instance d'express router.
router.post('/login', async (req, res) => {
    const { username, password } = req.body // on récupère le username et le password dans le body de la requête

    console.log(`User ${username} login attempt.`)

    const user = await db.users.findUserByUsername(username) // on récupère les informations de l'utilisateur
    const userExists = await db.users.userExistsByUsername(username)

    if (!userExists) {
        // si l'utilisateur n'existe pas
        const errorMessage = `User ${username} not found.`
        console.log(errorMessage)
        return res.status(404).json({ message: errorMessage })
    }

    const passwordMatch = await bcrypt.compare(password, user.password) // on vérifie que le mot de passe correspond
    if (!passwordMatch) {
        // si le mot de passe ne correspond pas
        const errorMessage = `Wrong password for user ${username}.`
        console.log(errorMessage)
        return res.status(401).json({ message: errorMessage })
    }

    console.log(`User ${username} logged in.`)
    console.log(`User ${username} token: ${user.token}`)

    return res.json({
        username: user.username,
        role: user.role,
        token: user.token,
    }) // on renvoie le token au client
})

// route pour créer un assignment
router.post('/create-assignment', async (req, res) => {
    const { nom, auteur, matiere, dateDeRendu, note, rendu, remarque } =
        req.body // on récupère le title, description et rendu dans le body de la requête

    const assignment = await db.assignments.createAssignments(
        // on crée l'assignment
        {
            nom,
            auteur,
            matiere,
            dateDeRendu,
            note,
            rendu,
            remarque,
        }
    )

    console.log(`A user created assignment ${nom}.`)

    res.json(assignment) // on renvoie l'assignment au client
})


module.exports = router
