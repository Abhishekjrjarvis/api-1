const mongoose = require('mongoose')
const User = require('./User')

const userAnnouncementSchema = new mongoose.Schema({
    userAnnTitle: { type: String },
    userAnnPhoto: { type: String },
    userAnnDescription: { type: String },
    userAnnVisibility: { type: String },
    createdAt: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const UserAnnouncement = mongoose.model('UserAnnouncement', userAnnouncementSchema)

module.exports = UserAnnouncement