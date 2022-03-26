const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')

const supportSchema = new mongoose.Schema({
    rating: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    queryReply: {
        type: String
    }
})

const InstituteSupport = mongoose.model('InstituteSupport', supportSchema)

module.exports = InstituteSupport