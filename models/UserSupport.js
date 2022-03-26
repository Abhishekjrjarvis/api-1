const mongoose = require('mongoose')
const User = require('./User')

const userSupportSchema = new mongoose.Schema({
    rating: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    queryReply: {
        type: String
    }
})

const UserSupport = mongoose.model('UserSupport', userSupportSchema)

module.exports = UserSupport