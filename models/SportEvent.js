const mongoose = require('mongoose')
const Sport = require('./Sport')
const SportEventMatch = require('./SportEventMatch')

const sportEventSchema = new mongoose.Schema({
    sportEventName: { type: String, required: true },
    sportEventCategory: { type: String, required: true },
    sportEventPlace: { type: String, required: true },
    sportEventDate: { type: String, required: true },
    sportEventDescription: { type: String, required: true },
    sportEventProfilePhoto: { type: String },
    sportEventCoverPhoto: { type: String },
    sportDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport'
    },
    sportEventMatch: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SportEventMatch'
        }
    ]
})

sportEventSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await SportEventMatch.deleteMany({
            _id: {
                $in: doc.sportEventMatch
            }
        })
    }
  })


const SportEvent = mongoose.model('SportEvent', sportEventSchema)


module.exports = SportEvent