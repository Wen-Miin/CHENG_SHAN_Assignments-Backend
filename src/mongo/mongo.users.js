const schema = require('./schema')

const { Users } = schema

module.exports = {
    findUsers: async () =>
        Users.find({
            role: { $ne: 'ADMIN' }, // recherche tous les users pas admin
        }),
    findStudents: async () =>
        Users.find({
            role: 'STUDENT',
        }),
    findTeachers: async () =>
        Users.find({
            role: 'TEACHER',
        }),
    findUserByUsername: async (username) =>
        Users.findOne(
            { username: { $regex: new RegExp(username, 'i') } }, //filtre sur username
            { username: 1, role: 1, token: 1, _id: 1, password: 1 } // champs à renvoyer
        ),
    userExistsByToken: async (token) => Users.exists({ token }), // renvoie true si le token existe
    adminExists: async () => Users.exists({ username: 'admin' }),
    userExistsByUsername: async (username) =>
        Users.exists({ username: { $regex: new RegExp(username, 'i') } }),
    findUserByToken: async (token) =>
        Users.findOne({ token }, { username: 1, role: 1, token: 1, _id: 1 }),
    updateToken: async (username, token) =>
        Users.updateOne({ username }, { token }),
    createUser: async ({ username, password, token, role }) =>
        Users.create({ username, password, token, role }),
    createUsers: async (users) => Users.create(users),
    findRoleByToken: async (token) => Users.findOne({ token }, { role: 1 }),
    deleteAllUsers: async () =>
        Users.deleteMany({
            role: { $ne: 'ADMIN' }, // supprime tous les users mais garde ceux qui sont admin
        }),
}
