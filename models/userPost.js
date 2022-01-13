const mongoose = require('mongoose')
const User = require('./User')
const InstituteAdmin = require('./InstituteAdmin')
const UserComment = require('./UserComment')

const postSchema = new mongoose.Schema({
    userCreateInsPost: {
        type: String
    },
    userCreateImage: {
        type :String
    },
    userCreateVideo: {
        type :String
    },
    usercaption: {
        type: String
    },
    userLocation: {
        type: String
    },
    userPostStatus: {
        type: String
    },
    userlike: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    userlikeIns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userComment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserComment'
        }
    ]
})

const UserPost = mongoose.model('UserPost', postSchema)

module.exports = UserPost