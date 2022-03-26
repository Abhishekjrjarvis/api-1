const mongoose = require('mongoose')
const Student = require('./Student')
const SportClass = require('./SportClass')
const SportEventMatch = require('./SportEventMatch')

const sportTeamSchema = new mongoose.Schema({
    sportClassTeamName: {
        type: String,
        required: true
    },
    sportTeamStudent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    sportClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportClass'
    },
    sportEventMatch: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SportEventMatch'
        }
    ],
    rankTitle: {
        type: String
    },
    teamPoints: {
        type: Number,
        default: 0
    }
})

const SportTeam = mongoose.model('SportTeam', sportTeamSchema)

module.exports = SportTeam