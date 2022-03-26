const mongoose = require('mongoose')
const User = require('./User')

const feedbackSchema = new mongoose.Schema({
    rating: {
        type: Number
    },
    bestPart: {
        type: String
    },
    worstPart: {
        type: String
    },
    suggestion: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const Feedback = mongoose.model('Feedback', feedbackSchema)


module.exports = Feedback
