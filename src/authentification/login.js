const db = resquire('../mongo')
const bcrypt = require('bcryptjs')
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
    return await bcrypt.hash(password, saltRounds)
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
        return res.status(200).send(decoded)
    })
}



