const mongoose = require('mongoose')
const Student = require('./Student')
const Class = require('./Class')

const behaviourSchema = new mongoose.Schema({
    bimprovements: {
        type: String, 
        required: true
    },
    bratings: {
        type: String,
        required: true
    },
    blackIn: {
        type: String, 
        required: true
    },
    studentName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    className: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }
})

const Behaviour = mongoose.model('Behaviour', behaviourSchema)

module.exports = Behaviour