const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')
const Comment = require('./Comment')
const User = require('./User')

const postSchema = new mongoose.Schema({
    CreateInsPost: {
        type: String
    },
    CreateImage: {
        type :String
    },
    CreateVideo: {
        type :String
    },
    caption: {
        type: String
    },
    CreateInsLocation: {
        type: String
    },
    CreatePostStatus: {
        type: String
    },
    insLike: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    insUserLike: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    comment:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]

})

const Post = mongoose.model('Post', postSchema)

module.exports = Post