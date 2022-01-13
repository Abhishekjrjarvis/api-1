const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')

const insAnnouncementSchema = new mongoose.Schema({
    insAnnTitle: { type: String },
    insAnnPhoto: { type: String },
    insAnnDescription: { type: String },
    insAnnVisibility: { type: String },
    createdAt: { type: Date, default: Date.now },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    }
})

const InsAnnouncement = mongoose.model('InsAnnouncement', insAnnouncementSchema)

module.exports = InsAnnouncement