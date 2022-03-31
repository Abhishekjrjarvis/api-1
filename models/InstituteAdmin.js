const mongoose = require("mongoose");
const Department = require("./Department");
const Post = require("./Post");
const InsAnnouncement = require("./InsAnnouncement");
const Staff = require("./Staff");
const User = require("./User");
const Class = require("./Class");
const Student = require("./Student");
const UserPost = require("./userPost");
const Finance = require('./Finance')
const Sport = require('./Sport')
const SportClass = require('./SportClass')
const Leave = require('./Leave')
const Transfer = require('./Transfer')
const Complaint = require('./Complaint')
const InstituteSupport = require('./InstituteSupport')
const GroupConversation = require('./GroupConversation')
const Batch = require('./Batch')
const Field = require('./Field')
const ELearning = require("./ELearning");
const Library = require("./Library");
const AdmissionAdmin = require('./AdmissionAdmin')




const instituteAdminSchema = new mongoose.Schema({
  insName: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  insEmail: { type: String, required: true, unique: true },
  insPhoneNumber: { type: Number, required: true, maxlength: 10 },
  insState: { type: String, required: true },
  insDistrict: { type: String, required: true },
  insPincode: { type: Number, required: true },
  insAddress: { type: String },
  insAbout: { type: String },
  insMode: { type: String, required: true },
  insDocument: { type: String },
  insPassword: { type: String },
  insType: { type: String, required: true },
  status: { type: String, default: "Not Approved" },
  insProfilePassword: { type: String },
  insOperatingAdmin: { type: String },
  insStudentPresident: { type: String },
  insPrinciple: { type: String },
  insTrusty: { type: String },
  insAdminClerk: { type: String },
  insEstdDate: { type: Date },
  // insRegNumber: { type: Number, required: true, unique: true },
  insAchievement: { type: String },
  insAffiliated: { type: String },
  // referalPercentage: { type: String },
  rejectReason: { type: String },
  insEditableText: { type: String },
  insEditableTexts: { type: String },
  referalStatus: { type: String, default: "Pending" },
  insProfilePhoto: { type: String },
  insProfileCoverPhoto: { type: String },
  photoId: { type: String },
  coverId: { type: String },
  createdAt: { type: Date, default: Date.now },
  staffJoinCode: { type: String },
  bankAccountHolderName: { type: String },
  bankAccountNumber: { type: String, },
  bankIfscCode: { type: String },
  bankAccountPhoneNumber: { type: String },
  insFreeLastDate: { type: String },
  insPaymentLastDate: { type: String },
  referalPercentage: { type: Number, default: 0 },
  insFreeCredit: { type: Number, default: 0 },
  transferCredit: { type: Number, default: 0},
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  ApproveStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  depart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  userFollowersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  classRooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  saveInsPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  saveUserPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPost",
    },
  ],
  financeDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Finance'
    }
  ],
  sportDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport'
    }
  ],
  sportClassDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SportClass'
    }
  ],
  addInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstituteAdmin'
    }
  ],
  addInstituteUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave'
    }
  ],
  transfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    }
  ],
  studentComplaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint'
    }
  ],
  groupConversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupConversation'
  },
  idCardBatch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    }
  ],
  idCardField: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Field'
    }
  ],
  AllInstituteReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstituteAdmin'
    }
  ],
  AllUserReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  instituteReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstituteAdmin'
    }
  ],
  userReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  supportIns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstituteSupport'
    }
  ],
  insBankBalance: {
    type: Number,
    default: 0
  },
  insEContentBalance: {
    type: Number,
    default: 0
  },
  insCreditBalance: {
    type: Number,
    default: 0
  },
  insApplicationBalance: {
    type: Number,
    default: 0
  },
  insAdmissionBalance: {
    type: Number,
    default: 0
  },
  elearningActivate: { type: String, default: "Not Activated" },
  elearning: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ELearning",
  },
  libraryActivate: { type: String, default: "Not Activated" },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  insAdmissionAdminStatus: { type: String, default: "Not Alloted" },
  insAdmissionAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdmissionAdmin"
  },
});


instituteAdminSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
      await Post.deleteMany({
          _id: {
              $in: doc.posts
          }
      })
  }
})

const InstituteAdmin = mongoose.model("InstituteAdmin", instituteAdminSchema);

module.exports = InstituteAdmin;
