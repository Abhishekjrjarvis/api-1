const mongoose = require('mongoose')

const Subject = require('./Subject')
const InstituteAdmin = require('./InstituteAdmin')

const subjectMasterSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ]
})      

const SubjectMaster = mongoose.model('SubjectMaster', subjectMasterSchema)

module.exports = SubjectMaster