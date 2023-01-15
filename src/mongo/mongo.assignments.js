const schema = require('./schema')

const { Assignments } = schema

// generation de filtres pour assignments
const generateAssignmentsFilters = ({ nom, rendu, username }) => ({
    ...(!!nom && { nom: { $regex: nom } }),
    ...(rendu === 'true' && { rendu: true }),
    ...(rendu === 'false' && { rendu: false }),
    auteur: { $regex: new RegExp(username, 'i') },
})

const paginate = (query, page, limit) => {
    const skip = page * limit - limit
    return query.skip(skip).limit(limit)
}

module.exports = {
    findAll: async (filterParams = {}, page, limit) => {
        return paginate(
            Assignments.find(generateAssignmentsFilters(filterParams)),
            page,
            limit
        )
    },
    findAssignmentsByNom: async (nom) =>
        Assignments.find({ nom: { $regex: new RegExp(nom, 'i') } }),
    findAssignmentById: async (assignmentId) =>
        Assignments.findOne({ _id: assignmentId }),
    count: async (filterParams = {}) => {
        return Assignments.find(
            generateAssignmentsFilters(filterParams)
        ).count()
    },
    createAssignments: async (assignments) => Assignments.create(assignments),
    rendreAssignmentById: async (assignmentId) =>
        Assignments.updateOne(
            { _id: assignmentId },
            {
                $set: { rendu: true },
            }
        ),
    deleteAllAssignments: async () => Assignments.deleteMany({}),
    deleteAssignment: async (assignmentId) =>
        Assignments.deleteOne({ _id: assignmentId }),
    updateAssignmentById: async (assignmentId, assignment) =>
        Assignments.updateOne({ _id: assignmentId }, assignment),
}
