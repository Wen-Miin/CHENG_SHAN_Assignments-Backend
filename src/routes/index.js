const express = require('express')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const db = require('../mongo')

// on crée une instance d'express router
const router = express.Router()

// récupération du token
function getToken(req) {
    return _.replace(req.headers.authorization, 'Bearer ', '')
}

/**
 * WELOME ROUTE
 */
// router pour vérfier si le back marche
router.get('/welcome', async (req, res) => {
    res.json({ message: 'Welcome to the API!' })
    console.log(`OK ça marche`)
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

// on crée une route pour se connecter
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

// route pour récupérer tous les assignments
router.get('/assignments', async (req, res) => {
    // query params à récupérer pour filtrer les assignments dans l'url
    const rendu = req.query.rendu // rendu est un boolean qui permet de filter les assignments rendus ou non
    const nom = req.query.nom // permet de filter les assignments par nom
    const { username } = await db.users.findUserByToken(getToken(req)) // permet de filter les assignments par username

    function getPaginationParams(req) {
        // valeur max entre la query param et une autre valeur pour éviter de renvoyer une page ou un limit négatif
        const page = _.max([_.toNumber(req.query.page || 1), 1])
        const limit = _.max([_.toNumber(req.query.limit || 0), 0])

        return { page, limit }
    }

    // récup les paramettres de pagination de la requête
    const { page, limit } = getPaginationParams(req)

    // on créé un objet de filtre a passer dans mongo
    const filterParams = {
        nom,
        rendu,
        username,
    }

    // on compte le nombre total d'assignments pour l'utilisateur connecé
    const numberOfAssignments = await db.assignments.count(filterParams)

    // on crée une fonction pour calculer le nombre de page
    function getNumberOfPages(numberOfDocuments, limit) {
        // on prend en paramètre le nombre total d'assignments et la limite par page
        // si la limite est égale à 0, on ne veut pas diviser par 0.
        // Si limote = 0 , on définit à 1 pour le nombre de page
        return limit === 0 ? 1 : _.ceil(numberOfDocuments / limit) // on arrondi au nombre supérieur avec ceil
    }

    // on calcule le nombre de page
    const numberOfPages = getNumberOfPages(numberOfAssignments, limit)

    // on récupère tous les assignments avec les filtres
    const assignments = await db.assignments.findAll(filterParams, page, limit)

    // construction de la réponse envoyée au client
    const responsePayload = {
        pagination: { page, limit, numberOfPages, total: numberOfAssignments },
        data: assignments,
    }

    console.log(`${username} retrieved ${numberOfAssignments} assignments.`)

    // on renvoie au client la réponse
    res.json(responsePayload)
})

// route pour créer un assignment
router.post('/create-assignment', async (req, res) => {
    const { username } = await db.users.findUserByToken(getToken(req)) // on récupère le username de l'utilisateur connecté
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

    console.log(`${username} created assignment ${nom}.`)

    res.json(assignment) // on renvoie l'assignment au client
    next() // on passe à la route suivante
})

// route pour modifier un assignment
router.put('/update-assignment/:id', async (req, res) => {
    const token = getToken(req) // on récupère le token dans le header de la requête
    const role = await db.users.findRoleByToken(token) // on récupère les informations de l'utilisateur

    if (role === 'TEACHER' || role === 'ADMIN') {
        // si l'utilisateur est un prof
        const { id } = req.params // on récupère l'id dans les params de la requête

        const { nom, auteur, matiere, dateDeRendu, note, rendu, remarque } =
            req.body // on récupère les données à modifier dans le body de la requête

        const assignment = await db.assignments.updateAssignmentById(
            // on modifie l'assignment
            {
                nom,
                auteur,
                matiere,
                dateDeRendu,
                note,
                rendu,
                remarque,
            },
            id
        )

        console.log(`A user updated assignment ${nom}.`)

        res.json(assignment) // on renvoie l'assignment au client
        next() // on passe à la route suivante
    } else {
        // si l'utilisateur n'est pas un prof
        const errorMessage = `User is not authorized to perform this action.`
        console.log(errorMessage)
        return res.status(401).json({ message: errorMessage })
    }
})

// route pour supprimer un assignment
router.delete('/delete-assignment/:id', async (req, res) => {
    const token = getToken(req) // on récupère le token dans le header de la requête
    const role = await db.users.findRoleByToken(token) // on récupère les informations de l'utilisateur

    if (role === 'TEACHER' || role === 'ADMIN') {
        // si l'utilisateur est un prof

        const { id } = req.params // on récupère l'id dans les params de la requête

        const assignment = await db.assignments.deleteAssignment(id) // on supprime l'assignment

        console.log(`A user deleted assignment ${assignment.nom}.`)
        res.json(assignment) // on renvoie l'assignment au client
        next() // on passe à la route suivante
    } else {
        // si l'utilisateur n'est pas un prof
        const errorMessage = `User is not authorized to perform this action.`
        console.log(errorMessage)
        return res.status(401).json({ message: errorMessage })
    }
})


module.exports = router
