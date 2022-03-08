// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
// const bcrypt = require('bcrypt')
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const { isApproved, isLoggedIn } = require("./middleware");
const data = require("./Verify.js");
const client = require("twilio")(data.ACCOUNTSID, data.AUTHTOKEN);
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");

const Admin = require("./models/superAdmin");
const InstituteAdmin = require("./models/InstituteAdmin");
const InsAnnouncement = require("./models/InsAnnouncement");
const User = require("./models/User");
const Post = require("./models/Post");
const UserPost = require("./models/userPost");
const Staff = require("./models/Staff");
const Comment = require("./models/Comment");
const UserComment = require("./models/UserComment");
const Department = require("./models/Department");
const Batch = require("./models/Batch");
const Class = require("./models/Class");
const Subject = require("./models/Subject");
const Student = require("./models/Student");
const Checklist = require("./models/Checklist");
const Fees = require("./models/Fees");
const Behaviour = require("./models/Behaviour");
const Attendence = require("./models/Attendence");
const AttendenceDate = require("./models/AttendenceDate");
const StaffAttendence = require("./models/StaffAttendence");
const StaffAttendenceDate = require("./models/StaffAttendenceDate");
const UserAnnouncement = require("./models/UserAnnouncement");
const SubjectMaster = require("./models/SubjectMaster");
const ClassMaster = require("./models/ClassMaster");
const Exam = require("./models/Exam");
const UserSupport = require("./models/UserSupport");
const InstituteSupport = require("./models/InstituteSupport");
const Conversation = require("./models/Conversation");
const Holiday = require("./models/Holiday");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Role = require("./models/Role");
const { uploadFile, getFileStream } = require("./S3Configuration");
// const dburl = process.env.DB_URL
// ||

const dburl =
  "mongodb+srv://new-user-web-app:6o2iZ1OFMybEtVDK@cluster0.sdhjn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// const dburl = "mongodb://localhost:27017/Erp_app";
// const dburl = "mongodb://localhost:27017/Erp_test01";

mongoose
  .connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log("Database Successfully Connected...");
  })
  .catch((e) => {
    console.log("Something Went Wrong...", e);
  });

app.set("view engine", "ejs");
app.set("/views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://107.20.124.171:3000",
    // origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

const secret = "Thisismysecret";
// `${process.env.SECRET}` ||

const store = new MongoStore({
  mongoUrl: dburl,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("some", e);
});

app.use(cookieParser());
app.use(
  session({
    name: "SessionID",
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: true,
      // expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: Date.now() + 30 * 86400 * 1000,
    },
  })
);

app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

// Super Admin Routes

app.get("/", async (req, res) => {
  const admins = await Admin.find({});
  res.send(admins);
});

app.get("/super-admin", (req, res) => {
  res.render("SuperAdmin");
});

// Super Admin Creation
app.post("/super-admin", async (req, res) => {
  const {
    adminPhoneNumber,
    adminEmail,
    adminPassword,
    adminUserName,
    adminName,
    adminGender,
    adminDateOfBirth,
    adminCity,
    adminBio,
    adminState,
    adminCountry,
    adminAddress,
    adminAadharCard,
  } = req.body;
  const genPassword = await bcrypt.genSaltSync(12);
  const hashPassword = await bcrypt.hashSync(adminPassword, genPassword);
  const institute = await InstituteAdmin.find({});
  const admin = await new Admin({
    adminPhoneNumber: adminPhoneNumber,
    adminEmail: adminEmail,
    adminPassword: hashPassword,
    adminName: adminName,
    adminGender: adminGender,
    adminDateOfBirth: adminDateOfBirth,
    adminCity: adminCity,
    adminState: adminState,
    adminCountry: adminCountry,
    adminBio: adminBio,
    adminAddress: adminAddress,
    adminAadharCard: adminAadharCard,
    adminUserName: adminUserName,
  });
  await admin.save();
  res.redirect("/");
});

// Get Super Admin Data

app.get("/admindashboard/:id", async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findById({ _id: id })
    .populate("ApproveInstitute")
    .populate("RejectInstitute")
    .populate("instituteList")
    .populate("users")
    .populate("blockedUsers");
  res.status(200).send({ message: "Admin Detail", admin });
});

// Get All User for Institute Referals

app.get("/all/user/referal", async (req, res) => {
  const user = await User.find({});
  res.status(200).send({ message: "User Referal Data", user });
});

// Institute Approval By Super Admin

app.post("/admin/:aid/approve/ins/:id", isLoggedIn, async (req, res) => {
  const { aid, id } = req.params;
  const { referalPercentage, userID, status } = req.body;
  const admin = await Admin.findById({ _id: aid });
  const institute = await InstituteAdmin.findById({ _id: id });
  const user = await User.findById({ _id: userID });
  admin.ApproveInstitute.push(institute);
  admin.instituteList.splice(id, 1);
  admin.referals.push(user);
  institute.status = status;
  user.InstituteReferals.push(institute);
  institute.referalPercentage = referalPercentage;
  await admin.save();
  await user.save();
  await institute.save();
  res.status(200).send({
    message: `Congrats for Approval ${institute.insName}`,
    admin,
    institute,
  });
});

// Reject Institute By Super Admin

app.post("/admin/:aid/reject/ins/:id", isLoggedIn, async (req, res) => {
  const { aid, id } = req.params;
  const { rejectReason, status } = req.body;
  const admin = await Admin.findById({ _id: aid });
  const institute = await InstituteAdmin.findById({ _id: id });
  admin.RejectInstitute.push(institute);
  admin.instituteList.splice(id, 1);
  institute.status = status;
  institute.rejectReason = rejectReason;
  await admin.save();
  await institute.save();
  res.status(200).send({
    message: `Application Rejected ${institute.insName}`,
    admin,
    institute,
  });
});

// Institute Admin Routes

// Institute Creation
//for global user admin "6227047f2d99f21315b47edb"
//for local my system "61fd7c329926f9f010d96809"
app.post("/ins-register", async (req, res) => {
  const admins = await Admin.findById({ _id: "6227047f2d99f21315b47edb" });
  const existInstitute = await InstituteAdmin.findOne({ name: req.body.name });
  const existAdmin = await Admin.findOne({ adminUserName: req.body.name });
  const existUser = await User.findOne({ username: req.body.name });
  if (existAdmin) {
    res.status(200).send({ message: "Username already exists" });
  } else if (existUser) {
    res.status(200).send({ message: "Username already exists" });
  } else {
    if (existInstitute) {
      res.send({ message: "Institute Existing with this Username" });
    } else {
      const institute = await new InstituteAdmin({ ...req.body });
      institute.photoId = "1";
      institute.coverId = "2";
      admins.instituteList.push(institute);
      await admins.save();
      await institute.save();
      res.send({ message: "Institute", institute });
    }
  }
});

app.get("/ins-register/doc/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

//======================================================================//
// app.get("/ins-register/doc/:key", upload.single("file"), async (req, res) => {
//   const key = req.params.key;
//   const readStream = getFileStream(key);
//   readStream.pipe(res);
// });
//=====================================================================//
app.post("/ins-register/doc/:id", upload.single("file"), async (req, res) => {
  const id = req.params.id;
  const file = req.file;
  const results = await uploadFile(file);
  const institute = await InstituteAdmin.findById({ _id: id });
  institute.insDocument = results.key;
  await institute.save();
  await unlinkFile(file.path);

  res.status(200).send({ message: "Uploaded" });
});

// Create Institute Password
app.post("/create-password/:id", async (req, res) => {
  const { id } = req.params;
  const { insPassword, insRePassword } = req.body;
  const institute = await InstituteAdmin.findById({ _id: id });
  const genPass = await bcrypt.genSaltSync(12);
  const hashPass = await bcrypt.hashSync(insPassword, genPass);
  if (insPassword === insRePassword) {
    institute.insPassword = hashPass;
    await institute.save();
    req.session.institute = institute;
    res
      .status(200)
      .send({ message: "Password successfully created...", institute });
  } else {
    res.send({ message: "Invalid Combination" });
  }
});

// Get Login Credentials of Super Admin & Institute Admin & User

app.get("/ins-login", (req, res) => {
  if (req.session.institute || req.session.user || req.session.admin) {
    res.send({
      loggedIn: true,
      User: req.session.institute || req.session.user || req.session.admin,
    });
  } else {
    res.send({ loggedIn: false });
  }
});

// Login Route
app.post("/ins-login", async (req, res) => {
  const { insUserName, insPassword } = req.body;
  const institute = await InstituteAdmin.findOne({ name: `${insUserName}` });
  const user = await User.findOne({ username: `${insUserName}` });
  const admin = await Admin.findOne({ adminUserName: `${insUserName}` });
  if (institute) {
    const checkPass = await bcrypt.compareSync(
      insPassword,
      institute.insPassword
    );
    if (checkPass) {
      req.session.institute = institute;
      res
        .status(200)
        .send({ message: "Successfully LoggedIn as a Institute", institute });
    } else {
      res.send({ message: "Invalid Credentials" });
    }
  } else if (admin) {
    const checkAdminPass = await bcrypt.compareSync(
      insPassword,
      admin.adminPassword
    );
    if (checkAdminPass) {
      req.session.admin = admin;
      res
        .status(200)
        .send({ message: "Successfully LoggedIn as a Super Admin", admin });
    } else {
      res.send({ message: "Invalid Credentials" });
    }
  } else {
    if (user) {
      const checkUserPass = await bcrypt.compareSync(
        insPassword,
        user.userPassword
      );
      if (checkUserPass) {
        req.session.user = user;
        res
          .status(200)
          .send({ message: "Successfully LoggedIn as a User", user });
      } else {
        res.send({ message: "Invalid Credentials" });
      }
    } else {
      res.send({ message: "Invalid End User" });
    }
  }
});

// Logout Handler

app.get("/ins-logout", (req, res) => {
  res.clearCookie("SessionID", { path: "/" });
  res.status(200).send({ message: "Successfully Logout" });
});

// Get All Data From Institute Collections

app.get("/insdashboard", async (req, res) => {
  const institute = await InstituteAdmin.find({});
  res.status(200).send({ message: "All Institute List", institute });
});

app.get("/insdashboard/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({
        path: "posts",
        populate: {
          path: "comment",
          populate: {
            path: "institutes",
          },
        },
      })
      .populate("staff")
      .populate({
        path: "ApproveStaff",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "depart",
        populate: {
          path: "dHead",
        },
      })
      .populate("followers")
      .populate("following")
      .populate("classRooms")
      .populate("student")
      .populate("ApproveStudent")
      .populate({
        path: "saveInsPost",
        populate: {
          path: "institute",
        },
      })
      .populate({
        path: "posts",
        populate: {
          path: "insLike",
        },
      })
      .populate("userFollowersList")
      .populate({
        path: "posts",
        populate: {
          path: "insUserLike",
        },
      })
      .populate("announcement")
      .populate({
        path: "posts",
        populate: {
          path: "comment",
          populate: {
            path: "instituteUser",
          },
        },
      })
      .populate({
        path: "supportIns",
        populate: {
          path: "institute",
        },
      });
    res.status(200).send({ message: "Your Institute", institute });
  } catch {
    console.log("Somthing went wrongs");
  }
});

// All Post From Institute

app.get("/insdashboard/:id/ins-post", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  res.render("post", { institute });
});

// Institute Post Route
app.post(
  "/insdashboard/:id/ins-post",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = new Post({ ...req.body });
    post.imageId = "1";
    institute.posts.push(post);
    post.institute = institute._id;
    await institute.save();
    await post.save();
    res.status(200).send({ message: "Your Institute", institute });
  }
);

app.post(
  "/insdashboard/:id/ins-post/image",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadFile(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = new Post({ ...req.body });
    post.imageId = "0";
    post.CreateImage = results.key;
    institute.posts.push(post);
    post.institute = institute._id;
    await institute.save();
    await post.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Your Institute", institute });
  }
);

app.get("/insdashboard/ins-post/images/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

// app.post("/insdashboard/:id/ins-post/image/",upload.single("file"),
// async (req, res) => {
//   const id = req.params.id;
//   const file = req.file;
//   const results = await uploadFile(file);
//   const institute = await InstituteAdmin.findById({ _id: id });
//   institute.staffProfilePhoto = results.key;
//   await institute.save();
//   await unlinkFile(file.path);
//   res.status(200).send({ message: "Uploaded" });
// } );

app.post("/ins/:id/support", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const support = await new InstituteSupport({ ...req.body });
  institute.supportIns.push(support);
  support.institute = institute;
  await institute.save();
  await support.save();
  res.status(200).send({ message: "Successfully Updated", institute });
});

app.get("/all/ins/support", async (req, res) => {
  const support = await InstituteSupport.find({}).populate({
    path: "institute",
  });
  res.status(200).send({ message: "all institute support data", support });
});

app.get("/all/user/support", async (req, res) => {
  const userSupport = await UserSupport.find({}).populate({
    path: "user",
  });
  res
    .status(200)
    .send({ message: "all institute userSupport data", userSupport });
});

app.post("/user/:id/support/:sid/reply", async (req, res) => {
  const { id, sid } = req.params;
  const { queryReply } = req.body;
  const reply = await UserSupport.findById({ _id: sid });
  reply.queryReply = queryReply;
  await reply.save();
  res.status(200).send({ message: "reply", reply });
});

app.post("/ins/:id/support/:sid/reply", async (req, res) => {
  const { id, sid } = req.params;
  const { queryReply } = req.body;
  const reply = await InstituteSupport.findById({ _id: sid });
  reply.queryReply = queryReply;
  await reply.save();
  res.status(200).send({ message: "reply", reply });
});

// Institute Display Data
app.post("/insprofiledisplay/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  // try{
  const institute = await InstituteAdmin.findById({ _id: id });
  institute.insOperatingAdmin = req.body.insOperatingAdmin;
  institute.insPrinciple = req.body.insPrinciple;
  institute.insStudentPresident = req.body.insStudentPresident;
  institute.insTrusty = req.body.insTrusty;
  institute.insAdminClerk = req.body.insAdminClerk;
  await institute.save();
  res
    .status(200)
    .send({ message: "Institute Profile Display Updated", institute });
  // }
  // catch{
  //     res.status(200).send({ message: 'Something Went Wrong'})
  // }
});

app.get("/allstaff", async (req, res) => {
  const staff = await Staff.find({});
  res.status(200).send({ message: "staff data", staff });
});

// Institute Profile About Data
////////////////////////////////////

app.post("/insprofileabout/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  institute.insEstdDate = req.body.insEstdDate;
  institute.insAffiliated = req.body.insAffiliated;
  institute.insAchievement = req.body.insAchievement;
  institute.insEditableText = req.body.insEditableText;
  institute.insEditableTexts = req.body.insEditableTexts;
  await institute.save();
  res
    .status(200)
    .send({ message: "Institute Profile About Updated", institute });
});
app.get("/insprofileabout/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post(
  "/insprofileabout/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadFile(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insProfilePhoto = results.key;
    institute.photoId = "0";

    await institute.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Successfully photo change" });
  }
);

app.get("/insprofileabout/coverphoto/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post(
  "/insprofileabout/coverphoto/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadFile(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insProfileCoverPhoto = results.key;
    institute.coverId = "0";
    await institute.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Successfully cover photo change" });
  }
);
//////////////////////////////////////////////
// Institute Announcements Data
app.post("/ins-announcement/:id", isLoggedIn, isApproved, async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const announcements = await new InsAnnouncement({ ...req.body });
  institute.announcement.push(announcements);
  announcements.institute = institute;
  await institute.save();
  await announcements.save();
  res.status(200).send({ message: "Successfully Created" });
});

// Institute Announcement Details
app.get("/ins-announcement-detail/:id", async (req, res) => {
  const { id } = req.params;
  const announcement = await InsAnnouncement.findById({ _id: id }).populate(
    "institute"
  );
  res.status(200).send({ message: "Announcement Detail", announcement });
});

// Institute Data Departments
app.get("/insdashboard/:id/ins-department", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  res.render("Department", { institute });
});

app.post("/ins/:id/student/certificate", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { sid, studentReason, studentCertificateDate } = req.body;
  const student = await Student.findById({ _id: sid });
  student.studentReason = studentReason;
  student.studentCertificateDate = studentCertificateDate;
  await student.save();
  res.status(200).send({ message: "student certificate ready", student });
});

app.post(
  "/ins/:id/student/leaving/certificate",
  isLoggedIn,
  async (req, res) => {
    const {
      sid,
      studentLeavingInsDate,
      studentLeavingStudy,
      studentLeavingRemark,
      studentLeavingBehaviour,
      studentLeavingReason,
      studentBookNo,
      studentCertificateNo,
    } = req.body;
    const student = await Student.findById({ _id: sid });
    student.studentLeavingReason = studentLeavingReason;
    student.studentLeavingInsDate = studentLeavingInsDate;
    student.studentLeavingStudy = studentLeavingStudy;
    student.studentLeavingBehaviour = studentLeavingBehaviour;
    student.studentLeavingRemark = studentLeavingRemark;
    student.studentBookNo = studentBookNo;
    student.studentCertificateNo = studentCertificateNo;
    await student.save();
    res
      .status(200)
      .send({ message: "student leaving certificate ready", student });
  }
);

// Search Institute For Follow

app.post("/search/ins-dashboard", isLoggedIn, async (req, res) => {
  let name = req.body.insSearch.trim();
  // try{
  const institute = await InstituteAdmin.findOne({ insName: name });
  res.status(200).send({ message: "Search Institute", institute });
  // }
  // catch{
  //     res.status(400).send({ message: "Bad Request"})
  // }
});

// Institute Staff Joining

app.post("/search/:uid/insdashboard/data/:id", isLoggedIn, async (req, res) => {
  const { uid, id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const user = await User.findById({ _id: uid });
  const staffData = await new Staff({ ...req.body });
  institute.staff.push(staffData);
  user.staff.push(staffData);
  staffData.institute = institute;
  staffData.user = user;
  await institute.save();
  await user.save();
  await staffData.save();
  res.status(200).send({ message: "staff code", institute, user, staffData });
});

// Institute Staff Joining Form Details
app.post(
  "/search/insdashboard/staffdata/:sid",
  isLoggedIn,
  async (req, res) => {
    const { sid } = req.params;
    const staff = await Staff.findById({ _id: sid });
    staff.staffFirstName = req.body.staffFirstName;
    staff.staffMiddleName = req.body.staffMiddleName;
    staff.staffLastName = req.body.staffLastName;
    staff.staffDOB = req.body.staffDOB;
    staff.staffGender = req.body.staffGender;
    staff.staffNationality = req.body.staffNationality;
    staff.staffMTongue = req.body.staffMTongue;
    staff.staffCast = req.body.staffCast;
    staff.staffCastCategory = req.body.staffCastCategory;
    staff.staffReligion = req.body.staffReligion;
    staff.staffBirthPlace = req.body.staffBirthPlace;
    staff.staffDistrict = req.body.staffDistrict;
    staff.staffState = req.body.staffState;
    staff.staffAddress = req.body.staffAddress;
    staff.staffPhoneNumber = req.body.staffPhoneNumber;
    staff.staffAadharNumber = req.body.staffAadharNumber;
    staff.staffQualification = req.body.staffQualification;
    staff.staffDocuments = req.body.staffDocuments;
    staff.staffAadharCard = req.body.staffAadharCard;
    staff.photoId = "1";
    await staff.save();
    res.status(200).send({ message: "Staff Info", staff });
  }
);

app.get("/search/insdashboard/staffdata/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post(
  "/search/insdashboard/staffdata/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadFile(file);
    const staff = await Staff.findById({ _id: sid });
    staff.staffProfilePhoto = results.key;
    staff.photoId = "0";
    await staff.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);

app.post(
  "/search/insdashboard/staffdata/doc/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadFile(file);
    const staff = await Staff.findById({ _id: sid });
    staff.staffDocuments = results.key;
    await staff.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);
app.post(
  "/search/insdashboard/staffdata/adh/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadFile(file);
    const staff = await Staff.findById({ _id: sid });
    staff.staffAadharCard = results.key;
    await staff.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);
// Institute Post For Like
app.post("/post/like", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById({ _id: postId });
  const institute_session = req.session.institute;
  const user_session = req.session.user;
  if (institute_session) {
    if (
      post.insLike.length >= 1 &&
      post.insLike.includes(String(institute_session._id))
    ) {
    } else {
      post.insLike.push(institute_session._id);
      await post.save();
      res.status(200).send({ message: "Added To Likes", post });
    }
  } else if (user_session) {
    if (
      post.insUserLike.length >= 1 &&
      post.insUserLike.includes(String(user_session._id))
    ) {
    } else {
      post.insUserLike.push(user_session._id);
      console.log(post.insUserLike);
      await post.save();
      res.status(200).send({ message: "Added To Likes", post });
    }
  } else {
  }
});

app.post("/ins/save/post", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById({ _id: postId });
  const institute_session = req.session.institute;
  const user_session = req.session.user;
  if (institute_session) {
    const institute = await InstituteAdmin.findById({
      _id: institute_session._id,
    });
    institute.saveInsPost.push(post);
    await institute.save();
    res.status(200).send({ message: "Added To Favourites", institute });
  } else if (user_session) {
    const user = await User.findById({ _id: user_session._id });
    user.saveUserInsPost.push(post);
    await user.save();
    res.status(200).send({ message: "Added To Favourites", user });
  } else {
  }
});

app.post("/post/unlike", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById({ _id: postId });
  const institute_session = req.session.institute;
  const user_session = req.session.user;
  if (institute_session) {
    post.insLike.splice(institute_session._id, 1);
    await post.save();
    res.status(200).send({ message: "Removed from Likes", post });
  } else if (user_session) {
    post.insUserLike.splice(user_session._id, 1);
    await post.save();
    res.status(200).send({ message: "Removed from Likes", post });
  } else {
  }
});

// Institute Post For Comments

app.post("/post/comments/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById({ _id: id });
  const comment = await new Comment({ ...req.body });
  if (req.session.institute) {
    comment.institutes = req.session.institute;
  } else {
    comment.instituteUser = req.session.user;
  }
  post.comment.push(comment);
  comment.post = post;
  await post.save();
  await comment.save();
  res.status(200).send({ message: "Successfully Commented", post });
});

// Institute For Staff Approval

app.post("/ins/:id/staff/approve/:sid", isLoggedIn, async (req, res) => {
  const { id, sid } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const staffs = await Staff.findById({ _id: sid });
  staffs.staffStatus = req.body.status;
  institute.ApproveStaff.push(staffs);
  institute.staff.splice(sid, 1);
  staffs.staffROLLNO = institute.ApproveStaff.length;
  await institute.save();
  await staffs.save();
  res.status(200).send({
    message: `Welcome To The Institute ${staffs.staffFirstName} ${staffs.staffLastName}`,
    institute,
  });
});

app.post("/ins/:id/staff/reject/:sid", isLoggedIn, async (req, res) => {
  const { id, sid } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const staffs = await Staff.findById({ _id: sid });
  staffs.staffStatus = req.body.status;
  // institute.ApproveStaff.push(staffs)
  institute.staff.splice(sid, 1);
  await institute.save();
  await staffs.save();
  res.status(200).send({
    message: `Application Rejected ${staffs.staffFirstName} ${staffs.staffLastName}`,
    institute,
  });
});

// Institute Department Creation

app.post(
  "/ins/:id/new-department",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    const { id } = req.params;
    const { sid } = req.body;
    const staff = await Staff.findById({ _id: sid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const department = await new Department({ ...req.body });
    institute.depart.push(department);
    department.institute = institute;
    staff.staffDepartment.push(department);
    department.dHead = staff;
    await institute.save();
    await staff.save();
    await department.save();
    res.status(200).send({
      message: "Successfully Created Department",
      department,
      staff,
      institute,
    });
  }
);

// Institute Search for follow Institute Profile

app.post("/ins-search-profile", isLoggedIn, async (req, res) => {
  const institute = await InstituteAdmin.findOne({
    insName: req.body.insSearchProfile,
  });
  res.status(200).send({ message: "Search Institute Here", institute });
});

app.post("/ins/staff/code", async (req, res) => {
  const { InsId, code } = req.body;
  const institute = await InstituteAdmin.findById({ _id: InsId });
  institute.staffJoinCode = code;
  await institute.save();
  res.status(200).send({ message: "staff joining code", institute });
});

app.post("/ins/class/code", async (req, res) => {
  const { classId, code } = req.body;
  const classes = await Class.findById({ _id: classId });
  classes.classCode = code;
  await classes.save();
  res.status(200).send({ message: "class joining code", classes });
});

// Institute To Institute Follow Handler

app.put("/follow-ins", async (req, res) => {
  const institutes = await InstituteAdmin.findById({
    _id: req.session.institute._id,
  });
  const sinstitute = await InstituteAdmin.findById({ _id: req.body.followId });

  if (institutes.following.includes(req.body.followId)) {
    res.status(200).send({ message: "You Already Following This Institute" });
  } else {
    sinstitute.followers.push(req.session.institute._id);
    institutes.following.push(req.body.followId);
    await sinstitute.save();
    await institutes.save();
  }
  // }
});

app.put("/unfollow-ins", async (req, res) => {
  const institutes = await InstituteAdmin.findById({
    _id: req.session.institute._id,
  });
  const sinstitute = await InstituteAdmin.findById({ _id: req.body.followId });

  if (institutes.following.includes(req.body.followId)) {
    sinstitute.followers.splice(req.session.institute._id, 1);
    institutes.following.splice(req.body.followId, 1);
    await sinstitute.save();
    await institutes.save();
  } else {
    res.status(200).send({ message: "You Already UnFollow This Institute" });
  }
  // }
});

// Depreceated Currently No Use

// Institute Department Data

app.get("/department/:did", async (req, res) => {
  const { did } = req.params;
  const department = await Department.findById({ _id: did })
    .populate({ path: "dHead" })
    .populate("batches")
    .populate({
      path: "departmentSelectBatch",
      populate: {
        path: "classroom",
        populate: {
          path: "ApproveStudent",
        },
      },
    })
    .populate({
      path: "userBatch",
    });

  res.status(200).send({ message: "Department Data", department });
});

// Institute Batch in Department

app.get("/:id/batchdetail/:bid", isLoggedIn, async (req, res) => {
  const { id, bid } = req.params;
  const { batchDetail } = req.body;
  const department = await Department.findById({ _id: id });
  const batches = await Batch.findById({ _id: bid });
  department.departmentSelectBatch = batches;
  department.userBatch = batches;
  await department.save();
  res.status(200).send({ message: "Batch Detail Data", batches, department });
});

// Institute Batch Class Data

app.get("/batch/class/:bid", async (req, res) => {
  const { bid } = req.params;
  const batch = await Batch.findById({ _id: bid }).populate("classroom");
  res.status(200).send({ message: "Classes Are here", batch });
});

// Institute New Batch Creation

app.post("/addbatch/:did", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const department = await Department.findById({ _id: did });
  const batch = await new Batch({ ...req.body });
  department.batches.push(batch);
  batch.department = department;
  await department.save();
  await batch.save();
  res.status(200).send({ message: "batch data", batch });
});

app.get("/search/insdashboard/staffdata/adh/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.get("/search/insdashboard/studentdata/adh/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

// / Master Class Creator Route
// Get all ClassMaster Data
app.get("/ins/:id/departmentmasterclass/:did", async (req, res) => {
  const { id, did } = req.params;
  const classMaster = await ClassMaster.find({ department: did });
  res.status(200).send({ message: "ClassMaster Are here", classMaster });
});
// Create Master Class Data
app.post(
  "/ins/:id/departmentmasterclass/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    const { id, did } = req.params;
    const { classTitle, className } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const department = await Department.findById({ _id: did });
    const classroomMaster = await new ClassMaster({
      className: className,
      classTitle: classTitle,
      institute: institute._id,
      department: did,
    });
    department.departmentClassMasters.push(classroomMaster);
    await classroomMaster.save();
    await department.save();
    res
      .status(200)
      .send({ message: "Successfully Created MasterClasses", classroomMaster });
  }
);

app.post(
  "/ins/:id/department/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    const { id, did, bid } = req.params;
    const { sid, classTitle, className, classCode, classHeadTitle, mcId } =
      req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const masterClass = await ClassMaster.findById({ _id: mcId });
    const mCName = masterClass.className;
    const batch = await Batch.findById({ _id: bid });
    const staff = await Staff.findById({ _id: sid });
    const depart = await Department.findById({ _id: did }).populate({
      path: "dHead",
    });
    const classRoom = await new Class({
      masterClassName: mcId,
      className: mCName,
      classTitle: classTitle,
      classHeadTitle: classHeadTitle,
      classCode: classCode,
    });
    institute.classRooms.push(classRoom);
    classRoom.institute = institute;
    batch.classroom.push(classRoom);
    masterClass.classDivision.push(classRoom);
    if (String(depart.dHead._id) == String(staff._id)) {
    } else {
      depart.departmentChatGroup.push(staff);
    }
    classRoom.batch = batch;
    batch.batchStaff.push(staff);
    staff.batches = batch;
    staff.staffClass.push(classRoom);
    classRoom.classTeacher = staff;
    await institute.save();
    await batch.save();
    await masterClass.save();
    await staff.save();
    await classRoom.save();
    await depart.save();
    res.status(200).send({
      message: "Successfully Created Class",
      classRoom,
      staff,
      batch,
      institute,
      depart,
    });
  }
);

// Get all Exam Data
app.get("/exam/batch/:did", async (req, res) => {
  const { did } = req.params;
  const exams = await Exam.find({ examForDepartment: did })
    .populate("examForClass")
    .populate("subject");

  res.status(200).send({ message: "All Exam Data", exams });
});

// Get all Exam From Subject
app.get("/exam/subject/:suid", async (req, res) => {
  const { suid } = req.params;
  const subject = await Subject.findById({ _id: suid }).populate({
    path: "subjectExams",
    populate: {
      path: "examForClass",
    },
  });
  const subExamList = subject.subjectExams;
  res.status(200).send({ message: "Subject Exam List", subExamList });
});

// Rought For Complete Subject
app.post("/subject/status/:suid", async (req, res) => {
  const { suid } = req.params;

  const subject = await Subject.findById({ _id: suid });

  subject.subjectStatus = "Locked";
  subject.save();
  res.status(200).send({ message: "Subject Successfully Locked" });
});
// Route For Exam Creation
app.post(
  "/user/:id/department/function/exam/creation/:did/batch/:bid",
  // isLoggedIn,
  async (req, res) => {
    const { id, did, bid } = req.params;
    const { subject, examForClass, examName, examType, examMode, examWeight } =
      req.body;

    const batch = await Batch.findById({ _id: bid });
    const depart = await Department.findById({ _id: did });

    const newExam = await new Exam({
      examName: examName,
      examType: examType,
      examMode: examMode,
      examWeight: examWeight,
      batch: batch._id,
      examForDepartment: depart._id,
      examForClass: [],
      subject: [],
    });

    for (let i = 0; i < examForClass.length; i++) {
      let d = examForClass[i].classId;
      newExam.examForClass.push(d);
    }

    for (let i = 0; i < subject.length; i++) {
      let d = await SubjectMaster.find({ subjectName: subject[i].examSubName });
      let Sub = {
        subMasterId: d[0]._id,
        subjectName: subject[i].examSubName,
        totalMarks: subject[i].examSubTotalMarks,
        examDate: subject[i].examSubDate,
        examTime: subject[i].examSubTime,
        subjectMarksStatus: "Not Updated",
      };
      newExam.subject.push(Sub);
    }

    await newExam.save();
    batch.batchExam.push(newExam);
    await batch.save();
    depart.departmentExam.push(newExam);
    await depart.save();

    // Push Exam In ClassRoom
    let studentList = [];
    let arry = [];
    for (let i = 0; i < newExam.examForClass.length; i++) {
      // Push Exam in ClassRoom
      const classRoomData = await Class.findById({
        _id: newExam.examForClass[i],
      }).populate({
        path: "subject",
        populate: {
          path: "subjectMasterName",
        },
      });

      classRoomData.classExam.push(newExam._id);
      classRoomData.save();

      // For Exam save in Subject
      let exSub = classRoomData.subject;
      let subAre = [];
      for (let j = 0; j < newExam.subject.length; j++) {
        let subjectObj = exSub.filter((e) => {
          return e.subjectName == newExam.subject[j].subjectName;
        });

        for (let k = 0; k < subjectObj.length; k++) {
          let d = subjectObj[k];
          subAre.push(d);
        }
      }
      for (let i = 0; i < subAre.length; i++) {
        arry.push(subAre[i]);
      }
      // find Class room Approve student and Push Exam in each student
      let stud = classRoomData.ApproveStudent;
      for (let i = 0; i < stud.length; i++) {
        let data = stud[i];
        studentList.push(data);
      }
    }
    // Exam Push in Student Model
    for (let i = 0; i < studentList.length; i++) {
      stuData = await Student.findById({ _id: studentList[i] });

      studDataUpdate = {
        examId: newExam._id,
        allSubjectMarksStatus: "Not Updated",
        examWeight: examWeight,
        subjectMarks: newExam.subject,
      };
      stuData.studentMarks.push(studDataUpdate);
      stuData.save();
    }
    // Exam Push in Subject Model
    for (let i = 0; i < arry.length; i++) {
      let subId = arry[i]._id;
      sub = await Subject.findById({ _id: subId });
      sub.subjectExams.push(newExam._id);
      sub.save();
    }
    res.status(200).send({ message: "Successfully Created Exam", newExam });
    // res.status(200).send({ message: "Successfully Created Exam" });
  }
);

// Code Fr Get Subject and class Details
// Code For Get Class Details
app.get("/class-detail/:cid", async (req, res) => {
  const { cid } = req.params;
  const classData = await Class.findById({ _id: cid })
    .populate("ApproveStudent")
    .populate("classExam")
    .populate("attendence")
    .populate("subject")
    .populate("institute")
    .populate("classTeacher")
    .populate("batch");

  res.status(200).send({ message: " Subject & class Data", classData });
});

app.get("/subject-detail/:suid", async (req, res) => {
  const { suid } = req.params;
  const subData = await Subject.findById({ _id: suid }).populate("class");
  let classId = subData.class._id;
  classData = await Class.findById({ _id: classId }).populate("ApproveStudent");
  res
    .status(200)
    .send({ message: " Subject & class Data", subData, classData });
});

app.get("/subject-detail/:suid", async (req, res) => {
  const { suid } = req.params;
  const subData = await Subject.findById({ _id: suid }).populate("class");
  let classId = subData.class._id;
  classData = await Class.findById({ _id: classId }).populate("ApproveStudent");
  res
    .status(200)
    .send({ message: " Subject & class Data", subData, classData });
});

// Marks Submit and Save of Student
app.post("/student/:sid/marks/:eid/:eSubid", async (req, res) => {
  const { sid, eid, eSubid } = req.params;
  const { obtainedMarks } = req.body;

  const student = await Student.findById({ _id: sid });
  const examData = await Exam.findById({ _id: eid });
  const subjectData = await Subject.findById({ _id: eSubid });

  let examListOfStudent = student.studentMarks;

  let exId = {};
  for (let i = 0; i < examListOfStudent.length; i++) {
    if (examListOfStudent[i].examId == eid) {
      exId = examListOfStudent[i];
    }
  }

  function indIndex(arraytosearch, valuetosearch) {
    for (var i = 0; i < arraytosearch.length; i++) {
      if (arraytosearch[i].examId == valuetosearch) {
        return i;
      }
    }
    return null;
  }

  let examIndex = indIndex(examListOfStudent, eid);

  // // Find Exam Subject in List of Exam Subjects
  let examSubList = examListOfStudent[examIndex].subjectMarks;

  function subIndex(arraytosearch, valuetosearch) {
    for (var i = 0; i < arraytosearch.length; i++) {
      if (arraytosearch[i].subjectName == valuetosearch) {
        return i;
      }
    }
    return null;
  }

  let examSubIndex = subIndex(examSubList, subjectData.subjectName);

  student.studentMarks[examIndex].subjectMarks[examSubIndex].obtainMarks =
    obtainedMarks;
  student.studentMarks[examIndex].subjectMarks[
    examSubIndex
  ].subjectMarksStatus = "Updated";
  await student.save();

  // Check Exam Status To be Updated:-

  const studentData2 = await Student.findById({ _id: sid });

  examSubList2 = studentData2.studentMarks[examIndex].subjectMarks;
  subLisLength = examSubList2.length;
  filterExamSubListUpdate = examSubList2.filter((e) => {
    return e.subjectMarksStatus === "Updated";
  });
  filterListLength = filterExamSubListUpdate.length;

  if (subLisLength === filterListLength) {
    studentData2.studentMarks[examIndex].allSubjectMarksStatus = "Updated";
    studentData2.save();
  } else {
    console.log(`All Subject Status of Exam are Not Updated`);
  }

  // Update Final Report Status in Student Profile
  const studentData3 = await Student.findById({ _id: sid });

  examList2 = studentData2.studentMarks;
  exLisLength = examList2.length;
  filterExamSubListUpdate = examList2.filter((e) => {
    return e.allSubjectMarksStatus === "Updated";
  });
  filterListLength2 = filterExamSubListUpdate.length;
  if (exLisLength === filterListLength2) {
    studentData3.studentFinalReportFinalizedStatus = "Ready";
    studentData3.save();
  } else {
  }

  res.status(200).send({ message: "Successfully Marks Save" });
});

app.get("/class/:cid", async (req, res) => {
  const { cid } = req.params;
  const classes = await Class.findById({ _id: cid })
    .populate({ path: "classTeacher" })
    .populate({
      path: "batch",
    })
    .populate("subject");
  res.status(200).send({ message: "create class data", classes });
});

// Institute Subject Creation In Class
app.post(
  "/ins/:id/department/:did/batch/:bid/class/:cid/subject",
  isLoggedIn,
  async (req, res) => {
    const { id, cid, bid, did } = req.params;
    const { sid, subjectTitle, subjectName, msid } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const classes = await Class.findById({ _id: cid }).populate({
      path: "classTeacher",
    });
    const subjectMaster = await SubjectMaster.findById({ _id: msid });
    const batch = await Batch.findById({ _id: bid });
    const staff = await Staff.findById({ _id: sid });
    const depart = await Department.findById({ _id: did }).populate({
      path: "dHead",
    });
    const subject = await new Subject({
      subjectTitle: subjectTitle,
      subjectName: subjectMaster.subjectName,
      subjectMasterName: subjectMaster._id,
    });
    classes.subject.push(subject);
    subjectMaster.subjects.push(subject);
    subject.class = classes;
    if (String(classes.classTeacher._id) == String(staff._id)) {
    } else {
      batch.batchStaff.push(staff);
      staff.batches = batch;
    }
    if (String(depart.dHead._id) == String(staff._id)) {
    } else {
      depart.departmentChatGroup.push(staff);
    }
    staff.staffSubject.push(subject);
    subject.subjectTeacherName = staff;
    await subjectMaster.save();
    await classes.save();
    await batch.save();
    await staff.save();
    await subject.save();
    await depart.save();
    res.status(200).send({
      message: "Successfully Created Subject",
      classes,
      staff,
      subject,
      depart,
    });
  }
);

// Institute Student Joining Procedure

app.post(
  "/search/:uid/insdashboard/data/student/:id",
  isLoggedIn,
  async (req, res) => {
    const { uid, id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: uid });
    const studentData = await new Student({ ...req.body });
    const classes = await Class.findOne({ classCode: req.body.studentCode });
    institute.student.push(studentData);
    studentData.institute = institute;
    user.student.push(studentData);
    studentData.user = user;
    classes.student.push(studentData);
    studentData.studentClass = classes;
    await institute.save();
    await user.save();
    await classes.save();
    await studentData.save();
    res
      .status(200)
      .send({ message: "student code", institute, user, studentData, classes });
  }
);

app.post("/all/account/switch", async (req, res) => {
  const { userPhoneNumber } = req.body;
  const user = await User.find({ userPhoneNumber: userPhoneNumber });
  res.status(200).send({ message: "Switch Account Data", user });
});

app.post("/all/account/switch/user", async (req, res) => {
  const { userPhoneNumber } = req.body;
  const user = await User.find({ userPhoneNumber: userPhoneNumber });
  const institute = await InstituteAdmin.find({
    insPhoneNumber: userPhoneNumber,
  });
  res.status(200).send({ message: "Switch Account Data", user, institute });
});

app.post("/switchUser/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  // req.session.destroy()
  req.session.user = user;
  res.status(200).send({ message: "data", user });
});

app.post("/switchUser/ins/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  const institute = await InstituteAdmin.findOne({ _id: id });
  if (user) {
    req.session.user = user;
    res.status(200).send({ message: "data", user });
  } else if (institute) {
    req.session.institute = institute;
    res.status(200).send({ message: "data", institute });
  } else {
  }
});

// Institute Student Joining Form

app.post(
  "/search/insdashboard/studentdata/:sid",
  isLoggedIn,
  async (req, res) => {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid });
    student.studentFirstName = req.body.studentFirstName;
    student.studentMiddleName = req.body.studentMiddleName;
    student.studentLastName = req.body.studentLastName;
    student.studentDOB = req.body.studentDOB;
    student.studentGender = req.body.studentGender;
    student.studentNationality = req.body.studentNationality;
    student.studentMTongue = req.body.studentMTongue;
    student.studentCast = req.body.studentCast;
    student.studentCastCategory = req.body.studentCastCategory;
    student.studentReligion = req.body.studentReligion;
    student.studentBirthPlace = req.body.studentBirthPlace;
    student.studentDistrict = req.body.studentDistrict;
    student.studentState = req.body.studentState;
    student.studentAddress = req.body.studentAddress;
    student.studentPhoneNumber = req.body.studentPhoneNumber;
    student.studentAadharNumber = req.body.studentAadharNumber;
    student.studentParentsName = req.body.studentParentsName;
    student.studentParentsPhoneNumber = req.body.studentParentsPhoneNumber;
    student.studentDocuments = req.body.studentDocuments;
    student.studentAadharCard = req.body.studentAadharCard;
    student.studentPName = req.body.studentPName;
    student.photoId = "1";
    await student.save();
    res.status(200).send({ message: "Student Info", student });
  }
);
app.get("/search/insdashboard/studentdata/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/search/insdashboard/studentdata/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadFile(file);
    const student = await Student.findById({ _id: sid });
    student.studentProfilePhoto = results.key;
    student.photoId = "0";

    await student.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);

app.post(
  "/search/insdashboard/studentdata/doc/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadFile(file);
    const student = await Student.findById({ _id: sid });
    student.studentDocuments = results.key;
    await student.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);

app.post(
  "/search/insdashboard/studentdata/adh/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadFile(file);
    const student = await Student.findById({ _id: sid });
    student.studentAadharCard = results.key;
    await student.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);

// Institute Student Approval By Class Teacher

app.post("/ins/:id/student/:cid/approve/:sid", isLoggedIn, async (req, res) => {
  const { id, sid, cid } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const student = await Student.findById({ _id: sid });
  const classes = await Class.findById({ _id: cid });
  student.studentStatus = req.body.status;
  institute.ApproveStudent.push(student);
  institute.student.splice(sid, 1);
  classes.ApproveStudent.push(student);
  classes.student.splice(sid, 1);
  student.studentGRNO = classes.ApproveStudent.length;
  await institute.save();
  await classes.save();
  await student.save();
  res.status(200).send({
    message: `Welcome To The Institute ${student.studentFirstName} ${student.studentLastName}`,
    institute,
    classes,
  });
});

app.post("/ins/:id/student/:cid/reject/:sid", isLoggedIn, async (req, res) => {
  const { id, sid, cid } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const student = await Student.findById({ _id: sid });
  const classes = await Class.findById({ _id: cid });
  student.studentStatus = req.body.status;
  institute.student.splice(sid, 1);
  classes.student.splice(sid, 1);
  await institute.save();
  await classes.save();
  await student.save();
  res.status(200).send({
    message: `Application Rejected ${student.studentFirstName} ${student.studentLastName}`,
    institute,
    classes,
  });
});

app.post("/student/report/finilized/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { examList, marksTotal, stBehaviourData, marksGradeStatus } = req.body;
  console.log(marksGradeStatus);
  try {
    const student = await Student.findById({ _id: id });

    const finalreport = {
      finalObtainTotal: marksTotal.finalExToObtain,
      finalMarksTotalTotal: marksTotal.finalExToTo,
      OtherMarksObtainTotal: marksTotal.otherExObtain,
      OtherMarksTotalTotal: marksTotal.otherExToTo,
      FinalObtainMarksTotal: marksTotal.finalToObtain,
      FinalTotalMarksTotal: marksTotal.finalToTo,
      SubjectWiseMarks: [],
    };

    if (marksGradeStatus === false) {
      for (let i = 0; i < examList.length; i++) {
        let finalSubRe = {
          subName: examList[i].subName,
          finalExamObtain: examList[i].finalExamObtainMarks,
          finalExamTotal: examList[i].finalExamTotalMarks,
          otherExamObtain: examList[i].OtherExamTotalObtainMarks,
          otherExamTotal: examList[i].OtherExamTotalMarks,
          finalObtainTotal: examList[i].finalObtainTotal,
          finalTotalTotal: examList[i].finalTotalTotal,
        };
        finalreport.SubjectWiseMarks.push(finalSubRe);
      }
    } else if (marksGradeStatus === true) {
      for (let i = 0; i < examList.length; i++) {
        let finalSubRe = {
          subName: examList[i].subName,
          finalExamObtain: examList[i].finalExamObtainMarks,
          finalExamTotal: examList[i].finalExamTotalMarks,
          otherExamObtain: examList[i].OtherExamTotalObtainMarks,
          otherExamTotal: examList[i].OtherExamTotalMarks,
          finalObtainTotal: examList[i].finalObtainTotal,
        };
        finalreport.SubjectWiseMarks.push(finalSubRe);
      }
    }
    student.studentFinalReportData = finalreport;
    student.studentFinalReportFinalizedStatus = "Finalized";
    await student.save();
    res.status(200).send({ message: "Student Final Report is Ready", student });
  } catch {}
});

// Get Batch Details class and Subject data
app.get("/ins/:id/allclassdata/:did/batch/:bid", async (req, res) => {
  const { id, did, bid } = req.params;
  const batch = await Batch.findById({ _id: bid })
    .populate({
      path: "subjectMasters",
      populate: {
        path: "subjects",
      },
    })
    .populate({
      path: "classroom",
    });
  res.status(200).send({
    message: "Batch Details class and Subject data",
    batch,
  });
});

// get all Master Subject Data

app.get("/ins/:id/departmentmastersubject/:did", async (req, res) => {
  const { id, did } = req.params;
  const subjectMaster = await SubjectMaster.find({ department: did });
  res.status(200).send({ message: "SubjectMaster Are here", subjectMaster });
});

// Create Master Subject data
app.post(
  "/ins/:id/departmentmastersubject/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    const { id, did, bid } = req.params;
    const { subjectName } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const departmentData = await Department.findById({ _id: did });
    const batchData = await Batch.findById({ _id: bid });
    const subjectMaster = await new SubjectMaster({
      subjectName: subjectName,
      institute: institute._id,
      batch: bid,
      department: did,
    });
    await departmentData.departmentSubjectMasters.push(subjectMaster);
    await batchData.subjectMasters.push(subjectMaster);
    await departmentData.save();
    await batchData.save();
    await subjectMaster.save();
    res
      .status(200)
      .send({ message: "Successfully Created Master Subject", subjectMaster });
  }
);

app.get("/:id/roleData/:rid", async (req, res) => {
  const { id, rid } = req.params;
  try {
    const staff = await Staff.findOne({ _id: rid });
    const student = await Student.findOne({ _id: rid });
    if (staff) {
      res.status(200).send({ message: "staff", staff });
    } else if (student) {
      res.status(200).send({ message: "student", student });
    } else {
      res.status(200).send({ message: "error" });
    }
  } catch {
    console.log("something went wrong");
  }
});

// Get all Exam From a Class

app.get("/exam/class/:cid", async (req, res) => {
  const { cid } = req.params;

  const classroom = await Class.findById({ _id: cid }).populate({
    path: "classExam",
  });
  const classExamList = classroom.classExam;

  res.status(200).send({ message: "Classroom Exam List", classExamList });
});

app.get("/exam/:eid", async (req, res) => {
  const { eid } = req.params;
  const exam = await Exam.findById({ _id: eid }).populate({
    path: "examForClass",
  });
  res.status(200).send({ message: " exam data", exam });
});

// Staff Data

app.get("/staff/:id", async (req, res) => {
  const { id } = req.params;
  const staff = await Staff.findById({ _id: id })
    .populate("user")
    .populate("institute");
  res.status(200).send({ message: "Staff Data To Member", staff });
});

app.get("/student/:id", async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById({ _id: id })
    .populate("user")
    .populate("institute");
  res.status(200).send({ message: "Student Data To Member", student });
});

// for finding Staff By Id

app.post("/:id/staffdetaildata", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { staffId } = req.body;
  try {
    const staff = await Staff.findById({ _id: staffId });
    const user = await User.findById({ _id: id });
    const role = await new Role({
      userSelectStaffRole: staff,
    });
    user.role = role;
    await role.save();
    await user.save();
    res.status(200).send({ message: "Staff Detail Data", staff, role });
  } catch {}
});

// Student Detail Data

app.post("/:id/studentdetaildata", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  try {
    const student = await Student.findById({ _id: id });
    const user = await User.findById({ _id: id });
    const role = await new Role({
      userSelectStudentRole: student,
    });
    user.role = role;
    await role.save();
    await user.save();
    res.status(200).send({ message: "Student Detail Data", student });
  } catch {}
});

app.get("/studentdetaildata/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById({ _id: id })
    .populate("studentFee")
    .populate({
      path: "studentMarks",
      populate: {
        path: "subjectMarks",
        populate: {
          path: "subMasterId",
        },
      },
    })
    .populate({
      path: "studentMarks",
      populate: {
        path: "examId",
      },
    })
    .populate("studentClass")
    .populate("attendDate")
    .populate("studentBehaviourStatus");

  const behaviour = await Behaviour.find({ studentName: id });
  res.status(200).send({ message: "Student Detail Data", student, behaviour });
});

// Student Status Updated

app.post("/student/status", isLoggedIn, async (req, res) => {
  const { studentId } = req.body;
  const student = await Student.findById({ _id: studentId }).populate(
    "studentFee"
  );
  res.status(200).send({ message: "Student Detail Data", student });
});

// Staff Designation Data in members tab at User
// Staff Designation Data in members tab at User
app.get("/staffdesignationdata/:sid", isLoggedIn, async (req, res) => {
  const { sid } = req.params;
  const staff = await Staff.findById({ _id: sid })
    .populate("staffDepartment")
    .populate("staffClass")
    .populate({
      path: "staffSubject",
      populate: {
        path: "class",
      },
    })
    .populate({
      path: "institute",
    });
  res.status(200).send({ message: "Staff Designation Data", staff });
});

// Student Designation Data in members Tab at users

app.get("/studentdesignationdata/:sid", async (req, res) => {
  const { sid } = req.params;
  const student = await Student.findById({ _id: sid })
    .populate({
      path: "studentClass",
    })
    .populate({
      path: "institute",
    })
    .populate({
      path: "user",
    })
    .populate("studentFee")
    .populate({
      path: "studentMarks",
      populate: {
        path: "examId",
      },
    })
    .populate("checklist");
  // .populate('studentAttendence')

  res.status(200).send({ message: "Student Designation Data", student });
});

// Staff Department Info

app.get("/staffdepartment/:did", async (req, res) => {
  const { did } = req.params;
  const department = await Department.findById({ _id: did })
    .populate("batches")
    .populate({
      path: "dHead",
    })
    .populate({
      path: "institute",
    })
    .populate("checklists")
    .populate({ path: "userBatch", populate: "classroom" });
  res.status(200).send({ message: "Department Profile Data", department });
});

//Staff Class Info

app.get("/staffclass/:sid", async (req, res) => {
  const { sid } = req.params;
  const classes = await Class.findById({ _id: sid })
    .populate("subject")
    .populate("student")
    .populate("ApproveStudent")
    .populate({
      path: "institute",
    })
    .populate({
      path: "batch",
    })
    .populate({
      path: "classTeacher",
    })
    .populate("checklist")
    .populate("fee");
  res.status(200).send({ message: "Class Profile Data", classes });
});

// Staff Subject Info

app.get("/staffsubject/:sid", async (req, res) => {
  const { sid } = req.params;
  const subject = await Subject.findById({ _id: sid })
    .populate({
      path: "subjectTeacherName",
    })
    .populate({
      path: "class",
    })
    .populate({
      path: "institute",
    });
  res.status(200).send({ message: "Subject Profile Data", subject });
});

// Staff Department Batch Data

app.post("/:did/department/batch", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const { BatchId } = req.body;
  const batch = await Batch.findById({ _id: BatchId })
    .populate("classroom")
    .populate("batchStaff");

  // const department = await Department.findById({_id: did})
  // department.userBatch = batch
  // await department.save()
  res.status(200).send({ message: "Batch Class Data", batch });
});

// Request for Department Previous Batch Data
// Staff Batch Detail Data
app.get("/department-batch-detail/:did", async (req, res) => {
  const { did } = req.params;
  const department = await Department.findById({ _id: did })
    .populate("batches")
    .populate("userBatch");
  res.status(200).send({ message: "Department Data", department });
});
// Class Settings User Side API

// Class Premote Students

app.post("class/premote/:cid", async (req, res) => {
  const { cid } = req.params;
  const { selectedBatch, studentToPromote, classToPromote } = req.body;
  const classData = await Class.findById({ _id: cid }).populate(
    "ApproveStudent"
  );

  const batchData = await Batch.findById({ _id: selectedBatch }).populate(
    "classroom"
  );

  let approveStd = classData.ApproveStudent;
  let filter = approveStd.filter((e) => {
    return e.studentPremoteStatus === "Promoted";
  });

  let lockSub = classSubList.filter((e) => {
    return e.subjectStatus === "Locked";
  });
  let lockSubLength = lockSub.length;
  let subLength = classSubList.length;
  if (subLength !== lockSubLength) {
    res.status(200).send({ message: "All Subject of Class are Not Locked" });
  } else {
    classData.classStatus = "Locked";
    classData.save();
    res.status(200).send({ message: "Class Locked Successfully" });
  }
});

// Class Lock
app.post("/department/batch/class/:cid", async (req, res) => {
  const { cid } = req.params;
  const classData = await Class.findById({ _id: cid }).populate("subject");

  let classSubList = classData.subject;

  let lockSub = classSubList.filter((e) => {
    return e.subjectStatus === "Locked";
  });
  let lockSubLength = lockSub.length;
  let subLength = classSubList.length;

  if (subLength !== lockSubLength) {
    res.status(200).send({ message: "All Subject of Class are Not Locked" });
  } else {
    classData.classStatus = "Locked";
    classData.save();
    res.status(200).send({ message: "Class Locked Successfully" });
  }
});

// Staff Batch Detail Data
app.get("/batch-detail/:bid", async (req, res) => {
  const { bid } = req.params;
  const batch = await Batch.findById({ _id: bid })
    .populate("classroom")
    .populate("batchStaff");
  res.status(200).send({ message: "Batch Data", batch });
});

// Staff Batch Class Data

app.post("/batch/class", isLoggedIn, async (req, res) => {
  const { ClassId } = req.body;
  const classes = await Class.findById({ _id: ClassId })
    .populate("subject")
    .populate("batch");
  res.status(200).send({ message: "Class Data", classes });
});

app.get("/holiday/:did", async (req, res) => {
  const { did } = req.params;
  const depart = await Department.findById({ _id: did }).populate("holiday");
  res.status(200).send({ message: "holiday data", depart });
});

// Staff Class Info Updated at Users End

app.post("/staff/class-info/:cid", isLoggedIn, async (req, res) => {
  const { cid } = req.params;
  const { classAbout, classDisplayPerson, classStudentTotal } = req.body;
  const classInfo = await Class.findById({ _id: cid });
  classInfo.classAbout = classAbout;
  classInfo.classDisplayPerson = classDisplayPerson;
  classInfo.classStudentTotal = classStudentTotal;
  await classInfo.save();
  res.status(200).send({ message: "Class Info Updated", classInfo });
});

// Staff Department Info Updated at Users End

app.post("/staff/department-info/:did", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const {
    dAbout,
    dSpeaker,
    dEmail,
    dPhoneNumber,
    dVicePrinciple,
    dStudentPresident,
    dAdminClerk,
  } = req.body;
  const departmentInfo = await Department.findById({ _id: did });
  departmentInfo.dAbout = dAbout;
  departmentInfo.dSpeaker = dSpeaker;
  departmentInfo.dEmail = dEmail;
  departmentInfo.dPhoneNumber = dPhoneNumber;
  departmentInfo.dVicePrinciple = dVicePrinciple;
  departmentInfo.dStudentPresident = dStudentPresident;
  departmentInfo.dAdminClerk = dAdminClerk;
  await departmentInfo.save();
  res.status(200).send({ message: "Department Info Updates", departmentInfo });
});

// Staff Checklist in Department Updated

app.post("/department-class/checklist/:did", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const { ClassId, checklistFees, checklistName, checklistAmount } = req.body;
  const department = await Department.findById({ _id: did });
  const classes = await Class.findById({ _id: ClassId });
  const check = await new Checklist({
    checklistName: checklistName,
    checklistFees: checklistFees,
    checklistAmount: checklistAmount,
  });
  department.checklists.push(check);
  check.checklistDepartment = department;
  classes.checklist.push(check);
  check.checklistClass = classes;
  await department.save();
  await classes.save();
  await check.save();
  res
    .status(200)
    .send({ message: "Checklist Created", department, classes, check });
});

app.get("/checklist/:checklistId", isLoggedIn, async (req, res) => {
  const { checklistId } = req.params;
  const checklist = await Checklist.findById({ _id: checklistId }).populate(
    "student"
  );
  res.status(200).send({ message: "Checklist Data", checklist });
});

app.post("/department-class/fee/:did", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const { ClassId, feeName, feeAmount, feeDate } = req.body;
  const department = await Department.findById({ _id: did });
  const classes = await Class.findById({ _id: ClassId });
  const feeData = await new Fees({
    feeName: feeName,
    feeAmount: feeAmount,
    feeDate: feeDate,
  });
  department.fees.push(feeData);
  feeData.feeDepartment = department;
  classes.fee.push(feeData);
  feeData.feeClass = classes;
  await department.save();
  await classes.save();
  await feeData.save();
  res
    .status(200)
    .send({ message: "Fees Raised", department, classes, feeData });
});

app.get("/fees/:feesId", isLoggedIn, async (req, res) => {
  const { feesId } = req.params;
  const feeData = await Fees.findById({ _id: feesId })
    .populate({
      path: "feeStudent",
    })
    .populate("studentsList");
  res.status(200).send({ message: "Fees Data", feeData });
});

app.post("/student/:sid/fee/:id", isLoggedIn, async (req, res) => {
  const { sid, id } = req.params;
  const { status } = req.body;
  const student = await Student.findById({ _id: sid });
  const fData = await Fees.findById({ _id: id });
  if (
    fData.studentsList.length >= 1 &&
    fData.studentsList.includes(String(student._id))
  ) {
    res.status(200).send({
      message: `${student.studentFirstName} paid the ${fData.feeName}`,
    });
  } else {
    student.studentFee.push(fData);
    fData.feeStatus = status;
    fData.studentsList.push(student);
    fData.feeStudent = student;
    await student.save();
    await fData.save();
    res.status(200).send({
      message: `${fData.feeName} received by ${student.studentFirstName}`,
      fData,
      student,
    });
  }
});

app.post("/class/:cid/student/:sid/behaviour", isLoggedIn, async (req, res) => {
  const { cid, sid } = req.params;
  const classes = await Class.findById({ _id: cid });
  const student = await Student.findById({ _id: sid });
  const bData = await new Behaviour({ ...req.body });
  bData.studentName = student;
  classes.studentBehaviour.push(bData);
  student.studentBehaviourReportStatus = "Ready";
  bData.className = classes;
  await classes.save();
  await student.save();
  await bData.save();
  res.status(200).send({
    message: `${student.studentFirstName}'s Behaviour Report is ${student.studentBehaviourReportStatus}`,
    classes,
    bData,
  });
});

app.post("/class/:cid/student/attendence", isLoggedIn, async (req, res) => {
  const { cid, sid } = req.params;
  const dLeave = await Holiday.findOne({
    dDate: { $eq: `${req.body.attendDate}` },
  });
  if (dLeave) {
    res
      .status(200)
      .send({ message: "Today will be holiday Provided by department Admin" });
  } else {
    const existAttend = await AttendenceDate.findOne({
      attendDate: { $eq: `${req.body.attendDate}` },
    });
    if (existAttend) {
      res.status(200).send({ message: "Attendence Alreay Exists" });
    } else {
      const classes = await Class.findById({ _id: cid });
      const attendReg = await new Attendence({});
      const attendDate = await new AttendenceDate({ ...req.body });
      attendDate.className = classes;
      attendReg.className = classes;
      await attendDate.save();
      await attendReg.save();
      res.status(200).send({
        message: "Attendence Register is Ready",
        attendDate,
        attendReg,
      });
    }
  }
});

app.post("/department/:did/staff/attendence", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const dLeaves = await Holiday.findOne({
    dDate: { $eq: `${req.body.staffAttendDate}` },
  });
  if (dLeaves) {
    res
      .status(200)
      .send({ message: "Today will be holiday Provided by department Admin" });
  } else {
    const existSAttend = await StaffAttendenceDate.findOne({
      staffAttendDate: { $eq: `${req.body.staffAttendDate}` },
    });
    if (existSAttend) {
      res.status(200).send({ message: "Attendence Alreay Exists" });
    } else {
      const department = await Department.findById({ _id: did });
      const staffAttendReg = await new StaffAttendence({});
      const staffAttendDate = await new StaffAttendenceDate({ ...req.body });
      staffAttendDate.department = department;
      staffAttendReg.department = department;
      await staffAttendDate.save();
      await staffAttendReg.save();
      res.status(200).send({
        message: "Staff Attendence Register is Ready",
        staffAttendDate,
        staffAttendReg,
      });
    }
  }
});

app.post(
  "/student/:sid/attendence/:aid/present/:rid",
  isLoggedIn,
  async (req, res) => {
    const { sid, aid, rid } = req.params;
    const student = await Student.findById({ _id: sid });
    const attendDates = await AttendenceDate.findById({ _id: aid });
    const attendReg = await Attendence.findById({ _id: rid });
    try {
      if (
        attendDates.presentStudent.length >= 1 &&
        attendDates.presentStudent.includes(String(student._id))
      ) {
        res.status(200).send({ message: "Already Marked Present" });
      } else {
        if (
          attendDates.absentStudent &&
          attendDates.absentStudent.includes(String(student._id))
        ) {
          attendDates.absentStudent.splice(student._id, 1);
          attendDates.presentStudent.push(student);
          attendDates.presentstudents = student;
          await attendDates.save();
          res.status(200).send({ message: "finally marked present" });
        } else {
          attendDates.presentStudent.push(student);
          attendDates.presentstudents = student;
          student.attendDate.push(attendDates);
          student.attendenceReg = attendReg;
          attendReg.attendenceDate.push(attendDates);
          await attendDates.save();
          await student.save();
          await attendReg.save();
          res.status(200).send({
            message: `${student.studentFirstName} is ${req.body.status} on that day`,
            attendDates,
            student,
            attendReg,
          });
        }
      }
    } catch {
      res.status(400).send({ error: "Not Success" });
    }
  }
);

app.post(
  "/student/:sid/attendence/:aid/absent/:rid",
  isLoggedIn,
  async (req, res) => {
    const { sid, aid, rid } = req.params;
    const student = await Student.findById({ _id: sid });
    const attendDates = await AttendenceDate.findById({ _id: aid });
    const attendReg = await Attendence.findById({ _id: rid });
    try {
      if (
        attendDates.absentStudent.length >= 1 &&
        attendDates.absentStudent.includes(String(student._id))
      ) {
        res.status(200).send({ message: "Already Marked Absent" });
      } else {
        if (
          attendDates.presentStudent &&
          attendDates.presentStudent.includes(String(student._id))
        ) {
          attendDates.presentStudent.splice(student._id, 1);
          attendDates.absentStudent.push(student);
          attendDates.absentstudents = student;
          await attendDates.save();
          res.status(200).send({ message: "finally marked absent" });
        } else {
          attendDates.absentStudent.push(student);
          attendDates.absentstudents = student;
          student.attendDate.push(attendDates);
          student.attendenceReg = attendReg;
          attendReg.attendenceDate.push(attendDates);
          await attendDates.save();
          await student.save();
          await attendReg.save();
          res.status(200).send({
            message: `${student.studentFirstName} is ${req.body.status} on that day`,
            attendDates,
            student,
            attendReg,
          });
        }
      }
    } catch {
      res.status(400).send({ error: "Not Success" });
    }
  }
);

app.post(
  "/staff/:sid/attendence/:aid/present/:rid",
  isLoggedIn,
  async (req, res) => {
    const { sid, aid, rid } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const staffAttendDates = await StaffAttendenceDate.findById({ _id: aid });
    const staffAttendReg = await StaffAttendence.findById({ _id: rid });
    try {
      if (
        staffAttendDates.presentStaff.length >= 1 &&
        staffAttendDates.presentStaff.includes(String(staff._id))
      ) {
        res.status(200).send({ message: "Already Marked Present" });
      } else {
        if (
          staffAttendDates.absentStaff &&
          staffAttendDates.absentStaff.includes(String(staff._id))
        ) {
          staffAttendDates.absentStaff.splice(staff._id, 1);
          staffAttendDates.presentStaff.push(staff);
          staffAttendDates.presentstaffs = staff;
          await staffAttendDates.save();
          res.status(200).send({ message: "finally marked present" });
        } else {
          staffAttendDates.presentStaff.push(staff);
          staffAttendDates.presentstaffs = staff;
          staff.attendDates.push(staffAttendDates);
          staff.attendenceRegs = staffAttendReg;
          staffAttendReg.staffAttendenceDate.push(staffAttendDates);
          await staffAttendDates.save();
          await staff.save();
          await staffAttendReg.save();
          res.status(200).send({
            message: `${staff.staffFirstName} is ${req.body.status} on that day`,
            staffAttendDates,
            staff,
            staffAttendReg,
          });
        }
      }
    } catch {
      res.status(400).send({ error: "Not Success" });
    }
  }
);

app.post(
  "/staff/:sid/attendence/:aid/absent/:rid",
  isLoggedIn,
  async (req, res) => {
    const { sid, aid, rid } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const staffAttendDates = await StaffAttendenceDate.findById({ _id: aid });
    const staffAttendReg = await StaffAttendence.findById({ _id: rid });
    try {
      if (
        staffAttendDates.absentStaff.length >= 1 &&
        staffAttendDates.absentStaff.includes(String(staff._id))
      ) {
        res.status(200).send({ message: "Already Marked Absent" });
      } else {
        if (
          staffAttendDates.presentStaff &&
          staffAttendDates.presentStaff.includes(String(staff._id))
        ) {
          staffAttendDates.presentStaff.splice(staff._id, 1);
          staffAttendDates.absentStaff.push(staff);
          staffAttendDates.absentstaffs = staff;
          await staffAttendDates.save();
          res.status(200).send({ message: "finally marked absent" });
        } else {
          staffAttendDates.absentStaff.push(staff);
          staffAttendDates.absentstaffs = staff;
          staff.attendDates.push(staffAttendDates);
          staff.attendenceRegs = staffAttendReg;
          staffAttendReg.staffAttendenceDate.push(staffAttendDates);
          await staffAttendDates.save();
          await staff.save();
          await staffAttendReg.save();
          res.status(200).send({
            message: `${staff.staffFirstName} is ${req.body.status} on that day`,
            staffAttendDates,
            staff,
            staffAttendReg,
          });
        }
      }
    } catch {
      res.status(400).send({ error: "Not Success" });
    }
  }
);

app.post("/attendence/detail", isLoggedIn, async (req, res) => {
  const attendDates = await AttendenceDate.findOne({
    attendDate: { $gte: `${req.body.attendDate}` },
  })
    .populate("presentStudent")
    .populate("absentStudent");
  res.status(200).send({ message: "Attendence on that day", attendDates });
});

app.post("/attendence/status/student/:sid", isLoggedIn, async (req, res) => {
  const { sid } = req.params;
  const { dateStatus } = req.body;
  const attendStatus = await AttendenceDate.findOne({ attendDate: dateStatus });
  if (attendStatus) {
    if (
      attendStatus.presentStudent.length >= 1 &&
      attendStatus.presentStudent.includes(String(sid))
    ) {
      res
        .status(200)
        .send({ message: "Present", status: "Present", attendStatus });
    } else if (
      attendStatus.absentStudent.length >= 1 &&
      attendStatus.absentStudent.includes(String(sid))
    ) {
      res
        .status(200)
        .send({ message: "Absent", status: "Absent", attendStatus });
    } else {
    }
  } else {
    res
      .status(200)
      .send({ message: "Not Marking", status: "Not Marking", attendStatus });
  }
});

app.post("/staff/attendence", isLoggedIn, async (req, res) => {
  const staffDates = await StaffAttendenceDate.findOne({
    staffAttendDate: { $gte: `${req.body.staffAttendDate}` },
  })
    .populate("presentStaff")
    .populate("absentStaff");
  res.status(200).send({ message: "Attendence on that day", staffDates });
});

app.post("/attendence/status/staff/:sid", isLoggedIn, async (req, res) => {
  const { sid } = req.params;
  const { dateStatus } = req.body;
  const attendStatus = await StaffAttendenceDate.findOne({
    staffAttendDate: dateStatus,
  });
  if (attendStatus) {
    if (
      attendStatus.presentStaff.length >= 1 &&
      attendStatus.presentStaff.includes(String(sid))
    ) {
      res
        .status(200)
        .send({ message: "Present", status: "Present", attendStatus });
    } else if (
      attendStatus.absentStaff.length >= 1 &&
      attendStatus.absentStaff.includes(String(sid))
    ) {
      res
        .status(200)
        .send({ message: "Absent", status: "Absent", attendStatus });
    } else {
    }
  } else {
    res
      .status(200)
      .send({ message: "Not Marking", status: "Not Marking", attendStatus });
  }
});

app.post("/department/holiday/:did", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const { dateStatus } = req.body;
  const depart = await Department.findById({ _id: did });
  const staffDate = await StaffAttendenceDate.findOne({
    staffAttendDate: { $eq: `${dateStatus}` },
  });
  const classDate = await AttendenceDate.findOne({
    attendDate: { $eq: `${dateStatus}` },
  });
  if (staffDate && staffDate !== "undefined") {
    res.status(200).send({ message: "Count as a no holiday", staffDate });
  } else if (classDate && classDate !== "undefined") {
    res.status(200).send({ message: "Count as a no holiday", classDate });
  } else {
    const leave = await new Holiday({
      dDate: dateStatus,
      dHolidayReason: req.body.dateData.dHolidayReason,
    });
    depart.holiday.push(leave);
    leave.department = depart;
    await depart.save();
    await leave.save();
    res.status(200).send({ message: "Holiday Marked ", leave, depart });
  }
});

app.post("/student/:sid/checklist/:cid", isLoggedIn, async (req, res) => {
  const { sid, cid } = req.params;
  const student = await Student.findById({ _id: sid });
  const checklist = await Checklist.findById({ _id: cid });
  student.checklist.push(checklist);
  student.checklistAllottedStatus = "Allotted";
  checklist.student.push(student);
  checklist.studentAssignedStatus = "Assigned";
  await student.save();
  await checklist.save();
  res.status(200).send({ message: "checklist Assigned", student, checklist });
});
// End User Routes

// app.post("/user-register", async (req, res) => {
//   const { username } = req.body;
//   const admins = await Admin.findById({ _id: "61fb60df067659ed1029b2fc" });
//   const existAdmin = await Admin.findOne({ adminUserName: username });
//   const existInstitute = await InstituteAdmin.findOne({ name: username });
//   const existUser = await User.findOne({ username: username });
//   if (existAdmin) {
//     res.status(200).send({ message: "Username already exists" });
//   } else if (existInstitute) {
//     res.status(200).send({ message: "Username already exists" });
//   } else {
//     // const users = await User.findOne({ $or: [{ username: req.body.username }, { userPhoneNumber: req.body.userPhoneNumber } ]})
//     if (existUser) {
//       res.send({ message: "Username already exists" });
//     } else {
//       const user = await new User({ ...req.body });
//       admins.users.push(user);
//       await admins.save();
//       await user.save();
//       res.send({ message: "Successfully user created...", user });
//     }
//   }
// });

app.post("/user-detail", async (req, res) => {
  const { userPhoneNumber, status } = req.body;
  if (userPhoneNumber) {
    if (status === "Not Verified") {
      client.verify
        .services(data.SERVICEID)
        .verifications.create({
          to: `+91${userPhoneNumber}`,
          channel: "sms",
        })
        .then((data) => {
          res.status(200).send({
            message: "code will be send to registered mobile number",
            userPhoneNumber,
          });
        });
    } else {
      res.send({ message: "User will be verified..." });
    }
  } else {
    res.send({ message: "Invalid Phone No." });
  }
});

app.post("/user-detail-verify/:id", async (req, res) => {
  const { id } = req.params;
  client.verify
    .services(data.SERVICEID)
    .verificationChecks.create({
      to: `+91${id}`,
      code: req.body.userOtpCode,
    })
    .then(async (data) => {
      if (data.status === "approved") {
        var userStatus = data.status;
        res.send({ message: "OTP verified", id, userStatus });
      } else {
      }
    })
    .catch((e) => {
      console.log("something went wrong");
    });
});

// app.get("/profile-creation", (req, res) => {
//   res.render("ProfileCreation");
// });

app.post("/profile-creation/:id", async (req, res) => {
  const { id } = req.params;
  const admins = await Admin.findById({ _id: "6227047f2d99f21315b47edb" });
  const {
    userLegalName,
    userGender,
    userAddress,
    userBio,
    userDateOfBirth,
    username,
    status,
  } = req.body;
  const existAdmin = await Admin.findOne({ adminUserName: username });
  const existInstitute = await InstituteAdmin.findOne({ name: username });
  const existUser = await User.findOne({ username: username });
  if (existAdmin) {
    res.status(200).send({ message: "Username already exists" });
  } else if (existInstitute) {
    res.status(200).send({ message: "Username already exists" });
  } else {
    // const users = await User.findOne({ $or: [{ username: req.body.username }, { userPhoneNumber: req.body.userPhoneNumber } ]})
    if (existUser) {
      res.send({ message: "Username already exists" });
    } else {
      const user = await new User({
        userLegalName: userLegalName,
        userGender: userGender,
        userAddress: userAddress,
        userBio: userBio,
        userDateOfBirth: userDateOfBirth,
        username: username,
        userStatus: "Approved",
        userPhoneNumber: id,
        photoId: "1",
        coverId: "2",
      });
      admins.users.push(user);
      await admins.save();
      await user.save();
      res
        .status(200)
        .send({ message: "Profile Successfully Created...", user });
    }
  }
});

app.get("/create-user-password", (req, res) => {
  res.render("CreateUserPassword");
});

app.post("/create-user-password/:id", async (req, res) => {
  const { id } = req.params;
  const { userPassword, userRePassword } = req.body;
  const user = await User.findById({ _id: id });
  const genUserPass = await bcrypt.genSaltSync(12);
  const hashUserPass = await bcrypt.hashSync(
    req.body.userPassword,
    genUserPass
  );
  if (user) {
    if (userPassword === userRePassword) {
      user.userPassword = hashUserPass;
      await user.save();
      req.session.user = user;
      res.send({ message: "Password successfully created...", user });
    } else {
      res.send({ message: "Invalid Password Combination" });
    }
  } else {
    res.send({ message: "Invalid User" });
  }
});

app.get("/userdashboard", async (req, res) => {
  const users = await User.find({});
  res.status(200).send({ message: "All User List", users });
});

app.get("/userdashboard/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id })
    .populate({
      path: "userPosts",
      populate: {
        path: "userComment",
        populate: {
          path: "users",
        },
      },
    })
    .populate({
      path: "staff",
      populate: {
        path: "institute",
      },
    })
    .populate({
      path: "student",
      populate: {
        path: "institute",
      },
    })
    .populate("userFollowers")
    .populate({
      path: "userInstituteFollowing",
      populate: {
        path: "announcement",
      },
    })
    .populate("announcement")
    .populate({
      path: "student",
      populate: {
        path: "studentClass",
      },
    })
    .populate({
      path: "saveUsersPost",
      populate: {
        path: "user",
      },
    })
    .populate({
      path: "userPosts",
      populate: {
        path: "userlike",
      },
    })
    .populate("InstituteReferals")
    .populate({
      path: "saveUserInsPost",
      populate: {
        path: "institute",
      },
    })
    .populate({
      path: "role",
      populate: {
        path: "userSelectStaffRole",
      },
    })
    .populate("InstituteReferals")
    .populate({
      path: "role",
      populate: {
        path: "userSelectStudentRole",
      },
    })
    .populate({
      path: "userInstituteFollowing",
      populate: {
        path: "posts",
      },
    })
    .populate({
      path: "userFollowing",
      populate: {
        path: "userPosts",
      },
    })
    .populate({
      path: "staff",
      populate: {
        path: "staffDepartment",
      },
    })
    .populate("userFollowing")
    .populate({
      path: "staff",
      populate: {
        path: "staffClass",
      },
    })
    .populate("userCircle")
    .populate({
      path: "staff",
      populate: {
        path: "staffSubject",
      },
    })
    .populate({
      path: "userCircle",
      populate: {
        path: "userPosts",
      },
    })
    .populate({
      path: "support",
      populate: {
        path: "user",
      },
    });
  res.status(200).send({ message: "Your User", user });
});

app.get("/userdashboard/:id/user-post", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  res.render("userPost", { user });
});

app.post("/userdashboard/:id/user-post", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  const post = new UserPost({ ...req.body });
  post.imageId = "1";
  user.userPosts.push(post);
  post.user = user._id;
  await user.save();
  await post.save();
  res.status(200).send({ message: "Post Successfully Created", user });
});

app.post(
  "/userdashboard/:id/user-post/image",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadFile(file);
    const user = await User.findById({ _id: id });
    const post = new UserPost({ ...req.body });
    post.imageId = "0";
    post.userCreateImage = results.key;
    user.userPosts.push(post);
    post.user = user._id;
    await user.save();
    await post.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Post Successfully Created", user });
  }
);

app.get("/userdashboard/user-post/images/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

////////////////////////////

app.post("/userprofileabout/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  user.userAbout = req.body.userAbout;
  user.userCity = req.body.userCity;
  user.userState = req.body.userState;
  user.userCountry = req.body.userCountry;
  user.userHobbies = req.body.userHobbies;
  user.userEducation = req.body.userEducation;
  await user.save();
  res.status(200).send({ message: "About Updated", user });
});
app.get("/userprofileabout/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post(
  "/userprofileabout/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadFile(file);
    const user = await User.findById({ _id: id });
    user.profilePhoto = results.key;
    user.photoId = "0";
    await user.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Successfully photo change" });
  }
);
app.get("/userprofileabout/coverphoto/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post(
  "/userprofileabout/coverphoto/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadFile(file);
    const user = await User.findById({ _id: id });
    user.profileCoverPhoto = results.key;
    user.coverId = "0";

    await user.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Successfully cover photo change" });
  }
);

////////////////////////////////

app.post("/user/post/like", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const userpost = await UserPost.findById({ _id: postId });
  const user_sessions = req.session.user;
  const institute_sessions = req.session.institute;
  if (user_sessions) {
    if (
      userpost.userlike.length >= 0 &&
      userpost.userlike.includes(String(user_sessions._id))
    ) {
    } else {
      userpost.userlike.push(user_sessions._id);
      await userpost.save();
      res.status(200).send({ message: "Added To Likes", userpost });
    }
  } else if (institute_sessions) {
    if (
      userpost.userlikeIns.length >= 1 &&
      userpost.userlikeIns.includes(String(institute_sessions._id))
    ) {
    } else {
      userpost.userlikeIns.push(institute_sessions._id);
      await userpost.save();
      res.status(200).send({ message: "Added To Likes", userpost });
    }
  } else {
  }
});

app.post("/user/post/unlike", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const userpost = await UserPost.findById({ _id: postId });
  const user_sessions = req.session.user;
  const institute_sessions = req.session.institute;
  if (user_sessions) {
    userpost.userlike.splice(user_sessions._id, 1);
    await userpost.save();
    res.status(200).send({ message: "Removed from Likes", userpost });
  } else if (institute_sessions) {
    userpost.userlikeIns.splice(institute_sessions._id, 1);
    await userpost.save();
    res.status(200).send({ message: "Removed from Likes", userpost });
  } else {
  }
});

app.post("/user/post/comments/:id", async (req, res) => {
  const { id } = req.params;
  const userpost = await UserPost.findById({ _id: id });
  const usercomment = await new UserComment({ ...req.body });
  if (req.session.institute) {
    // usercomment.userInstitute.push(req.session.institute._id)
    usercomment.userInstitute = req.session.institute;
  } else {
    // usercomment.users.push(req.session.user._id)
    usercomment.users = req.session.user;
  }
  userpost.userComment.push(usercomment);
  usercomment.userpost = userpost;
  await userpost.save();
  await usercomment.save();
  res.status(200).send({ message: "Successfully Commented", userpost });
});

app.put("/user/follow-ins/institute", async (req, res) => {
  const user = await User.findById({ _id: req.session.user._id });
  const sinstitute = await InstituteAdmin.findById({
    _id: req.body.InsfollowId,
  });
  // user.userInstituteFollowing.splice(req.body.InsfollowId, 2)
  // sinstitute.userFollowersList.splice(req.session.user._id, 1)
  // await user.save()
  // await sinstitute.save()

  if (sinstitute.userFollowersList.includes(req.session.user._id)) {
    res.status(200).send({ message: "You Already Following This Institute" });
  } else {
    sinstitute.userFollowersList.push(req.session.user._id);
    user.userInstituteFollowing.push(req.body.InsfollowId);
    await sinstitute.save();
    await user.save();
  }
});

app.put("/user/unfollow/institute", async (req, res) => {
  const user = await User.findById({ _id: req.session.user._id });
  const sinstitute = await InstituteAdmin.findById({
    _id: req.body.InsfollowId,
  });

  if (sinstitute.userFollowersList.includes(req.session.user._id)) {
    user.userInstituteFollowing.splice(req.body.InsfollowId, 1);
    sinstitute.userFollowersList.splice(req.session.user._id, 1);
    await user.save();
    await sinstitute.save();
  } else {
    res.status(200).send({ message: "You Already Unfollow This Institute" });
  }
});

app.post("/user-search-profile", isLoggedIn, async (req, res) => {
  const user = await User.findOne({
    userLegalName: req.body.userSearchProfile,
  });
  res.status(200).send({ message: "Search User Here", user });
});

app.put("/user/follow-ins", async (req, res) => {
  const user = await User.findById({ _id: req.session.user._id });
  const suser = await User.findById({ _id: req.body.userFollowId });

  if (user.userFollowing.includes(req.body.userFollowId)) {
    res.status(200).send({ message: "You Already Following This User" });
  } else {
    suser.userFollowers.push(req.session.user._id);
    user.userFollowing.push(req.body.userFollowId);
    await suser.save();
    await user.save();
  }
  // }
});

app.put("/user/circle-ins", async (req, res) => {
  const user = await User.findById({ _id: req.session.user._id });
  const suser = await User.findById({ _id: req.body.followId });

  if (
    user.userCircle.includes(req.body.followId) &&
    suser.userCircle.includes(req.session.user._id)
  ) {
    res.status(200).send({ message: "You are Already In a Circle" });
  } else {
    const newConversation = new Conversation({
      members: [req.session.user._id, req.body.followId],
    });
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
    try {
      suser.userFollowing.splice(req.session.user._id, 1);
      user.userFollowers.splice(req.body.followId, 1);
      suser.userCircle.push(req.session.user._id);
      user.userCircle.push(req.body.followId);
      await user.save();
      await suser.save();
    } catch {
      res.status(500).send({ error: "error" });
    }
  }
});

app.put("/user/uncircle-ins", async (req, res) => {
  const user = await User.findById({ _id: req.session.user._id });
  const suser = await User.findById({ _id: req.body.followId });

  if (
    user.userCircle.includes(req.body.followId) &&
    suser.userCircle.includes(req.session.user._id)
  ) {
    try {
      user.userCircle.splice(req.body.followId, 1);
      suser.userCircle.splice(req.session.user._id, 1);
      user.userFollowers.push(req.body.followId);
      suser.userFollowing.push(req.session.user._id);
      await user.save();
      await suser.save();
    } catch {
      res.status(500).send({ error: "error" });
    }
  } else {
    res.status(200).send({ message: "You are Not In a Circle" });
  }
});

app.post("/user/forgot", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username: username });
  const institute = await InstituteAdmin.findOne({ name: username });
  if (user) {
    client.verify
      .services(data.SERVICEID)
      .verifications.create({
        to: `+91${user.userPhoneNumber}`,
        channel: "sms",
      })
      .then((data) => {
        res.status(200).send({
          message: "code will be send to registered mobile number",
          user,
        });
      });
  } else if (institute) {
    client.verify
      .services(data.SERVICEID)
      .verifications.create({
        to: `+91${institute.insPhoneNumber}`,
        channel: "sms",
      })
      .then((data) => {
        res.status(200).send({
          message: "code will be send to registered mobile number",
          institute,
        });
      });
  } else {
    res.status(200).send({ message: "Invalid Username" });
  }
});

app.post("/user/forgot/:fid", async (req, res) => {
  const { fid } = req.params;
  const user = await User.findById({ _id: fid });
  const institute = await InstituteAdmin.findById({ _id: fid });
  if (user) {
    client.verify
      .services(data.SERVICEID)
      .verificationChecks.create({
        to: `+91${user.userPhoneNumber}`,
        code: req.body.userOtpCode,
      })
      .then((data) => {
        res.status(200).send({ message: "Otp verified", user });
      });
  } else {
    client.verify
      .services(data.SERVICEID)
      .verificationChecks.create({
        to: `+91${institute.insPhoneNumber}`,
        code: req.body.userOtpCode,
      })
      .then((data) => {
        res.status(200).send({ message: "Otp verified", institute });
      });
  }
});

app.post("/user/reset/password/:rid", async (req, res) => {
  const { rid } = req.params;
  const { userPassword, userRePassword } = req.body;
  const user = await User.findById({ _id: rid });
  const institute = await InstituteAdmin.findById({ _id: rid });
  const genUserPass = await bcrypt.genSaltSync(12);
  const hashUserPass = await bcrypt.hashSync(
    req.body.userPassword,
    genUserPass
  );
  if (user) {
    if (userPassword === userRePassword) {
      user.userPassword = hashUserPass;
      await user.save();
      res.status(200).send({ message: "Password Changed Successfully", user });
    } else {
      res.status(200).send({ message: "Invalid Password Combination" });
    }
  } else if (institute) {
    if (userPassword === userRePassword) {
      institute.insPassword = hashUserPass;
      await institute.save();
      res
        .status(200)
        .send({ message: "Password Changed Successfully", institute });
    } else {
      res.status(200).send({ message: "Invalid Password Combination" });
    }
  } else {
  }
});

app.post("/user-announcement/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  const announcements = await new UserAnnouncement({ ...req.body });
  user.announcement.push(announcements);
  announcements.user = user;
  await user.save();
  await announcements.save();
  res.status(200).send({ message: "Successfully Created" });
});

// Institute Announcement Details
app.get("/user-announcement-detail/:id", async (req, res) => {
  const { id } = req.params;
  const announcement = await UserAnnouncement.findById({ _id: id }).populate(
    "user"
  );
  res.status(200).send({ message: "Announcement Detail", announcement });
});

app.post("/user/save/post", async (req, res) => {
  const { postId } = req.body;
  const user = await User.findById({ _id: req.session.user._id });
  const userPostsData = await UserPost.findById({ _id: postId });
  user.saveUsersPost.push(userPostsData);
  await user.save();
  res.status(200).send({ message: "Added To favourites", user });
});

app.post("/ins/unsave/post", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById({ _id: postId });
  const institute_session = req.session.institute;
  const user_session = req.session.user;
  if (institute_session) {
    const institute = await InstituteAdmin.findById({
      _id: institute_session._id,
    });
    institute.saveInsPost.splice(post, 1);
    await institute.save();
    res.status(200).send({ message: "Remove To Favourites", institute });
  } else if (user_session) {
    const user = await User.findById({ _id: user_session._id });
    user.saveUserInsPost.splice(post, 1);
    await user.save();
    res.status(200).send({ message: "Remove To Favourites", user });
  } else {
  }
});

app.post("/user/unsave/post", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const user = await User.findById({ _id: req.session.user._id });
  const userPostsData = await UserPost.findById({ _id: postId });
  user.saveUsersPost.splice(userPostsData, 1);
  await user.save();
  res.status(200).send({ message: "Remove To favourites", user });
});

app.post("/user/:id/support", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  const support = await new UserSupport({ ...req.body });
  user.support.push(support);
  support.user = user;
  await user.save();
  await support.save();
  res.status(200).send({ message: "Successfully Updated", user });
});

app.get("*", (req, res) => {
  res.status(404).send("Page Not Found...");
});

const port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log("Server listening on port " + port);
});
