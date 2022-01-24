const mongoose = require('mongoose')


const InstituteAdmin = require('./InstituteAdmin')

const classMasterSchema = new mongoose.Schema({
    className: { type: String, required: true },
    classTitle: { type: String, required: true },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    classDivision: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ]
})      

const ClassMaster = mongoose.model('ClassMaster', classMasterSchema)

module.exports = ClassMaster