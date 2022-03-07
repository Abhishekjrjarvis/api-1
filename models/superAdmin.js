const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')
const User = require('./User')
const InstituteSupport = require('./InstituteSupport')
const UserSupport = require('./UserSupport')


const superAdminSchema = new mongoose.Schema({
    adminName: { type: String, required: true },
    adminPhoneNumber: { type: Number, required: true },
    adminEmail: { type: String, required: true, unique: true },
    adminPassword: { type: String, required: true, unique: true },
    adminUserName: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    adminDateOfBirth: { type: String },
    adminGender: { type: String },
    adminAddress: { type: String },
    adminBio: { type: String },
    adminCity: { type: String },
    adminState: { type: String },
    adminCountry: { type: String },
    adminAadharCard: { type: String },
    adminStatus: { type: String, default: 'Verified'},
    instituteList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    referals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    ApproveInstitute: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    RejectInstitute: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'InstituteAdmin'
        }
    ],
    ViewInstitute: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    // userSupport: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'UserSupport'
    //     }
    // ],
    // instituteSupport: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'InstituteSupport'
    //     }
    // ]
    
})

const Admin = mongoose.model('Admin', superAdminSchema)
// const InstituteList = mongoose.model('InstituteList', instituteListSchema)

module.exports = Admin