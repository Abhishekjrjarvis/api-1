const mongoose = require('mongoose')


const InstituteAdmin = require('./InstituteAdmin')

const subjectMasterSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
})      

const SubjectMaster = mongoose.model('SubjectMaster', subjectMasterSchema)

module.exports = SubjectMaster