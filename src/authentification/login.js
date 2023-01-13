const db = resquire('../mongo')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { jwtSecretKey } = require('../config')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

// on définit le nombre de tours pour le hashage du mot de passe => plus le nombre de tours est élevé, plus le hashage est sécurisé
const saltRounds = 10

// on créer une instance d'express router
const router = express.Router()

// on génère un hash du mot de passe
async function generateHashPassword(password) {
    await bcrypt.hash(password, salt)
}

// génération d'un token avec le username et la clé secrète
function generateToken(username) {
    return jwt.sign({ username }, jwtSecretKey)
}

// récupération du token
function getToken(req) {
    return _.replace(req.headers.authorization, 'Bearer ', '')
}

// génération d'un token avec le username et la clé secrète et le role
function generateTokenWithRole(username, role) {
    jwt.sign({ username, role }, jwtSecretKey)
}

// vérification du token
async function VerifyToken(token) {
    // on vérifie que le token existe
    if (!token)
        return res
            .status(401)
            .send({ auth: false, message: 'No token provided.' })

    // on vérifie que le token est valide
    await jwt.verify(token, jwtSecretKey, function (err, decoded) {
        if (err)
            return res
                .status(500)
                .send({ auth: false, message: 'Failed to authenticate token.' })
        res.status(200).send(decoded)
    })
}

// on dit a nos routes d'utiliser a travers un préfix une autre instance d'express router.
router.post('/login', async (req, res) => {
    const { username, password } = req.body // on récupère le username et le password dans le body de la requête

    console.log(`User ${username} login attempt.`)

    const user = await db.users.findUserByUsername(username) // on récupère les informations de l'utilisateur

    if (!userExistsByToken(getToken(req))) {
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

    const token = generateToken(username) // on génère un token

    await db.users.updateUserToken(username, token) // on met a jour le token de l'utilisateur
    console.log(`User ${username} logged in.`)
    console.log(`User ${username} token: ${token}`)
    return res.json({ token }) // on renvoie le token au client
})
