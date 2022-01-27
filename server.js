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
const Conversation = require("./models/Conversation");
const Holiday = require("./models/Holiday");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const { uploadFile, getFileStream } = require("./S3Configuration");
// const dburl = process.env.DB_URL
// ||

const dburl =
  "mongodb+srv://new-user-web-app:6o2iZ1OFMybEtVDK@cluster0.sdhjn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// const dburl = "mongodb://localhost:27017/Erp_app";

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
    origin: "http://44.200.201.35:3000",
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
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
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
//for global user admin "61f2879ab114e04bc76d948d"
//for local my system "61efea4f73428a7ef8708c2c"
app.post("/ins-register", async (req, res) => {
  const admins = await Admin.findById({ _id: "61f2879ab114e04bc76d948d" });
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
      // console.log(institute);
      admins.instituteList.push(institute);
      await admins.save();
      await institute.save();
      res.send({ message: "Institute", institute });
    }
  }
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
  // console.log(
  //   "This is insDocument for the after updating : ",
  //   institute.insDocument
  // );
  await institute.save();
  await unlinkFile(file.path);

  res.status(200).send({ message: "Uploaded" });
});

// Create Institute Password
app.post("/create-password/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);
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
  // console.log("Session Timed Out");
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
        },
      })
      .populate("announcement")
      .populate("staff")
      .populate("ApproveStaff")
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
      .populate("userFollowersList");
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
    institute.posts.push(post);
    post.institute = institute._id;
    await institute.save();
    await post.save();
    const institutes = await InstituteAdmin.findById({ _id: id }).populate(
      "posts"
    );
    res.status(200).send({ message: "Your Institute", institute });
  }
);

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

// Institute Display Data
app.post("/insprofiledisplay/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  // try{
  const institute = await InstituteAdmin.findById({ _id: id });
  institute.insOperatingAdmin = req.body.insOperatingAdmin;
  institute.insPrinciple = req.body.insPrinciple;
  institute.insStudentPresident = req.body.insStudentPresident;
  institute.insTrusty = req.body.insTrusty;
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
    // console.log("This is file url: ", results);
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
    } = req.body;
    const student = await Student.findById({ _id: sid });
    student.studentLeavingReason = studentLeavingReason;
    student.studentLeavingInsDate = studentLeavingInsDate;
    student.studentLeavingStudy = studentLeavingStudy;
    student.studentLeavingBehaviour = studentLeavingBehaviour;
    student.studentLeavingRemark = studentLeavingRemark;
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
    // console.log(req.params);
    // console.log(req.body);

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
      // console.log("You already liked it");
    } else {
      post.insLike.push(institute_session._id);
      await post.save();
      res.status(200).send({ message: "Added To Likes", post });
    }
  } else if (user_session._id) {
    if (
      post.insUserLike.length >= 1 &&
      post.insUserLike.includes(String(user_session._id))
    ) {
      // console.log("You already liked it user");
    } else {
      post.insUserLike.push(user_session._id);
      await post.save();
      res.status(200).send({ message: "Added To Likes", post });
    }
  } else {
  }
});

// Institute Post For Dislike
app.post("/post/unlike", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById({ _id: postId });
  const user_id = req.session.institute || req.session.user;
  post.like.pop(user_id._id);
  await post.save();
  res.status(200).send({ message: "Removed From Likes", post });
});

// Institute Post For Comments

app.post("/post/comments/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById({ _id: id });
  const comment = await new Comment({ ...req.body });
  if (req.session.institute) {
    // comment.institutes.push(req.session.institute._id)
    comment.institutes = req.session.institute.name;
  } else {
    // comment.instituteUser.push(req.session.user._id)
    comment.instituteUser = req.session.user.username;
  }
  post.comment.push(comment);
  comment.post = post;
  // console.log(comment);
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
  // try{
  const institute = await InstituteAdmin.findOne({
    insName: req.body.insSearchProfile,
  });
  res.status(200).send({ message: "Search Institute Here", institute });
  // }
  // catch{
  //     res.status(401).send({ message: 'Bad Request'})
  // }
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

// Depreceated Currently No Use

// Institute Department Data

app.get("/department/:did", async (req, res) => {
  const { did } = req.params;
  const department = await Department.findById({ _id: did })
    .populate({ path: "dHead" })
    .populate("batches");
  res.status(200).send({ message: "Department Data", department });
});

// Institute Batch in Department

app.post("/batchdetail", isLoggedIn, async (req, res) => {
  const { batchDetail } = req.body;
  const batches = await Batch.findById({ _id: batchDetail });
  res.status(200).send({ message: "Batch Detail Data", batches });
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
  // console.log(req.body);
  const department = await Department.findById({ _id: did });
  const batch = await new Batch({ ...req.body });
  department.batches.push(batch);
  batch.department = department;
  // console.log(batch);
  await department.save();
  await batch.save();
  res.status(200).send({ message: "batch data", batch });
});

// Institute Class Creation In Batch
// for examination

app.get("/ins/:id/departmentmastersubject/", async (req, res) => {
  const { id } = req.params;
  const subjectMaster = await SubjectMaster.find({ institute: id });
  res.status(200).send({ message: "SubjectMaster Are here", subjectMaster });
});

// Create Master Subject data

app.post(
  "/ins/:id/departmentmastersubject/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    const { id } = req.params;
    const { subjectName } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const subjectMaster = await new SubjectMaster({
      subjectName: subjectName,
      institute: institute._id,
    });
    await subjectMaster.save();
    res
      .status(200)
      .send({ message: "Successfully Created Master Subject", subjectMaster });
  }
);

// / Master Class Creator Route
// Get all ClassMaster Data
app.get("/ins/:id/departmentmasterclass/", async (req, res) => {
  const { id } = req.params;
  const classMaster = await ClassMaster.find({ institute: id });
  res.status(200).send({ message: "ClassMaster Are here", classMaster });
});
// Create Master Class Data
app.post(
  "/ins/:id/departmentmasterclass/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    const { id } = req.params;
    const { classTitle, className } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const classroomMaster = await new ClassMaster({
      className: className,
      classTitle: classTitle,
      institute: institute._id,
    });
    await classroomMaster.save();
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
    const { sid, classTitle, className, classCode, mcId } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const masterClass = await ClassMaster.findById({ _id: mcId });
    const mCName = masterClass.className;
    const batch = await Batch.findById({ _id: bid });
    const staff = await Staff.findById({ _id: sid });
    const depart = await Department.findById({ _id: did }).populate({
      path: "dHead",
    });
    const classRoom = await new Class({
      className: `${mCName}-${className}`,
      classTitle: classTitle,
      classCode: classCode,
    });
    institute.classRooms.push(classRoom);
    classRoom.institute = institute;
    batch.classroom.push(classRoom);
    masterClass.classDivision.push(classRoom);
    if (String(depart.dHead._id) == String(staff._id)) {
      // console.log("Same as department Head");
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
    .populate("subject")
    .populate("subTeacher");

  res.status(200).send({ message: "All Exam Data", exams });
});

// Get all Exam From Subject
app.get("/exam/subject/:suid", async (req, res) => {
  const { suid } = req.params;

  const subject = await Subject.findById({ _id: suid }).populate({
    path: "subjectExams",
  });
  const subExamList = subject.subjectExams;

  res.status(200).send({ message: "Subject Exam List", subExamList });
});

app.post(
  "/ins/:id/department/function/examcreation/:did/batch/:bid/",
  isLoggedIn,
  async (req, res) => {
    const { id, did, bid } = req.params;
    const {
      suid,
      cid,
      examName,
      examType,
      examMode,
      examWeight,
      examDate,
      examTime,
      totalMarks,
    } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const subject = await Subject.findById({ _id: suid });
    const depart = await Department.findById({ _id: did });
    const classRoom = await Class.findById({ _id: cid });

    const newExam = await new Exam({
      institute: id,
      batch: batch,
      examType: examType,
      examName: examName,
      examMode: examMode,
      examWeight: examWeight,
      examDate: examDate,
      examTime: examTime,
      examForClass: cid,
      examForDepartment: depart,
      totalMarks: totalMarks,
      subject: suid,
      subTeacher: subject.subjectTeacherName,
    });

    await newExam.save();
    // console.log(newExam, "Exam Was Saved");
    subject.subjectExams.push(newExam);
    batch.batchExam.push(newExam);
    classRoom.classExam.push(newExam);
    depart.departmentExam.push(newExam);
    await batch.save();
    await subject.save();
    await classRoom.save();
    await depart.save();
    res.status(200).send({ message: "Successfully Created Exam", newExam });
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
    .populate("subject");

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

// Marks Submit and Save of Student
app.post("/student/marks/", isLoggedIn, async (req, res) => {
  // console.log("Data Recived");
  const { studentMarksData, studentText, activeExamData } = req.body;
  // console.log(studentMarksData, studentMarksData, studentMarksData);
  const student = await Student.findById({ _id: studentId });
  const examMarks = {
    examId: examId,
    examTotalMarks: totalMarks,
    examObtainMarks: obtainedMarks,
  };
  // console.log(examMarks);
  student.sudentMarks.push(examMarks);
  await student.save();
  // console.log(examMarks);
  res.status(200).send({ message: "Successfully Marks Save" });
  // console.log("send Responce Successfull");
});

///////////////////////////////////////////////////////

// app.post("/ins/:id/department/:did/batch/:bid", async (req, res) => {
//   const { id, did, bid } = req.params;
//   const { sid, classTitle, className, classCode } = req.body;
//   const institute = await InstituteAdmin.findById({ _id: id });
//   const batch = await Batch.findById({ _id: bid });
//   const staff = await Staff.findById({ _id: sid });
//   const depart = await Department.findById({ _id: did }).populate({
//     path: "dHead",
//   });
//   const classRoom = await new Class({
//     className: className,
//     classTitle: classTitle,
//     classCode: classCode,
//   });
//   institute.classRooms.push(classRoom);
//   classRoom.institute = institute;
//   batch.classroom.push(classRoom);
//   if (String(depart.dHead._id) == String(staff._id)) {
//     console.log("Same as department Head");
//   } else {
//     depart.departmentChatGroup.push(staff);
//   }
//   classRoom.batch = batch;
//   batch.batchStaff.push(staff);
//   staff.batches = batch;
//   staff.staffClass.push(classRoom);
//   classRoom.classTeacher = staff;
//   console.log(classRoom);
//   await institute.save();
//   await batch.save();
//   await staff.save();
//   await classRoom.save();
//   await depart.save();
//   res.status(200).send({
//     message: "Successfully Created Class",
//     classRoom,
//     staff,
//     batch,
//     institute,
//     depart,
//   });
// });

// Get Institute Classes Data

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
    });
    classes.subject.push(subject);
    subjectMaster.subjects.push(subject);
    subject.class = classes;
    if (String(classes.classTeacher._id) == String(staff._id)) {
      // console.log("Same as Subject Teacher");
    } else {
      batch.batchStaff.push(staff);
      staff.batches = batch;
    }
    if (String(depart.dHead._id) == String(staff._id)) {
      // console.log("Same as department Head");
    } else {
      depart.departmentChatGroup.push(staff);
    }
    staff.staffSubject.push(subject);
    subject.subjectTeacherName = staff;
    // console.log(staff._id);
    // console.log(classes.classTeacher._id);
    // console.log(batch.batchStaff);
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
  // console.log(student)
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
  // institute.ApproveStudent.push(student)
  institute.student.splice(sid, 1);
  // classes.ApproveStudent.push(student)
  classes.student.splice(sid, 1);
  // student.studentGRNO = classes.ApproveStudent.length
  // console.log(student)
  await institute.save();
  await classes.save();
  await student.save();
  res.status(200).send({
    message: `Application Rejected ${student.studentFirstName} ${student.studentLastName}`,
    institute,
    classes,
  });
});

// Get all department Batch class Data & Subject
app.get("/ins/:id/allclassdata/:did/batch/:bid", async (req, res) => {
  const { id, did, bid } = req.params;
  const classroom = await Class.find({ batch: bid }).populate({
    path: "subject",
  });

  let row = classroom.length;
  let subject = [];

  for (let i = 0; i < row; i++) {
    let d = classroom[i].subject;
    for (let n = 0; n < d.length; n++) {
      let b = classroom[i].subject[n];
      subject.push(b);
    }
  }
  res.status(200).send({
    message: "All Department class and Subject data",
    classroom,
    subject,
  });
});

// get all Master Subject Data

app.get("/ins/:id/departmentmastersubject/", async (req, res) => {
  const { id } = req.params;
  const subjectMaster = await SubjectMaster.find({ institute: id });
  res.status(200).send({ message: "SubjectMaster Are here", subjectMaster });
});

// get all Master Class Data
app.get("/ins/:id/departmentmasterclass/", async (req, res) => {
  const { id } = req.params;
  const classMaster = await ClasstMaster.find({ institute: id });
  res.status(200).send({ message: "ClassMaster Are here", ClassMaster });
});
// Create Master Subject data
app.post(
  "/ins/:id/departmentmastersubject/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    const { id } = req.params;
    const { subjectName } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const subjectMaster = await new SubjectMaster({
      subjectName: subjectName,
      institute: institute._id,
    });
    await subjectMaster.save();
    res
      .status(200)
      .send({ message: "Successfully Created Master Subject", subjectMaster });
  }
);

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

// for finding Staff By Id

app.post("/staffdetaildata", isLoggedIn, async (req, res) => {
  const { staffId } = req.body;
  const staff = await Staff.findById({ _id: staffId });
  res.status(200).send({ message: "Staff Detail Data", staff });
});

// Student Detail Data

app.post("/studentdetaildata", isLoggedIn, async (req, res) => {
  const { studentId } = req.body;
  const student = await Student.findById({ _id: studentId });
  res.status(200).send({ message: "Student Detail Data", student });
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
app.get("/staffdesignationdata/:sid", isLoggedIn, async (req, res) => {
  const { sid } = req.params;
  const staff = await Staff.findById({ _id: sid })
    .populate("staffDepartment")
    .populate("staffClass")
    .populate("staffSubject")
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
    .populate("checklist");
  // .populate('studentAttendence')
  res.status(200).send({ message: "Student Designation Data", student });
});

// Staff Department Info

app.get("/staffdepartment/:sid", async (req, res) => {
  const { sid } = req.params;
  const department = await Department.findById({ _id: sid })
    .populate("batches")
    .populate({
      path: "dHead",
    })
    .populate({
      path: "institute",
    })
    .populate("checklists");
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

app.post("/department/batch", isLoggedIn, async (req, res) => {
  const { BatchId } = req.body;
  const batch = await Batch.findById({ _id: BatchId })
    .populate("classroom")
    .populate("batchStaff");
  res.status(200).send({ message: "Batch Class Data", batch });
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
  const classes = await Class.findById({ _id: ClassId }).populate("subject");
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

app.post("/checklist", isLoggedIn, async (req, res) => {
  const { ChecklistId } = req.body;
  const checklist = await Checklist.findById({ _id: ChecklistId });
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

app.post("/fees", isLoggedIn, async (req, res) => {
  const { FeesId } = req.body;
  const feeData = await Fees.findById({ _id: FeesId })
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
    // console.log("includes");
    // console.log(fData._id);
    // console.log(fData.studentsList);
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
  // console.log(req.params, req.body)
  const dLeave = await Holiday.findOne({
    dDate: { $eq: `${req.body.attendDate}` },
  });
  if (dLeave) {
    res
      .status(200)
      .send({ message: "Today will be holiday Provided by department Admin" });
  } else {
    const classes = await Class.findById({ _id: cid });
    const attendReg = await new Attendence({});
    const attendDate = await new AttendenceDate({ ...req.body });
    attendDate.className = classes;
    attendReg.className = classes;
    await attendDate.save();
    await attendReg.save();
    res
      .status(200)
      .send({ message: "Attendence Register is Ready", attendDate, attendReg });
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
});

app.post(
  "/student/:sid/attendence/:aid/present/:rid",
  isLoggedIn,
  async (req, res) => {
    const { sid, aid, rid } = req.params;
    const student = await Student.findById({ _id: sid });
    const attendDates = await AttendenceDate.findById({ _id: aid });
    const attendReg = await Attendence.findById({ _id: rid });
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
        // console.log(attendDates.absentStudent)
        // console.log('marked as present')
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
        // console.log(attendDates.presentStudent)
        // console.log('marked as absent')
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
        // console.log(staffAttendDates.absentStudent)
        // console.log('marked as present')
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
        // console.log(staffAttendDates.presentStudent)
        // console.log('marked as absent')
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

// app.get('/student/:sid/attendence', async (req, res) =>{
//     const { sid } = req.params
//     const attendStudent = await Student.findById({_id: sid})
//     .populate('attendDate')
//     res.status(200).send({ message: 'student attendence', attendStudent})
// })

app.post("/attendence/status/student/:sid", isLoggedIn, async (req, res) => {
  const { sid } = req.params;
  const { dateStatus } = req.body;
  // console.log(req.body)
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
  // console.log(req.body)
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

app.post("/user-register", async (req, res) => {
  const { username } = req.body;
  const admins = await Admin.findById({ _id: "61f2879ab114e04bc76d948d" });
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
      const user = await new User({ ...req.body });
      admins.users.push(user);
      await admins.save();
      await user.save();
      res.send({ message: "Successfully user created...", user });
    }
  }
});

app.post("/user-detail/:uid", async (req, res) => {
  const { uid } = req.params;
  // console.log(req.params);
  const user = await User.findById({ _id: uid });
  if (user) {
    if (user.userStatus === "Not Verified") {
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
    } else {
      res.send({ message: "User will be verified..." });
    }
  } else {
    res.send({ message: "Invalid Phone No." });
  }
});

app.post("/user-detail-verify/:uid", async (req, res) => {
  const { uid } = req.params;
  const user = await User.findById({ _id: uid });
  client.verify
    .services(data.SERVICEID)
    .verificationChecks.create({
      to: `+91${user.userPhoneNumber}`,
      code: req.body.userOtpCode,
    })
    .then((data) => {
      user.userStatus = data.status;
      // console.log("Thanks For Confirmations...");
      user.save();
      res.send({ message: "Status will be Approved...", user });
    });
});

app.get("/profile-creation", (req, res) => {
  res.render("ProfileCreation");
});

app.post("/profile-creation/:id", async (req, res) => {
  const { id } = req.params;
  const { userLegalName, userGender, userAddress, userBio, userDateOfBirth } =
    req.body;
  // console.log(req.body);
  const user = await User.findById({ _id: id });
  user.userLegalName = userLegalName;
  user.userGender = userGender;
  user.userAddress = userAddress;
  user.userBio = userBio;
  user.userDateOfBirth = userDateOfBirth;
  user.photoId = "1";
  user.coverId = "2";

  await user.save();
  req.session.user = user;
  res.status(200).send({ message: "Profile Successfully Created...", user });
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
    .populate("userFollowing")
    .populate("userCircle")
    .populate("InstituteReferals")
    .populate("userInstituteFollowing")
    .populate("announcement")
    .populate({
      path: "student",
      populate: {
        path: "studentClass",
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
  user.userPosts.push(post);
  post.user = user._id;
  await user.save();
  await post.save();
  res.status(200).send({ message: "Post Successfully Created", user });
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
    // console.log("Uploaded photo in aws");
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
      // console.log("You already liked it");
      // console.log(userpost.userlike.length);
      // console.log(userpost.userlike.includes(String(user_sessions._id)));
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
      // console.log("You already liked it institute");
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
  const users = req.session.user || req.session.institute;
  userpost.userlike.pop(users._id);
  await userpost.save();
  res.status(200).send({ message: "Removed From Likes", userpost });
});

app.post("/user/post/comments/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(req.params, req.body);
  const userpost = await UserPost.findById({ _id: id });
  const usercomment = await new UserComment({ ...req.body });
  if (req.session.institute) {
    // usercomment.userInstitute.push(req.session.institute._id)
    usercomment.userInstitute = req.session.institute.name;
  } else {
    // usercomment.users.push(req.session.user._id)
    usercomment.users = req.session.user.username;
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

app.post("/user-search-profile", isLoggedIn, async (req, res) => {
  // console.log(req.body
  const user = await User.findOne({
    userLegalName: req.body.userSearchProfile,
  });
  res.status(200).send({ message: "Search User Here", user });
  // console.log(user);
});

app.put("/user/follow-ins", async (req, res) => {
  const user = await User.findById({ _id: req.session.user._id });
  const suser = await User.findById({ _id: req.body.userFollowId });

  // if(user.userCircle.includes(req.body.userFollowId) && suser.userCircle.includes(req.session.user._id)){
  //     res.status(200).send({ message: 'You are Already In a Circle You Will not follow'})
  // }
  // else{
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
    suser.userFollowers.splice(req.session.user._id, 1);
    user.userFollowing.splice(req.body.followId, 1);
    suser.userCircle.push(req.session.user._id);
    user.userCircle.push(req.body.followId);
    await suser.save();
    await user.save();
  }
});

app.post("/user/forgot", isLoggedIn, async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username: username });
  const institute = await InstituteAdmin.findOne({ name: username });
  // console.log(user);
  // console.log(req.body);
  // console.log(institute);
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

app.post("/user/forgot/:fid", isLoggedIn, async (req, res) => {
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

app.post("/user/reset/password/:rid", isLoggedIn, async (req, res) => {
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
      // console.log(user.userPassword);
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

app.get("*", (req, res) => {
  res.status(404).send("Page Not Found...");
});

const port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log("Server listening on port " + port);
  // console.log("Server listening on port " + process.env.ACCOUNTSID);
  // console.log("Server listening on port " + process.env.SERVICEID);
  // console.log("Server listening on port " + port);
});
