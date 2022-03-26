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
const moment = require("moment");

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
const GroupConversation = require("./models/GroupConversation");
const Holiday = require("./models/Holiday");
const Finance = require("./models/Finance");
const Income = require("./models/Income");
const Expense = require("./models/Expense");
const Sport = require("./models/Sport");
const SportClass = require("./models/SportClass");
const SportEvent = require("./models/SportEvent");
const SportEventMatch = require("./models/SportEventMatch");
const SportTeam = require("./models/SportTeam");
const Leave = require("./models/Leave");
const StudentLeave = require("./models/StudentLeave");
const StudentTransfer = require("./models/StudentTransfer");
const Transfer = require("./models/Transfer");
const UserSupport = require("./models/UserSupport");
const InstituteSupport = require("./models/InstituteSupport");
const Complaint = require("./models/Complaint");
const Field = require("./models/Field");
const Report = require("./models/Report");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Role = require("./models/Role");
const {
  uploadFile,
  uploadVideo,
  uploadDocFile,
  getFileStream,
  deleteFile,
} = require("./S3Configuration");

const update = require("./controllers/update");
// =========== Ankush Model ==========

const ELearning = require("./models/ELearning");
const Playlist = require("./models/Playlist");
const Video = require("./models/Video");
const Resource = require("./models/Resource");
const Topic = require("./models/Topic");
const { getVideoDurationInSeconds } = require("get-video-duration");
const Library = require("./models/Library");
const Book = require("./models/Book");
const Issue = require("./models/Issue");
const Collect = require("./models/Collect");
const VideoComment = require("./models/VideoComment");
const ResourcesKey = require("./models/ResourcesKey");

// ========= Vaibhav Model ========

const AdmissionAdmin = require("./models/AdmissionAdmin");
const DepartmentApplication = require("./models/DepartmentApplication");
const PreAppliedStudent = require("./models/PreAppliedStudent");

const Feedback = require("./models/Feedback");
const Payment = require("./models/Payment");
const PlaylistPayment = require("./models/PlaylistPayment");
const IdCardPayment = require("./models/IdCardPayment");
const payment = require("./routes/paymentRoute");
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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
      // expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: Date.now() + 30 * 86400 * 1000,
    },
  })
);

app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/v1", payment);

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

app.get("/all/referral/ins/detail", async (req, res) => {
  const institute = await InstituteAdmin.find({});
  res.status(200).send({ message: "institute detail", institute });
});

app.get("/admindashboard/:id", async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findById({ _id: id })
    .populate({
      path: "ApproveInstitute",
      populate: {
        path: "financeDepart",
      },
    })
    .populate("RejectInstitute")
    .populate("instituteList")
    .populate("users")
    .populate({
      path: "instituteIdCardBatch",
      populate: {
        path: "institute",
      },
    })
    .populate({
      path: "reportList",
      populate: {
        path: "reportInsPost",
        populate: {
          path: "institute",
        },
      },
    })
    .populate({
      path: "instituteIdCardBatch",
      populate: {
        path: "ApproveStudent",
      },
    })
    .populate("blockedUsers")
    .populate({
      path: "reportList",
      populate: {
        path: "reportBy",
      },
    })
    .populate({
      path: "instituteIdCardBatch",
      populate: {
        path: "ApproveStudent",
      },
    })
    .populate({
      path: "reportList",
      populate: {
        path: "reportUserPost",
        populate: {
          path: "user",
        },
      },
    })
    .populate("idCardPrinting")
    .populate("idCardPrinted")
    .populate({
      path: "feedbackList",
      populate: {
        path: "user",
      },
    });
  res.status(200).send({ message: "Admin Detail", admin });
});

// Get All User for Institute Referals

app.get("/all/user/referal", async (req, res) => {
  const user = await User.find({});
  res.status(200).send({ message: "User Referal Data", user });
});

// Institute Approval By Super Admin

app.post("/admin/:aid/approve/ins/:id", async (req, res) => {
  try {
    const { aid, id } = req.params;
    const {
      referalPercentage,
      insFreeLastDate,
      insPaymentLastDate,
      userID,
      status,
    } = req.body;
    // console.log(referalPercentage)
    const admin = await Admin.findById({ _id: aid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: userID });
    const rInstitute = await InstituteAdmin.findById({ _id: userID });

    admin.ApproveInstitute.push(institute);
    admin.instituteList.splice(id, 1);
    institute.insFreeLastDate = insFreeLastDate;
    institute.insPaymentLastDate = insPaymentLastDate;
    institute.status = status;

    if (user) {
      admin.referals.push(user);
      user.InstituteReferals.push(institute);
      user.referalPercentage =
        user.referalPercentage + parseInt(referalPercentage);
      institute.AllUserReferral.push(user);
      await user.save();
      await institute.save();
    } else if (rInstitute) {
      admin.referalsIns.push(rInstitute);
      rInstitute.instituteReferral.push(institute);
      rInstitute.referalPercentage =
        rInstitute.referalPercentage + parseInt(referalPercentage);
      institute.AllInstituteReferral.push(rInstitute);
      await rInstitute.save();
      await institute.save();
    }

    await admin.save();
    const newConversation = await new GroupConversation({ admin: institute });
    newConversation.members.push(institute._id);
    institute.groupConversation = newConversation;
    await newConversation.save();
    res.status(200).send({
      message: `Congrats for Approval ${institute.insName}`,
      admin,
      institute,
      newConversation,
    });
  } catch {
    // console.log('error in Institute Approval')
  }
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
//for global user admin "623ecdcaa333699c3c9cd93c"
//for local my system "623ecdcaa333699c3c9cd93c"
app.post("/ins-register", async (req, res) => {
  const admins = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
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
  const results = await uploadDocFile(file);
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

var d_date = new Date();
var d_a_date = d_date.getDate();
var d_a_month = d_date.getMonth() + 1;
var d_a_year = d_date.getFullYear();
if (d_a_month <= 10) {
  d_a_month = `0${d_a_month}`;
}
var deactivate_date = `${d_a_year}-${d_a_month}-${d_a_date}`;

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
        if (
          user.activeStatus === "Deactivated" &&
          user.activeDate === deactivate_date
        ) {
          user.activeStatus = "Activated";
          user.activeDate = "";
          await user.save();
          req.session.user = user;
          res
            .status(200)
            .send({ message: "Successfully LoggedIn as a User", user });
        } else if (user.activeStatus === "Activated") {
          req.session.user = user;
          res
            .status(200)
            .send({ message: "Successfully LoggedIn as a User", user });
        } else {
        }
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
          populate: {
            path: "institutes",
          },
        },
      })
      .populate("announcement")
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
      .populate("financeDepart")
      .populate("sportDepart")
      .populate("addInstitute")
      .populate("addInstituteUser")
      .populate({
        path: "leave",
        populate: {
          path: "staff",
        },
      })
      .populate({
        path: "transfer",
        populate: {
          path: "staff",
        },
      })
      .populate({
        path: "studentComplaints",
        populate: {
          path: "student",
        },
      })
      .populate({
        path: "groupConversation",
      })
      .populate("idCardField")
      .populate("idCardBatch")
      .populate("AllUserReferral")
      .populate("AllInstituteReferral")
      .populate("instituteReferral")
      .populate({
        path: "supportIns",
        populate: {
          path: "institute",
        },
      })
      .populate({
        path: "posts",
        populate: {
          path: "comment",
          populate: {
            path: "instituteUser",
          },
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
    const results = await uploadDocFile(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = new Post({ ...req.body });
    post.imageId = "0";
    post.CreateImage = results.key;
    // console.log("Tis is institute : ", post);
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

////////////////////FOR THE VIDEO UPLOAD///////////////////////////
app.post(
  "/insdashboard/:id/ins-post/video",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadVideo(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = new Post({ ...req.body });
    post.CreateVideo = results.key;
    post.imageId = "1";
    institute.posts.push(post);
    post.institute = institute._id;
    await institute.save();
    await post.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Your Institute", institute });
  }
);

app.get("/insdashboard/ins-post/video/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.put(
  "/insdashboard/:id/ins-post/:uid/update",
  isLoggedIn,
  async (req, res) => {
    const { id, uid } = req.params;
    const { CreatePostStatus } = req.body;
    const post = await Post.findById({ _id: uid });
    post.CreatePostStatus = CreatePostStatus;
    await post.save();
    res.status(200).send({ message: "visibility change", post });
  }
);

app.delete("/insdashboard/:id/ins-post/:uid", isLoggedIn, async (req, res) => {
  const { id, uid } = req.params;
  await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: uid } });
  await InstituteAdmin.findByIdAndUpdate(id, { $pull: { saveInsPost: uid } });
  await Post.findByIdAndDelete({ _id: uid });
  res.status(200).send({ message: "deleted Post" });
});

app.post("/ins/phone/info/:id", async (req, res) => {
  const { id } = req.params;
  const { insPhoneNumber } = req.body;
  const institute = await InstituteAdmin.findById({ _id: id });
  institute.insPhoneNumber = insPhoneNumber;
  await institute.save();
  res.status(200).send({ message: "Mobile No Updated", institute });
});

app.patch("/ins/personal/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
    await institute.save();
    res.status(200).send({ message: "Personal Info Updated", institute });
  } catch {}
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
    const width = 200;
    const height = 200;
    const results = await uploadFile(file, width, height);
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
    const width = 900;
    const height = 260;
    const results = await uploadFile(file, width, height);
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
    const width = 200;
    const height = 200;
    const results = await uploadFile(file, width, height);
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
    const results = await uploadDocFile(file);
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
    const results = await uploadDocFile(file);
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
  } else if (user_session) {
    if (
      post.insUserLike.length >= 1 &&
      post.insUserLike.includes(String(user_session._id))
    ) {
      // console.log("You already liked it user");
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
    console.log(user.saveUserInsPost);
    res.status(200).send({ message: "Remove To Favourites", user });
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
    // comment.institutes.push(req.session.institute._id)
    comment.institutes = req.session.institute;
  } else {
    // comment.instituteUser.push(req.session.user._id)
    comment.instituteUser = req.session.user;
  }
  post.comment.push(comment);
  comment.post = post;
  await post.save();
  await comment.save();
  res.status(200).send({ message: "Successfully Commented", post });
});

// Institute For Staff Approval

app.get("/ins-data/:id", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id }).populate({
    path: "groupConversation",
  });
  res.send(institute);
});

app.post("/ins/:id/staff/approve/:sid", isLoggedIn, async (req, res) => {
  try {
    const { id, sid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    //     .populate({
    //       path: "groupConversation",
    //     });
    const staffs = await Staff.findById({ _id: sid });
    staffs.staffStatus = req.body.status;
    institute.ApproveStaff.push(staffs);
    institute.staff.splice(sid, 1);
    staffs.staffROLLNO = institute.ApproveStaff.length;
    //     institute.groupConversation.members.push(staffs._id);
    //     staffs.joinedInsGroup.push(institute.groupConversation);
    // console.log(institute.groupConversation)
    await institute.save();
    //     await institute.groupConversation.save();
    await staffs.save();
    res.status(200).send({
      message: `Welcome To The Institute ${staffs.staffFirstName} ${staffs.staffLastName}`,
      institute,
    });
  } catch {
    console.log("error in staff Approval");
  }
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

app.get("/departmentimage/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/departmentimage/photo/:did",
  upload.single("file"),
  async (req, res) => {
    const { did } = req.params;
    const department = await Department.findById({ _id: did });
    if (department.photo) {
      await deleteFile(department.photo);
    }
    const width = 200;
    const height = 200;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    department.photo = results.key;
    department.photoId = "0";
    await department.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  }
);

app.get("/departmentimage/cover/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/departmentimage/coverphoto/:did",
  upload.single("file"),
  async (req, res) => {
    const { did } = req.params;
    const department = await Department.findById({ _id: did });
    if (department.cover) {
      await deleteFile(department.cover);
    }
    const width = 820;
    const height = 250;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    department.cover = results.key;
    department.coverId = "0";
    await department.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  }
);

app.get("/classimage/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post("/classimage/photo/:cid", upload.single("file"), async (req, res) => {
  const { cid } = req.params;
  const clas = await Class.findById({ _id: cid });
  if (clas.photo) {
    await deleteFile(clas.photo);
  }
  const width = 200;
  const height = 200;
  const file = req.file;
  const results = await uploadFile(file, width, height);
  clas.photo = results.key;
  clas.photoId = "0";
  await clas.save();
  await unlinkFile(file.path);
  res.status(201).send({ message: "updated photo" });
});

app.get("/classimage/cover/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/classimage/coverphoto/:cid",
  upload.single("file"),
  async (req, res) => {
    const { cid } = req.params;
    const clas = await Class.findById({ _id: cid });
    if (clas.cover) {
      await deleteFile(clas.cover);
    }
    const width = 820;
    const height = 250;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    clas.cover = results.key;
    clas.coverId = "0";
    await clas.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  }
);

////////////FOR THE FINANCE AND SPORTS/////////////////////////////

app.get("/financeimage/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/financeimage/photo/:fid",
  upload.single("file"),
  async (req, res) => {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid });
    if (finance.photo) {
      await deleteFile(finance.photo);
    }
    const width = 200;
    const height = 200;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    finance.photo = results.key;
    finance.photoId = "0";
    await finance.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  }
);

app.get("/financeimage/cover/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/financeimage/coverphoto/:fid",
  upload.single("file"),
  async (req, res) => {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid });
    if (finance.cover) {
      await deleteFile(finance.cover);
    }
    const width = 820;
    const height = 250;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    finance.cover = results.key;
    finance.coverId = "0";
    await finance.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  }
);
app.get("/sportimage/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post("/sportimage/photo/:sid", upload.single("file"), async (req, res) => {
  const { sid } = req.params;
  const sport = await Sport.findById({ _id: sid });
  if (sport.photo) {
    await deleteFile(sport.photo);
  }
  const width = 200;
  const height = 200;
  const file = req.file;
  const results = await uploadFile(file, width, height);
  sport.photo = results.key;
  sport.photoId = "0";
  await sport.save();
  await unlinkFile(file.path);
  res.status(201).send({ message: "updated photo" });
});

app.get("/sportimage/cover/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/sportimage/coverphoto/:sid",
  upload.single("file"),
  async (req, res) => {
    const { sid } = req.params;
    const sport = await Sport.findById({ _id: sid });
    if (sport.cover) {
      await deleteFile(sport.cover);
    }
    const width = 820;
    const height = 250;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sport.cover = results.key;
    sport.coverId = "0";
    await sport.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  }
);
app.get("/sportclassimage/photo/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/sportclassimage/photo/:scid",
  upload.single("file"),
  async (req, res) => {
    const { scid } = req.params;
    const sportClass = await SportClass.findById({ _id: scid });
    if (sportClass.photo) {
      await deleteFile(sportClass.photo);
    }
    const width = 200;
    const height = 200;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sportClass.photo = results.key;
    sportClass.photoId = "0";
    await sportClass.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  }
);

app.get("/sportclassimage/cover/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post(
  "/sportclassimage/coverphoto/:scid",
  upload.single("file"),
  async (req, res) => {
    const { scid } = req.params;
    const sportClass = await SportClass.findById({ _id: scid });
    if (sportClass.cover) {
      await deleteFile(sportClass.cover);
    }
    const width = 820;
    const height = 250;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sportClass.cover = results.key;
    sportClass.coverId = "0";
    await sportClass.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
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

  // console.log(department);
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

app.post("/addbatch/:did/ins/:id", isLoggedIn, async (req, res) => {
  try {
    const { did, id } = req.params;
    // console.log(req.body);
    const department = await Department.findById({ _id: did });
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await new Batch({ ...req.body });
    department.batches.push(batch);
    batch.department = department;
    batch.institute = institute;
    // console.log(batch);
    await department.save();
    await batch.save();
    res.status(200).send({ message: "batch data", batch });
  } catch {}
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
    depart.class.push(classRoom);
    classRoom.department = depart;
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
    populate: {
      path: "subject",
      populate: {
        path: "subjectName",
      },
    },
  });
  const subExamList = subject.subjectExams;

  res.status(200).send({ message: "Subject Exam List", subExamList });
});

// Route For Exam Creation
app.post(
  "/user/:id/department/function/exam/creation/:did/batch/:bid",
  // isLoggedIn,
  async (req, res) => {
    const { id, did, bid } = req.params;
    const { suid, examForClass, examName, examType, examMode, examWeight } =
      req.body;

    const batch = await Batch.findById({ _id: bid });
    const depart = await Department.findById({ _id: did });

    const newExam = await new Exam({
      examName: examName,
      examType: examType,
      examMode: examMode,
      examWeight: examWeight,
      batch: batch,
      examForDepartment: depart,
      examForClass: examForClass,
      subject: suid,
    });

    await newExam.save();
    batch.batchExam.push(newExam);
    await batch.save();
    depart.departmentExam.push(newExam);
    await depart.save();

    // Push Exam In ClassRoom
    let studentList = [];
    let arry = [];
    for (let i = 0; i < examForClass.length; i++) {
      const classRoomData = await Class.findById({
        _id: examForClass[i],
      }).populate({
        path: "subject",
        populate: {
          path: "subjectMasterName",
        },
      });

      classRoomData.classExam.push(newExam);
      classRoomData.save();

      // For Exam save in Subject
      let exSub = classRoomData.subject;
      let subArr = [];
      for (let j = 0; j < suid.length; j++) {
        let subjectObj = exSub.filter((e) => {
          return e.subjectMasterName._id == suid[j].subjectName;
        });

        for (let k = 0; k < subjectObj.length; k++) {
          subArr.push(subjectObj[k]);
        }
      }
      for (let i = 0; i < subArr.length; i++) {
        arry.push(subArr[i]);
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
        subjectMarks: suid,
      };
      stuData.studentMarks.push(studDataUpdate);
      stuData.save();
    }
    // Exam Push in Subject Model
    for (let i = 0; i < arry.length; i++) {
      let subId = arry[i]._id;
      sub = await Subject.findById({ _id: subId });
      sub.subjectExams.push(newExam);
      sub.save();
    }

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
// Marks Submit and Save of Student
app.post("/student/:sid/marks/:eid/:eSubid", async (req, res) => {
  const { sid, eid, eSubid } = req.params;
  const { obtainedMarks, subjectMarksStatus } = req.body;

  // console.log(sid, eid, eSubid, obtainedMarks, subjectMarksStatus);

  const student = await Student.findById({ _id: sid });
  const exam = await Exam.findById({ _id: eid });

  // // console.log(`Student Data:- ${student}`)
  // // console.log(`exam Data:- ${exam}`)

  let examListOfStudent = student.studentMarks;
  // Find Exam in List of Exam
  console.log(examListOfStudent);

  let exId;
  for (let i = 0; i < examListOfStudent.length; i++) {
    if (examListOfStudent[i].examId == eid) {
      return (exId = examListOfStudent[i]);
    }
  }

  // let examIndex = (examListOfStudent.map((e)=>{
  //   if (e.examId == eid){
  //     return e.examId
  //   }  }))

  // console.log(exId)
  // // Find Exam Subject in List of Exam Subjects
  // let examSubList = (examListOfStudent[examIndex].subjectMarks )
  // console.log(examSubList)

  // let examSubIndex = (examSubList.indexOf({ subjectName: `new ObjectId("${eSubid})`, }))+1

  // console.log(examSubIndex)
  // // let subIndex =
  // const examMarks = {
  //   examId: eid,
  //   examWeight: exam.examWeight,
  //   examTotalMarks: exam.totalMarks,
  //   examObtainMarks: marks,
  //   examMarksStatus: "Updated",
  // };
  // student.studentMarks.push(examMarks);
  // await student.save();
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
    const width = 200;
    const height = 200;
    const results = await uploadFile(file, width, height);
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
    const results = await uploadDocFile(file);
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
    const results = await uploadDocFile(file);
    const student = await Student.findById({ _id: sid });
    student.studentAadharCard = results.key;
    await student.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);

var date = new Date();
var p_date = date.getDate();
var p_month = date.getMonth() + 1;
var p_year = date.getFullYear();
if (p_month <= 10) {
  p_month = `0${p_month}`;
}
var c_date = `${p_year}-${p_month}-${p_date}`;

// Institute Student Approval By Class Teacher

app.post(
  "/ins/:id/student/:cid/approve/:sid/depart/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    const { id, sid, cid, did, bid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const student = await Student.findById({ _id: sid });
    const classes = await Class.findById({ _id: cid });
    const depart = await Department.findById({ _id: did });
    const batch = await Batch.findById({ _id: bid });
    student.studentStatus = req.body.status;
    institute.ApproveStudent.push(student);
    institute.student.splice(sid, 1);
    if (c_date <= institute.insFreeLastDate) {
      institute.insFreeCredit = institute.insFreeCredit + 1;
    }
    classes.ApproveStudent.push(student);
    classes.student.splice(sid, 1);
    student.studentGRNO = classes.ApproveStudent.length;
    student.studentROLLNO = classes.ApproveStudent.length;
    depart.ApproveStudent.push(student);
    student.department = depart;
    batch.ApproveStudent.push(student);
    student.batches = batch;
    await institute.save();
    await classes.save();
    await depart.save();
    await batch.save();
    await student.save();
    res.status(200).send({
      message: `Welcome To The Institute ${student.studentFirstName} ${student.studentLastName}`,
      institute,
      classes,
      depart,
      batch,
    });
  }
);

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

app.post("/student/report/finilized/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { examList, marksTotal, stBehaviourData } = req.body;
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
      // console.log(finalSubRe)
      finalreport.SubjectWiseMarks.push(finalSubRe);
    }
    // console.log(finalreport)
    student.studentFinalReportData = finalreport;
    (student.studentFinalReportFinalizedStatus = "Finalized"),
      await student.save();
    res
      .status(200)
      .send({ message: "Student Final Report is Ready.", student });
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
    const student = await Student.findById({ _id: studentId });
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
        path: "examId",
        populate: {
          path: "subject",
        },
      },
    })
    .populate("studentClass")
    .populate("attendDate")
    .populate("studentBehaviourStatus");
  // console.log(student)

  studentSubjects = student.studentClass.subject;
  examList = student.studentMarks;

  function subWiseExamFilter(eL, subL) {
    const filterList = [];
    for (let i = 0; i < subL.length; i++) {
      let newArray = eL.filter((ele) => {
        return (d = ele.examId.subject._id === subL[i]);
      });
      filterList.push(newArray);
    }
    return filterList;
  }

  const listWithFilter = subWiseExamFilter(examList, studentSubjects);

  res
    .status(200)
    .send({ message: "Student Detail Data", student, listWithFilter });
});
// Student Status Updated

app.post("/student/status", isLoggedIn, async (req, res) => {
  const { studentId } = req.body;
  const student = await Student.findById({ _id: studentId })
    .populate("studentFee")
    .populate("offlineFeeList");
  res.status(200).send({ message: "Student Detail Data", student });
});

// Staff Designation Data in members tab at User
// Staff Designation Data in members tab at User
app.get("/staffdesignationdata/:sid", isLoggedIn, async (req, res) => {
  const { sid } = req.params;
  const staff = await Staff.findById({ _id: sid })
    .populate("staffDepartment")
    .populate({
      path: "staffClass",
      populate: {
        path: "batch",
      },
    })
    .populate({
      path: "staffAdmissionAdmin",
      populate: {
        path: "institute",
        populate: {
          path: "depart",
          populate: {
            path: "batches",
          },
        },
      },
    })
    .populate({
      path: "staffSubject",
      populate: {
        path: "class",
        populate: {
          path: "batch",
        },
      },
    })
    .populate({
      path: "institute",
      // populate: {
      //   path: "batch",
      // },
    })
    .populate({
      path: "elearning",
    })
    .populate({
      path: "library",
    })
    .populate("financeDepartment")
    .populate("sportDepartment")
    .populate("staffSportClass");
  res.status(200).send({ message: "Staff Designation Data", staff });
});

// Student Designation Data in members Tab at users

app.get("/studentdesignationdata/:sid", async (req, res) => {
  const { sid } = req.params;
  const student = await Student.findById({ _id: sid })
    .populate({
      path: "studentClass",
      populate: {
        path: "ApproveStudent",
      },
    })
    .populate({
      path: "institute",
    })
    .populate({
      path: "user",
    })
    .populate("checklist")
    .populate({
      path: "department",
      populate: {
        path: "fees",
      },
    })
    .populate("studentFee")
    .populate({
      path: "department",
      populate: {
        path: "checklists",
      },
    })
    .populate({
      path: "sportEvent",
      populate: {
        path: "sportEventMatch",
        populate: {
          path: "sportEventMatchClass",
          populate: {
            path: "sportStudent",
          },
        },
      },
    })
    .populate("complaints");
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
    .populate({ path: "userBatch", populate: "classroom" })
    .populate({
      path: "studentComplaint",
      populate: {
        path: "student",
      },
    });
  res.status(200).send({ message: "Department Profile Data", department });
});

//Staff Class Info

app.get("/staffclass/:sid", async (req, res) => {
  const { sid } = req.params;
  const classes = await Class.findById({ _id: sid })
    .populate("subject")
    .populate("student")
    .populate({
      path: "ApproveStudent",
      populate: {
        path: "onlineFeeList",
      },
    })
    .populate({
      path: "institute",
      populate: {
        path: "financeDepart",
        populate: {
          path: "classRoom",
        },
      },
    })
    .populate({
      path: "ApproveStudent",
      populate: {
        path: "offlineFeeList",
      },
    })
    .populate({
      path: "batch",
    })
    .populate({
      path: "ApproveStudent",
      populate: {
        path: "onlineCheckList",
      },
    })
    .populate({
      path: "classTeacher",
    })
    .populate("fee")
    .populate("department")
    .populate({
      path: "ApproveStudent",
      populate: {
        path: "offlineCheckList",
      },
    })
    .populate("receieveFee")
    .populate("checklist")
    .populate("submitFee")
    .populate({
      path: "studentComplaint",
      populate: {
        path: "student",
      },
    })
    .populate({
      path: "studentLeave",
      populate: {
        path: "student",
      },
    })
    .populate({
      path: "studentTransfer",
      populate: {
        path: "student",
      },
    });
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

// Staff Batch Detail Data
app.get("/batch-detail/:bid", async (req, res) => {
  const { bid } = req.params;
  const batch = await Batch.findById({ _id: bid })
    .populate("classroom")
    .populate({
      path: "ApproveStudent",
      populate: {
        path: "batches",
      },
    })
    .populate("batchStaff")
    .populate({
      path: "ApproveStudent",
      populate: {
        path: "department",
      },
    })
    .populate({
      path: "institute",
    })
    .populate({
      path: "ApproveStudent",
      populate: {
        path: "studentClass",
      },
    });
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
  // console.log(req.params)
  const { feesId } = req.params;
  const feeData = await Fees.findById({ _id: feesId })
    .populate({
      path: "feeStudent",
    })
    .populate("studentsList")
    .populate({
      path: "feeDepartment",
    })
    .populate("offlineStudentsList");
  res.status(200).send({ message: "Fees Data", feeData });
});

app.post("/class/:cid/student/:sid/fee/:id", isLoggedIn, async (req, res) => {
  const { cid, sid, id } = req.params;
  const { status } = req.body;
  const classes = await Class.findById({ _id: cid });
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
    try {
      student.studentFee.push(fData);
      fData.feeStatus = status;
      fData.studentsList.push(student);
      fData.feeStudent = student;
      student.offlineFeeList.push(fData);
      fData.offlineStudentsList.push(student);
      fData.offlineFee += fData.feeAmount;
      await student.save();
      await fData.save();
      res.status(200).send({
        message: `${fData.feeName} received by ${student.studentFirstName}`,
        fData,
        student,
      });
    } catch {}
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
  // console.log(req.params);
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

// ========================= Finance Department =========================

app.post(
  "/ins/:id/staff/:sid/finance",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    const { id, sid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const finance = await new Finance({});
    staff.financeDepartment.push(finance);
    finance.financeHead = staff;
    institute.financeDepart.push(finance);
    finance.institute = institute;
    // console.log(finance)
    await institute.save();
    await staff.save();
    await finance.save();
    res.status(200).send({
      message: "Successfully Assigned Staff",
      finance,
      staff,
      institute,
    });
  }
);

app.post(
  "/finance/:fid/add/bank/details/:id",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { fid, id } = req.params;
      const {
        bankAccountHolderName,
        bankAccountNumber,
        bankIfscCode,
        bankAccountPhoneNumber,
      } = req.body;
      const finance = await Finance.findById({ _id: fid });
      const institute = await InstituteAdmin.findById({ _id: id });
      institute.bankAccountHolderName = bankAccountHolderName;
      institute.bankAccountNumber = bankAccountNumber;
      institute.bankIfscCode = bankIfscCode;
      institute.bankAccountPhoneNumber = bankAccountPhoneNumber;
      await institute.save();
      res.status(200).send({ message: "bank detail updated" });
    } catch {}
  }
);

app.post("/finance/ins/bank/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.bankAccountHolderName = "";
    institute.bankAccountNumber = "";
    institute.bankIfscCode = "";
    institute.bankAccountPhoneNumber = "";
    await institute.save();
    res.status(200).send({ message: "Bank Details Removed" });
  } catch {}
});

app.patch(
  "/finance/:fid/bank/details/:id/update",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id } = req.params;
      const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
      await institute.save();
      res.status(200).send({ message: "bank detail updated" });
    } catch {}
  }
);

app.get("/finance/detail/:id", async (req, res) => {
  const { id } = req.params;
  const finance = await Finance.findById({ _id: id })
    .populate({
      path: "financeHead",
    })
    .populate({
      path: "institute",
    })
    .populate("expenseDepartment")
    .populate({
      path: "classRoom",
      populate: {
        path: "classTeacher",
      },
    })
    .populate({
      path: "classRoom",
      populate: {
        path: "receieveFee",
      },
    })
    .populate("incomeDepartment")
    .populate("submitClassRoom");
  res.status(200).send({ message: "finance data", finance });
});

app.post("/staff/finance-info/:fid", isLoggedIn, async (req, res) => {
  const { fid } = req.params;
  const { financeAbout, financeEmail, financePhoneNumber } = req.body;
  const financeInfo = await Finance.findById({ _id: fid });
  financeInfo.financeAbout = financeAbout;
  financeInfo.financeEmail = financeEmail;
  financeInfo.financePhoneNumber = financePhoneNumber;
  await financeInfo.save();
  res.status(200).send({ message: "Finance Info Updates", financeInfo });
});

// ================================== Income part ==================================
app.post("/staff/:sid/finance/:fid/income", async (req, res) => {
  try {
    const { sid, fid } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const finance = await Finance.findById({ _id: fid });
    const incomes = await new Income({ ...req.body });
    finance.incomeDepartment.push(incomes);
    incomes.finances = finance;
    if (req.body.incomeAccount === "By Cash") {
      finance.financeSubmitBalance =
        finance.financeSubmitBalance + incomes.incomeAmount;
    } else if (req.body.incomeAccount === "By Bank") {
      finance.financeBankBalance =
        finance.financeBankBalance + incomes.incomeAmount;
    }
    // console.log(finance.financeBankBalance)
    await finance.save();
    await incomes.save();
    res.status(200).send({ message: "Add New Income", finance, incomes });
  } catch {}
});

app.post(
  "/finance/income/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const incomes = await Income.findById({ _id: sid });
    incomes.incomeAck = results.key;
    await incomes.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);

app.get("/finance/income/ack/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post("/all/incomes", async (req, res) => {
  const { queryStatus } = req.body;
  const income = await Income.find({ incomeAccount: queryStatus });
  res.status(200).send({ message: "cash data", income });
});

app.post("/all/bank/incomes", async (req, res) => {
  const { queryStatus } = req.body;
  const income = await Income.find({ incomeAccount: queryStatus });
  res.status(200).send({ message: "bank data", income });
});

// ======================== Expense Part ========================

app.post("/staff/:sid/finance/:fid/expense", isLoggedIn, async (req, res) => {
  try {
    const { sid, fid } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const finance = await Finance.findById({ _id: fid });
    const expenses = await new Expense({ ...req.body });
    finance.expenseDepartment.push(expenses);
    expenses.finances = finance;
    if (req.body.expenseAccount === "By Cash") {
      finance.financeSubmitBalance =
        finance.financeSubmitBalance - expenses.expenseAmount;
    } else if (req.body.expenseAccount === "By Bank") {
      finance.financeBankBalance =
        finance.financeBankBalance - expenses.expenseAmount;
    }
    await finance.save();
    await expenses.save();
    res.status(200).send({ message: "Add New Expense", finance, expenses });
  } catch {}
});

app.post(
  "/finance/expense/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const expenses = await Expense.findById({ _id: sid });
    expenses.expenseAck = results.key;
    await expenses.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  }
);

app.get("/finance/expense/ack/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post("/all/expenses", async (req, res) => {
  const { queryStatus } = req.body;
  const expense = await Expense.find({ expenseAccount: queryStatus });
  res.status(200).send({ message: "cash data", expense });
});

app.post("/all/bank/expenses", async (req, res) => {
  const { queryStatus } = req.body;
  const expense = await Expense.find({ expenseAccount: queryStatus });
  res.status(200).send({ message: "bank data", expense });
});

// app.post("/student/:sid/fee/:id/online", isLoggedIn, async (req, res) => {
//   const { sid, id } = req.params;
//   const { status } = req.body;
//   const student = await Student.findById({ _id: sid });
//   const fData = await Fees.findById({ _id: id });
//   if (
//     fData.studentsList.length >= 1 &&
//     fData.studentsList.includes(String(student._id))
//   ) {
//     res.status(200).send({
//       message: `${student.studentFirstName} paid the ${fData.feeName}`,
//     });
//   } else {
//     try {
//       student.studentFee.push(fData);
//       fData.feeStatus = status;
//       fData.studentsList.push(student);
//       fData.feeStudent = student;
//       student.onlineFeeList.push(fData);
//       await student.save();
//       await fData.save();
//       res.status(200).send({
//         message: `${fData.feeName} received by ${student.studentFirstName}`,
//         fData,
//         student,
//       });
//     } catch {}
//   }
// });

// app.post("/student/:sid/checklist/:id/online", isLoggedIn, async (req, res) => {
//   const { sid, id } = req.params;
//   const { status } = req.body;
//   const student = await Student.findById({ _id: sid });
//   const checklistData = await Checklist.findById({ _id: id });
//   if (
//     checklistData.studentsList.length >= 1 &&
//     checklistData.studentsList.includes(String(student._id))
//   ) {
//     res.status(200).send({
//       message: `${student.studentFirstName} paid the ${checklistData.checklistName}`,
//     });
//   } else {
//     try {
//       student.studentChecklist.push(checklistData);
//       checklistData.checklistFeeStatus = status;
//       checklistData.studentsList.push(student);
//       checklistData.checklistStudent = student;
//       student.onlineCheckList.push(checklistData);
//       await student.save();
//       await checklistData.save();
//       res.status(200).send({
//         message: `${checklistData.checklistName} received by ${student.studentFirstName}`,
//         checklistData,
//         student,
//       });
//     } catch {}
//   }
// });

app.post("/finance/all/fee/online/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const finance = await Finance.findById({ _id: id }).populate({
    path: "institute",
    populate: {
      path: "ApproveStudent",
    },
  });
  res
    .status(200)
    .send({ message: "all class data at finance manager", finance });
});

app.post("/class/:cid/total/online/fee", async (req, res) => {
  const { cid } = req.params;
  const { fee } = req.body;
  const classes = await Class.findById({ _id: cid });
  classes.onlineTotalFee = fee;
  await classes.save();
  res.status(200).send({ message: "class online total", classes });
});

app.post("/class/:cid/total/offline/fee", async (req, res) => {
  const { cid } = req.params;
  const { fee } = req.body;
  const classes = await Class.findById({ _id: cid });
  classes.offlineTotalFee = fee;
  await classes.save();
  res.status(200).send({ message: "class offline total", classes });
});

app.post("/class/:cid/total/collected/fee", async (req, res) => {
  const { cid } = req.params;
  const { fee } = req.body;
  const classes = await Class.findById({ _id: cid });
  classes.classTotalCollected = fee;
  await classes.save();
  res.status(200).send({ message: "class offline total", classes });
});

app.get("/finance/:fid/class/collect", async (req, res) => {
  const { fid } = req.params;
  const finance = await Finance.findById({ _id: fid })
    .populate({
      path: "institute",
      populate: {
        path: "ApproveStudent",
        populate: {
          path: "onlineCheckList",
        },
      },
    })
    .populate({
      path: "institute",
      populate: {
        path: "classRooms",
      },
    })
    .populate({
      path: "institute",
      populate: {
        path: "ApproveStudent",
        populate: {
          path: "onlineFeeList",
        },
      },
    });
  res.status(200).send({ message: "Class Data", finance });
});

// fee submit requested

app.post("/finance/:fid/class/:cid/fee/:id/receieve", async (req, res) => {
  try {
    const { fid, cid, id } = req.params;
    const { amount } = req.body;
    const finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid });
    const fee = await Fees.findById({ _id: id });
    finance.classRoom.push(classes);
    classes.receieveFee.push(fee);
    // classes.classTotalCollected = amount
    await finance.save();
    await classes.save();
    res.status(200).send({ message: "class submitted Data", finance });
  } catch {}
});

// fee submitted

app.post("/finance/:fid/class/:cid/fee/:id/submit", async (req, res) => {
  try {
    const { fid, cid, id } = req.params;
    const { fee } = req.body;
    const finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid }).populate(
      "ApproveStudent"
    );
    const fees = await Fees.findById({ _id: id });
    finance.classRoom.splice(classes, 1);
    finance.submitClassRoom.push(classes);
    classes.receieveFee.splice(fees, 1);
    classes.submitFee.push(fees);
    finance.financeSubmitBalance += fees.offlineFee;
    fees.offlineFee = 0;
    await classes.save();
    await finance.save();
    await fees.save();
    res.status(200).send({ message: "finance class submitted Data", finance });
  } catch {}
});

// fee incorrect

app.post("/finance/:fid/class/:cid/fee/incorrect", async (req, res) => {
  try {
    const { fid, cid } = req.params;
    const finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid });
    finance.classRoom.splice(classes, 1);
    finance.pendingClassRoom.push(classes);
    await finance.save();
    res.status(200).send({ message: "class submitted Data", finance });
  } catch {}
});

app.post("/finance/:fid/online/payment/updated", async (req, res) => {
  // console.log(req.params, req.body)
  try {
    const { fid } = req.params;
    const { balance } = req.body;
    const finance = await Finance.findById({ _id: fid });
    finance.financeBankBalance = balance;
    await finance.save();
    res.status(200).send({ message: "balance", finance });
  } catch {}
});

// ============================== Sport Department ==============================

app.post(
  "/ins/:id/staff/:sid/sport",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    const { id, sid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const sport = await new Sport({});
    staff.sportDepartment.push(sport);
    sport.sportHead = staff;
    institute.sportDepart.push(sport);
    sport.institute = institute;
    // console.log(finance)
    await institute.save();
    await staff.save();
    await sport.save();
    res.status(200).send({
      message: "Successfully Assigned Staff",
      sport,
      staff,
      institute,
    });
  }
);

app.get("/sport/detail/:id", async (req, res) => {
  const { id } = req.params;
  const sport = await Sport.findById({ _id: id })
    .populate({
      path: "sportHead",
    })
    .populate({
      path: "institute",
    })
    .populate({
      path: "sportClass",
      populate: {
        path: "sportStudent",
      },
    })
    .populate("sportEvent");
  res.status(200).send({ message: "sport data", sport });
});

app.post("/ins/:id/sport/:sid/class", async (req, res) => {
  try {
    const { id, sid } = req.params;
    const { staffId, sportClassName } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const sport = await Sport.findById({ _id: sid });
    const staff = await Staff.findById({ _id: staffId });
    const sportClasses = await new SportClass({
      sportClassName: sportClassName,
    });
    sport.sportClass.push(sportClasses);
    sportClasses.sportClassHead = staff;
    institute.sportClassDepart.push(sportClasses);
    sportClasses.institute = institute;
    staff.staffSportClass.push(sportClasses);
    sportClasses.sportDepartment = sport;
    await sport.save();
    await institute.save();
    await staff.save();
    await sportClasses.save();
    res.status(200).send({
      message: "Successfully Created Sport Class",
      sport,
      staff,
      sportClasses,
    });
  } catch {}
});

app.post("/sport/:sid/event", async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await Sport.findById({ _id: sid });
    const student = await Student.find({});
    const event = await new SportEvent({ ...req.body });
    sport.sportEvent.push(event);
    event.sportDepartment = sport;
    await sport.save();
    await event.save();
    for (let i = 0; i < student.length; i++) {
      student[i].sportEvent.push(event);
      await student[i].save();
    }
    res.status(200).send({ message: "Event Created", sport, event });
  } catch {}
});

app.post("/sport/info/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const { sportName, sportEmail, sportAbout, sportPhoneNumber } = req.body;
    const sport = await Sport.findById({ _id: sid });
    sport.sportName = sportName;
    sport.sportEmail = sportEmail;
    sport.sportAbout = sportAbout;
    sport.sportPhoneNumber = sportPhoneNumber;
    await sport.save();
    res.status(200).send({ message: "Sport Department Info Updated" });
  } catch {}
});

app.get("/event/detail/:id", async (req, res) => {
  const { id } = req.params;
  const event = await SportEvent.findById({ _id: id })
    .populate({
      path: "sportEventMatch",
      populate: {
        path: "sportEventMatchClass",
        populate: {
          path: "sportStudent",
        },
      },
    })
    .populate({
      path: "sportDepartment",
    })
    .populate({
      path: "sportEventMatch",
      populate: {
        path: "sportEvent",
      },
    })
    .populate({
      path: "sportEventMatch",
      populate: {
        path: "sportWinner",
      },
    })
    .populate({
      path: "sportEventMatch",
      populate: {
        path: "sportWinnerTeam",
      },
    })
    .populate({
      path: "sportEventMatch",
      populate: {
        path: "sportRunner",
      },
    })
    .populate({
      path: "sportEventMatch",
      populate: {
        path: "sportRunnerTeam",
      },
    });
  res.status(200).send({ message: "Event Detail", event });
});

app.post("/event/:eid/match", async (req, res) => {
  try {
    const { eid } = req.params;
    const {
      sportEventMatchName,
      sportEventMatchClass,
      sportEventMatchCategory,
      sportEventMatchCategoryLevel,
      sportEventMatchDate,
      sportInPlayer1,
      sportInPlayer2,
      sportTPlayer1,
      sportTPlayer2,
      sportPlayerFree,
    } = req.body;
    const event = await SportEvent.findById({ _id: eid });
    const classes = await SportClass.findById({
      _id: `${sportEventMatchClass}`,
    });
    var match = await new SportEventMatch({
      sportEventMatchName: sportEventMatchName,
      sportEventMatchCategory: sportEventMatchCategory,
      sportEventMatchDate: sportEventMatchDate,
      sportEventMatchCategoryLevel: sportEventMatchCategoryLevel,
    });
    match.sportEventMatchClass = classes;
    event.sportEventMatch.push(match);
    match.sportEvent = event;
    await event.save();
    await match.save();
    if (sportInPlayer1 !== "" && sportInPlayer2 !== "") {
      const student1 = await Student.findById({ _id: `${sportInPlayer1}` });
      const student2 = await Student.findById({ _id: `${sportInPlayer2}` });
      // student1.sportEventMatch.push(match);
      match.sportPlayer1 = student1;
      // student2.sportEventMatch.push(match);
      match.sportPlayer2 = student2;
      // await student1.save();
      // await student2.save();
      await match.save();
    } else if (sportTPlayer1 !== "" && sportTPlayer2 !== "") {
      const Team1 = await SportTeam.findById({ _id: `${sportTPlayer1}` });
      const Team2 = await SportTeam.findById({ _id: `${sportTPlayer2}` });
      // Team1.sportEventMatch.push(match);
      match.sportTeam1 = Team1;
      // Team2.sportEventMatch.push(match);
      match.sportTeam2 = Team2;
      // await Team1.save();
      // await Team2.save();
      await match.save();
    } else if (sportPlayerFree.length >= 1) {
      for (let i = 0; i < sportPlayerFree.length; i++) {
        const student = await Student.findById({
          _id: sportPlayerFree[i].studentId,
        });
        // student.sportEventMatch.push(match);
        match.sportFreePlayer.push(student);
        // await student.save();
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Created", event, match });
  } catch {}
});

app.post("/event/:eid/inter/match", async (req, res) => {
  try {
    const { eid } = req.params;
    const {
      sportEventMatchName,
      sportEventMatchClass,
      sportEventMatchCategory,
      sportEventMatchCategoryLevel,
      sportEventMatchDate,
      sportPlayer,
      sportTeam,
      sportPlayerFree,
    } = req.body;
    const event = await SportEvent.findById({ _id: eid });
    const classes = await SportClass.findById({
      _id: `${sportEventMatchClass}`,
    });
    var match = await new SportEventMatch({
      sportEventMatchName: sportEventMatchName,
      sportEventMatchCategory: sportEventMatchCategory,
      sportEventMatchDate: sportEventMatchDate,
      sportEventMatchCategoryLevel: sportEventMatchCategoryLevel,
    });
    match.sportEventMatchClass = classes;
    event.sportEventMatch.push(match);
    match.sportEvent = event;
    await event.save();
    await match.save();
    if (sportPlayer !== "") {
      const student1 = await Student.findById({ _id: `${sportPlayer}` });
      // student1.sportEventMatch.push(match);
      match.sportPlayer1 = student1;
      // await student1.save();
      await match.save();
    } else if (sportTeam !== "") {
      const Team1 = await SportTeam.findById({ _id: `${sportTeam}` });
      // Team1.sportEventMatch.push(match);
      match.sportTeam1 = Team1;
      // await Team1.save();
      await match.save();
    } else if (sportPlayerFree.length >= 1) {
      for (let i = 0; i < sportPlayerFree.length; i++) {
        const student = await Student.findById({
          _id: sportPlayerFree[i].studentId,
        });
        // student.sportEventMatch.push(match);
        match.sportFreePlayer.push(student);
        // await student.save();
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Created", event, match });
  } catch {}
});

app.get("/sport/class/detail/:cid", async (req, res) => {
  const { cid } = req.params;
  const classes = await SportClass.findById({ _id: cid })
    .populate("sportStudent")
    .populate({
      path: "sportClassHead",
    })
    .populate({
      path: "institute",
    })
    .populate({
      path: "sportDepartment",
    })
    .populate("sportTeam");
  res.status(200).send({ message: "Sport Class Data", classes });
});

app.post("/sport/class/:cid/student/:sid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await SportClass.findById({ _id: cid });
    const student = await Student.findById({ _id: sid });
    classes.sportStudent.push(student);
    student.sportClass = classes;
    await classes.save();
    await student.save();
    res
      .status(200)
      .send({ message: "Student added to sports class", classes, student });
  } catch {}
});

app.post("/sport/class/info/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const { sportClassEmail, sportClassAbout, sportClassPhoneNumber } =
      req.body;
    const classes = await SportClass.findById({ _id: sid });
    classes.sportClassEmail = sportClassEmail;
    classes.sportClassAbout = sportClassAbout;
    classes.sportClassPhoneNumber = sportClassPhoneNumber;
    await classes.save();
    res.status(200).send({ message: "Sport Class Info Updated" });
  } catch {}
});

app.get("/ins/approve/student/:id", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id }).populate(
    "ApproveStudent"
  );
  res.status(200).send({ message: "Approve Institute Data", institute });
});

app.post("/sport/class/:cid/student/:id/add", async (req, res) => {
  try {
    const { cid, id } = req.params;
    const classes = await SportClass.findById({ _id: cid });
    const student = await Student.findById({ _id: id });
    classes.sportStudent.push(student);
    student.sportClass = classes;
    await classes.save();
    await student.save();
    res.status(200).send({ message: "Student Added" });
  } catch {}
});

app.post("/sport/class/:cid/student/:id/remove", async (req, res) => {
  try {
    const { cid, id } = req.params;
    const classes = await SportClass.findById({ _id: cid });
    const student = await Student.findById({ _id: id });
    classes.sportStudent.splice(student, 1);
    student.sportClass = "";
    await classes.save();
    await student.save();
    res.status(200).send({ message: "Student Removed" });
  } catch {}
});

app.post("/sport/class/:cid/team", async (req, res) => {
  try {
    const { cid } = req.params;
    const { sportClassTeamName, sportStudentData } = req.body;
    const classes = await SportClass.findById({ _id: cid });
    var team = await new SportTeam({ sportClassTeamName: sportClassTeamName });
    for (let i = 0; i < sportStudentData.length; i++) {
      const student = await Student.findById({
        _id: sportStudentData[i].studentId,
      });
      team.sportTeamStudent.push(student);
      student.sportTeam = team;
      await team.save();
      await student.save();
    }
    classes.sportTeam.push(team);
    team.sportClass = classes;
    await classes.save();
    await team.save();
    res.status(200).send({ message: "Team Created", classes, team });
  } catch {
    console.log("something went wrong");
  }
});

app.get("/match/detail/:mid", async (req, res) => {
  const { mid } = req.params;
  const match = await SportEventMatch.findById({ _id: mid })
    .populate("sportFreePlayer")
    .populate({
      path: "sportEvent",
    })
    .populate({
      path: "sportPlayer1",
    })
    .populate({
      path: "sportTeam1",
    })
    .populate({
      path: "sportPlayer2",
    })
    .populate({
      path: "sportTeam2",
    })
    .populate({
      path: "sportEventMatchClass",
    });
  res.status(200).send({ message: "Match Data", match });
});

app.post("/match/:mid/update/individual", async (req, res) => {
  try {
    const { mid } = req.params;
    const { studentWinner, studentRunner } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const student1 = await Student.findById({ _id: `${studentWinner}` });
    const student2 = await Student.findById({ _id: `${studentRunner}` });
    match.sportWinner = student1;
    match.sportRunner = student2;
    match.matchStatus = "Completed";
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      student1.extraPoints += 25;
      student2.extraPoints += 15;
      await student1.save();
      await student2.save();
    }
    await match.save();
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {}
});

app.post("/match/:mid/update/inter/individual", async (req, res) => {
  try {
    const { mid } = req.params;
    const { studentPlayer, studentRankTitle, studentOpponentPlayer } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const student = await Student.findById({ _id: `${studentPlayer}` });
    match.sportOpponentPlayer = studentOpponentPlayer;
    match.matchStatus = "Completed";
    match.rankMatch = studentRankTitle;
    student.rankTitle = studentRankTitle;
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      if (studentRankTitle === "Winner") {
        student.extraPoints += 40;
        await student.save();
      } else if (studentRankTitle === "Runner") {
        student.extraPoints += 25;
        await student.save();
      }
    }
    await match.save();
    await student.save();
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {}
});

app.post("/match/:mid/update/team", async (req, res) => {
  try {
    const { mid } = req.params;
    const { teamWinner, teamRunner } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const team1 = await SportTeam.findById({ _id: `${teamWinner}` }).populate(
      "sportTeamStudent"
    );
    const team2 = await SportTeam.findById({ _id: `${teamRunner}` }).populate(
      "sportTeamStudent"
    );
    match.sportWinnerTeam = team1;
    match.sportRunnerTeam = team2;
    match.matchStatus = "Completed";
    await match.save();
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      team1.teamPoints += 25;
      team2.teamPoints += 15;
      await team1.save();
      await team2.save();
      for (let i = 0; i < team1.sportTeamStudent.length; i++) {
        const student1 = await Student.findById({
          _id: team1.sportTeamStudent[i]._id,
        });
        student1.extraPoints += 25;
        await student1.save();
      }
      for (let i = 0; i < team2.sportTeamStudent.length; i++) {
        const student2 = await Student.findById({
          _id: team2.sportTeamStudent[i]._id,
        });
        student2.extraPoints += 15;
        await student2.save();
      }
    }
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {}
});

app.post("/match/:mid/update/inter/team", async (req, res) => {
  try {
    const { mid } = req.params;
    const { teamPlayer, studentRankTitle, teamOpponentPlayer } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const team = await SportTeam.findById({ _id: `${teamPlayer}` }).populate(
      "sportTeamStudent"
    );
    match.sportOpponentPlayer = teamOpponentPlayer;
    match.matchStatus = "Completed";
    match.rankMatch = studentRankTitle;
    team.rankTitle = studentRankTitle;
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      if (studentRankTitle === "Winner") {
        team.teamPoints += 40;
        await team.save();
        for (let i = 0; i < team.sportTeamStudent.length; i++) {
          const student = await Student.findById({
            _id: team.sportTeamStudent[i]._id,
          });
          student.extraPoints += 40;
          await student.save();
        }
      } else if (studentRankTitle === "Runner") {
        team.teamPoints += 25;
        await team.save();
        for (let i = 0; i < team.sportTeamStudent.length; i++) {
          const student = await Student.findById({
            _id: team.sportTeamStudent[i]._id,
          });
          student.extraPoints += 25;
          await student.save();
        }
      }
    }
    await match.save();
    await team.save();
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {}
});

app.post("/match/:mid/update/free", async (req, res) => {
  try {
    const { mid } = req.params;
    const { studentWinner, studentRunner, studentParticipants } = req.body;
    var match = await SportEventMatch.findById({ _id: mid });
    const student1 = await Student.findById({ _id: `${studentWinner}` });
    const student2 = await Student.findById({ _id: `${studentRunner}` });
    match.sportWinner = student1;
    match.sportRunner = student2;
    match.matchStatus = "Completed";
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      student1.extraPoints += 25;
      student2.extraPoints += 15;
      await student1.save();
      await student2.save();
    }
    await match.save();
    if (studentParticipants.length >= 1) {
      for (let i = 0; i < studentParticipants.length; i++) {
        const student = await Student.findById({
          _id: studentParticipants[i].studentId,
        });
        match.sportParticipants.push(student);
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student.extraPoints += 5;
          await student.save();
        }
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Free Updated", match });
  } catch {}
});

app.post("/match/:mid/update/inter/free", async (req, res) => {
  try {
    const { mid } = req.params;
    const {
      studentPlayer,
      studentRankTitle,
      studentParticipants,
      studentOpponentPlayer,
    } = req.body;
    var match = await SportEventMatch.findById({ _id: mid });
    const student = await Student.findById({ _id: `${studentPlayer}` });
    match.sportOpponentPlayer = studentOpponentPlayer;
    match.rankMatch = studentRankTitle;
    match.matchStatus = "Completed";
    student.rankTitle = studentRankTitle;
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      if (studentRankTitle === "Winner") {
        student.extraPoints += 40;
        await student.save();
      } else if (studentRankTitle === "Runner") {
        student.extraPoints += 25;
        await student.save();
      }
    }
    await match.save();
    await student.save();
    if (studentParticipants.length >= 1) {
      for (let i = 0; i < studentParticipants.length; i++) {
        const student = await Student.findById({
          _id: studentParticipants[i].studentId,
        });
        match.sportInterParticipants.push(student);
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student.extraPoints += 5;
          await student.save();
        }
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Free Updated", match });
  } catch {}
});

// ============================ Leave And Transfer ===============================

app.get("/staff/:id/detail/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById({ _id: id }).populate({
      path: "institute",
    });
    res.status(200).send({ message: "Staff Leave Data", staff });
  } catch {}
});

app.get("/student/:id/detail/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id }).populate({
      path: "studentClass",
    });
    res.status(200).send({ message: "Student Leave Data", student });
  } catch {}
});

app.post("/staff/:sid/leave/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const leave = await new Leave({ ...req.body });
    institute.leave.push(leave);
    leave.institute = institute;
    staff.staffLeave.push(leave);
    leave.staff = staff;
    await institute.save();
    await staff.save();
    await leave.save();
    res
      .status(200)
      .send({ message: "request to leave", leave, staff, institute });
  } catch {}
});

app.post("/student/:sid/leave/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const student = await Student.findById({ _id: sid });
    const classes = await Class.findById({ _id: id });
    const leave = await new StudentLeave({ ...req.body });
    classes.studentLeave.push(leave);
    leave.fromClass = classes;
    student.leave.push(leave);
    leave.student = student;
    await classes.save();
    await student.save();
    await leave.save();
    res
      .status(200)
      .send({ message: "request to leave", leave, student, classes });
  } catch {}
});

app.post("/ins/:id/staff/leave/grant/:eid", async (req, res) => {
  try {
    const { id, eid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const leave = await Leave.findById({ _id: eid });
    leave.leaveStatus = status;
    await leave.save();
    res.status(200).send({ message: "Leave Granted", leave });
  } catch {}
});

app.post("/class/:id/student/leave/grant/:eid", async (req, res) => {
  try {
    const { id, eid } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: id });
    const leave = await StudentLeave.findById({ _id: eid });
    leave.leaveStatus = status;
    await leave.save();
    res.status(200).send({ message: "Leave Granted", leave });
  } catch {}
});

app.post("/ins/:id/staff/leave/reject/:eid", async (req, res) => {
  try {
    const { id, eid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const leave = await Leave.findById({ _id: eid });
    leave.leaveStatus = status;
    await leave.save();
    res.status(200).send({ message: "Leave Not Granted", leave });
  } catch {}
});

app.post("/class/:id/student/leave/reject/:eid", async (req, res) => {
  try {
    const { id, eid } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: id });
    const leave = await StudentLeave.findById({ _id: eid });
    leave.leaveStatus = status;
    await leave.save();
    res.status(200).send({ message: "Leave Not Granted", leave });
  } catch {}
});

app.post("/staff/:sid/transfer/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const transfer = await new Transfer({ ...req.body });
    institute.transfer.push(transfer);
    transfer.institute = institute;
    staff.staffTransfer.push(transfer);
    transfer.staff = staff;
    await institute.save();
    await staff.save();
    await transfer.save();
    res
      .status(200)
      .send({ message: "request to transfer", transfer, staff, institute });
  } catch {}
});

app.post("/student/:sid/transfer/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const student = await Student.findById({ _id: sid });
    const classes = await Class.findById({ _id: id });
    const transfer = await new StudentTransfer({ ...req.body });
    classes.studentTransfer.push(transfer);
    transfer.fromClass = classes;
    student.transfer.push(transfer);
    transfer.student = student;
    await classes.save();
    await student.save();
    await transfer.save();
    res
      .status(200)
      .send({ message: "request to transfer", transfer, student, classes });
  } catch {}
});

app.post("/ins/:id/staff/:sid/transfer/:ssid/grant/:eid", async (req, res) => {
  try {
    const { id, sid, ssid, eid } = req.params;
    const { status } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id }).populate({
      path: "depart",
      populate: {
        path: "batches",
        populate: {
          path: "batchStaff",
        },
      },
    });
    var staffNew = await Staff.findById({ _id: sid });
    var transfer = await Transfer.findById({ _id: eid });
    var transferStaff = await Staff.findById({ _id: ssid })
      .populate("staffDepartment")
      .populate("staffClass")
      .populate("staffSubject")
      .populate("financeDepartment")
      .populate("sportDepartment")
      .populate("staffSportClass");
    transfer.transferStatus = status;
    await transfer.save();
    for (let i = 0; i < transferStaff.staffDepartment.length; i++) {
      const department = await Department.findById({
        _id: transferStaff.staffDepartment[i]._id,
      });
      staffNew.staffDepartment.push(department);
      department.dHead = staffNew;
      transferStaff.staffDepartment.splice(department, 1);
      await staffNew.save();
      await department.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.staffClass.length; i++) {
      const classes = await Class.findById({
        _id: transferStaff.staffClass[i]._id,
      });
      staffNew.staffClass.push(classes);
      classes.classTeacher = staffNew;
      transferStaff.staffClass.splice(classes, 1);
      await staffNew.save();
      await classes.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.staffSubject.length; i++) {
      const subject = await Subject.findById({
        _id: transferStaff.staffSubject[i]._id,
      });
      staffNew.staffSubject.push(subject);
      subject.subjectTeacherName = staffNew;
      transferStaff.staffSubject.splice(subject, 1);
      await staffNew.save();
      await subject.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.financeDepartment.length; i++) {
      const finance = await Finance.findById({
        _id: transferStaff.financeDepartment[i]._id,
      });
      staffNew.financeDepartment.push(finance);
      finance.financeHead = staffNew;
      transferStaff.financeDepartment.splice(finance, 1);
      await staffNew.save();
      await finance.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.sportDepartment.length; i++) {
      const sport = await Sport.findById({
        _id: transferStaff.sportDepartment[i]._id,
      });
      staffNew.sportDepartment.push(sport);
      sport.sportHead = staffNew;
      transferStaff.sportDepartment.splice(sport, 1);
      await staffNew.save();
      await sport.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.staffSportClass.length; i++) {
      const sportClass = await SportClass.findById({
        _id: transferStaff.staffSportClass[i]._id,
      });
      staffNew.staffSportClass.push(sportClass);
      sportClass.sportClassHead = staffNew;
      transferStaff.staffSportClass.splice(sportClass, 1);
      await staffNew.save();
      await sportClass.save();
      await transferStaff.save();
    }
    if (
      institute.ApproveStaff.length >= 1 &&
      institute.ApproveStaff.includes(String(transferStaff._id))
    ) {
      institute.ApproveStaff.splice(transferStaff._id, 1);
      transferStaff.institute = "";
      await institute.save();
      await transferStaff.save();
    } else {
      console.log("Not To Leave");
    }
    // for(let i=0; i< institute.depart.length; i++){
    //   for(let j=0; j< i.batches.length; j++){
    //       const batchData = await Batch.findById({_id: i.batches[j]._id})
    //       batchData.batchStaff.splice(transferStaff, 1)
    //       batchData.batchStaff.push(staffNew)
    //       staffNew.batches = batchData
    //       await batchData.save()
    //       await staffNew.save()
    //   }
    // }
    res
      .status(200)
      .send({ message: "Transfer Granted", staffNew, transferStaff, transfer });
  } catch {}
});

app.post(
  "/class/:id/student/:sid/transfer/grant/:eid/department/:did/batch/:bid",
  async (req, res) => {
    try {
      const { id, sid, eid, did, bid } = req.params;
      const { status } = req.body;
      const classes = await Class.findById({ _id: id });
      var student = await Student.findById({ _id: sid });
      var transfer = await StudentTransfer.findById({ _id: eid });
      const department = await Department.findById({ _id: did });
      const batch = await Batch.findById({ _id: bid });
      transfer.transferStatus = status;
      classes.ApproveStudent.splice(student, 1);
      department.ApproveStudent.splice(student, 1);
      student.department = "";
      batch.ApproveStudent.splice(student, 1);
      await transfer.save();
      await classes.save();
      await department.save();
      await student.save();
      await batch.save();
      res.status(200).send({ message: "Transfer Granted", classes, transfer });
    } catch {}
  }
);

app.post("/ins/:id/staff/transfer/reject/:eid", async (req, res) => {
  try {
    const { id, eid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const transfer = await Transfer.findById({ _id: eid });
    transfer.transferStatus = status;
    await transfer.save();
    res.status(200).send({ message: "Transfer Not Granted", transfer });
  } catch {}
});

app.post("/class/:id/student/transfer/reject/:eid", async (req, res) => {
  try {
    const { id, eid } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: id });
    const transfer = await StudentTransfer.findById({ _id: eid });
    transfer.transferStatus = status;
    await transfer.save();
    res.status(200).send({ message: "Transfer Not Granted", transfer });
  } catch {}
});

app.post("/student/:sid/complaint", async (req, res) => {
  try {
    const { sid } = req.params;
    const { complaintHead, complaintType, complaintContent } = req.body;
    const department = await Department.findOne({ _id: complaintHead });
    const classes = await Class.findOne({ _id: complaintHead });
    if (department) {
      const student = await Student.findById({ _id: sid });
      const complaint = await new Complaint({
        complaintType: complaintType,
        complaintContent: complaintContent,
      });
      student.complaints.push(complaint);
      complaint.student = student;
      department.studentComplaint.push(complaint);
      complaint.department = department;
      await student.save();
      await department.save();
      await complaint.save();
      res
        .status(200)
        .send({ message: "Request To Department", complaint, student });
    } else if (classes) {
      const student = await Student.findById({ _id: sid });
      const complaint = await new Complaint({
        complaintType: complaintType,
        complaintContent: complaintContent,
      });
      student.complaints.push(complaint);
      complaint.student = student;
      classes.studentComplaint.push(complaint);
      complaint.classes = classes;
      await student.save();
      await classes.save();
      await complaint.save();
      res.status(200).send({ message: "Request To Class", complaint, student });
    } else {
    }
  } catch {}
});

app.post("/student/complaint/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const complaint = await Complaint.findById({ _id: id });
    complaint.complaintStatus = status;
    await complaint.save();
    res.status(200).send({ message: "Complaint Resolevd", complaint });
  } catch {}
});

app.post("/student/complaint/:id/institute/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const { status } = req.body;
    const complaint = await Complaint.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: iid });
    institute.studentComplaints.push(complaint);
    complaint.institute = institute;
    complaint.complaintInsStatus = status;
    await institute.save();
    await complaint.save();
    res
      .status(200)
      .send({ message: "Report To Institute", complaint, institute });
  } catch {}
});

app.post("/ins/:id/add/field", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const field = await new Field({ ...req.body });
    institute.idCardField.push(field);
    field.institute = institute;
    await institute.save();
    await field.save();
    res.status(200).send({ message: "field added" });
  } catch {}
});

// app.post("/ins/:id/id-card/export", async (req, res) => {
//   // console.log(req.params, req.body)
//   // , fieldText
//   try {
//     const { id } = req.params;
//     const { batchId } = req.body;
//     const institute = await InstituteAdmin.findById({ _id: id });
//     const admin = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
//     var batch = await Batch.findById({ _id: batchId });
//     if (
//       admin.instituteIdCardBatch.length >= 1 &&
//       admin.instituteIdCardBatch.includes(String(batchId))
//     ) {
//       console.log("yes");
//     } else {
//       institute.idCardBatch.push(batch);
//       admin.instituteIdCardBatch.push(batch);
//       await institute.save();
//       await admin.save();
//       res.status(200).send({ message: "export data", batch, institute, admin });
//     }
//   } catch {}
// });

app.post("/user/:id/user-post/:uid/report", async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reportStatus } = req.body;
    const user = await User.findById({ _id: id });
    const post = await UserPost.findById({ _id: uid });
    const admin = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
    const report = await new Report({ reportStatus: reportStatus });
    admin.reportList.push(report);
    report.reportUserPost = post;
    report.reportBy = user;
    await admin.save();
    await report.save();
    res.status(200).send({ message: "reported", report });
  } catch {}
});

app.post("/ins/:id/ins-post/:uid/report", async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reportStatus } = req.body;
    const user = await User.findById({ _id: id });
    const post = await Post.findById({ _id: uid });
    const admin = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
    const report = await new Report({ reportStatus: reportStatus });
    admin.reportList.push(report);
    report.reportInsPost = post;
    report.reportBy = user;
    await admin.save();
    await report.save();
    res.status(200).send({ message: "reported", report });
  } catch {}
});

app.patch("/sport/:sid/event/:eid/update", isLoggedIn, async (req, res) => {
  console.log(req.body);
  try {
    const { sid, eid } = req.params;
    const event = await SportEvent.findByIdAndUpdate(eid, req.body);
    await event.save();
    res.status(200).send({ message: "Event Updated", event });
  } catch {}
});

app.delete("/sport/:sid/event/:eid/delete", async (req, res) => {
  try {
    const { sid, eid } = req.params;
    var student = await Student.find({});
    for (let i = 0; i < student.length; i++) {
      if (
        student[i].sportEvent.length >= 1 &&
        student[i].sportEvent.includes(String(eid))
      ) {
        console.log("match");
        student[i].sportEvent.pull(eid);
        await student[i].save();
      } else {
      }
    }
    const sport = await Sport.findByIdAndUpdate(sid, {
      $pull: { sportEvent: eid },
    });
    const event = await SportEvent.findByIdAndDelete({ _id: eid });
    res.status(200).send({ message: "Deleted Event", sport, event });
  } catch {}
});

app.post("/ins/:id/id-card/:bid/send/print", async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
    admin.idCardPrinting.push(batch);
    batch.idCardStatus = status;
    await admin.save();
    await batch.save();
    res.status(200).send({ message: "Send for Printing", admin, batch });
  } catch {}
});

app.post("/ins/:id/id-card/:bid/un-send/print", async (req, res) => {
  try {
    const { id, bid } = req.params;
    // const { status } = req.body
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
    admin.idCardPrinting.splice(batch, 1);
    batch.idCardStatus = "";
    await admin.save();
    await batch.save();
    res.status(200).send({ message: "Un Send for Printing", admin, batch });
  } catch {}
});

app.post("/ins/:id/id-card/:bid/done", async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
    admin.idCardPrinted.push(batch);
    admin.idCardPrinting.splice(batch, 1);
    batch.idCardStatus = status;
    await admin.save();
    await batch.save();
    res.status(200).send({ message: "Id Card Printed", admin, batch });
  } catch {}
});

app.delete("/event/:eid/match/:mid/delete", async (req, res) => {
  try {
    const { eid, mid } = req.params;
    const event = await SportEvent.findById({ _id: eid });
    event.sportEventMatch.pull(mid);
    await event.save();
    const match = await SportEventMatch.findByIdAndDelete({ _id: mid });
    res.status(200).send({ message: "Deleted Event", sport, event });
  } catch {}
});

app.post("/user/:id/credit/transfer", async (req, res) => {
  try {
    const { id } = req.params;
    const { transferCredit, transferIns } = req.body;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: `${transferIns}` });
    institute.transferCredit =
      institute.transferCredit + parseInt(transferCredit);
    user.referalPercentage = user.referalPercentage - parseInt(transferCredit);
    user.transferInstitute.push(institute);
    await institute.save();
    await user.save();
    res.status(200).send({ message: "transfer", user });
  } catch {}
});

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

// ========================== Payment Portal ===========================

app.get("/student/detail/:sid/payment", async (req, res) => {
  const { sid } = req.params;
  const student = await Student.findById({ _id: sid });
  res.status(200).send({ message: "Student Data For Payment Portal", student });
});

app.get("/fee/detail/:fid/payment", async (req, res) => {
  try {
    const { fid } = req.params;
    const fee = await Fees.findById({ _id: fid });
    const checklist = await Checklist.findById({ _id: fid });
    if (fee) {
      res.status(200).send({ message: "Fee Data For Payment Portal", fee });
    } else if (checklist) {
      res
        .status(200)
        .send({ message: "Checklist Data For Payment Portal", checklist });
    } else {
    }
  } catch {}
});

app.get("/admin/all/payment/day", async (req, res) => {
  const payment = await Payment.find({});
  res.status(200).send({ message: "Data", payment });
});

app.get("/all/student/list/data", async (req, res) => {
  const student = await Student.find({}).populate({
    path: "institute",
  });
  res.status(200).send({ message: "Student data", student });
});

app.get("/all/user/list/data", async (req, res) => {
  const user = await User.find({});
  res.status(200).send({ message: "User data", user });
});

app.get("/admin/all/e-content/payment/day", async (req, res) => {
  const ePayment = await PlaylistPayment.find({});
  res.status(200).send({ message: "Data", ePayment });
});

app.get("/all/playlist/list/data", async (req, res) => {
  const playlist = await Playlist.find({}).populate({
    path: "elearning",
    populate: {
      path: "elearningHead",
    },
  });
  res.status(200).send({ message: "playlist data", playlist });
});

app.get("/all/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.find({ userId: `${id}` });
    res.status(200).send({ message: "pay", payment });
  } catch {}
});

app.get("/all/e-content/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ePayment = await PlaylistPayment.find({ userId: `${id}` });
    res.status(200).send({ message: "pay", ePayment });
  } catch {}
});

app.get("/all/fee/list/payment", async (req, res) => {
  const fee = await Fees.find({});
  res.status(200).send({ message: "Fee data", fee });
});

app.get("/all/checklist/list/payment", async (req, res) => {
  const checklist = await Checklist.find({});
  res.status(200).send({ message: "checklist data", checklist });
});

app.get("/all/institute/list/data", async (req, res) => {
  const institute = await InstituteAdmin.find({});
  res.status(200).send({ message: "Institute data", institute });
});

app.get("/all/batch/list/data", async (req, res) => {
  const batch = await Batch.find({});
  res.status(200).send({ message: "Batch data", batch });
});

app.get("/admin/all/id-card/payment/day", async (req, res) => {
  const iPayment = await IdCardPayment.find({});
  res.status(200).send({ message: "Data", iPayment });
});

app.get("/all/video/list/data", async (req, res) => {
  const video = await Video.find({});
  res.status(200).send({ message: "Video Data", video });
});

app.post("/user/:id/deactivate/account", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ddate } = req.body;
    const user = await User.findById({ _id: id });
    user.activeStatus = status;
    user.activeDate = ddate;
    await user.save();
    res.clearCookie("SessionID", { path: "/" });
    res.status(200).send({ message: "Deactivated Account", user });
  } catch {}
});

app.post("/user/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: "623b803ab9b2954fcea8328e" });
    const user = await User.findById({ _id: id });
    const feed = await new Feedback({});
    feed.rating = req.body.rating;
    feed.bestPart = req.body.bestPart;
    feed.worstPart = req.body.worstPart;
    feed.suggestion = req.body.suggestion;
    feed.user = user;
    admin.feedbackList.push(feed);
    await feed.save();
    await admin.save();
    res.status(200).send({ message: "Feedback" });
  } catch {}
});

app.post("/feedback/remind/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { remindDate } = req.body;
    const user = await User.findById({ _id: id });
    user.remindLater = remindDate;
    await user.save();
    res.status(200).send({ message: "Remind me Later" });
  } catch {}
});

// ======================================== Corridor ======================================
// app.get('/user/group/member/:id', async (req, res) =>{
//   const { id } = req.params
//   const user = await User.findById({_id: id})
//   .populate({
//     path: 'staff',
//     populate: {
//       path: 'joinedInsGroup'
//     }
//   })
//   .populate({
//     path: 'student',
//     // populate: {
//     //   path: 'joinedInsGroup'
//     // }
//   })
//   res.status(200).send({ message: 'member data', user})
// })

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
  // console.log(req.body);
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

var r_date = new Date();
var r_l_date = new Date(r_date);
r_l_date.setDate(r_l_date.getDate() + 21);
var r_l_day = r_l_date.getDate();
var r_l_month = r_l_date.getMonth() + 1;
var r_l_year = r_l_date.getFullYear();
if (r_l_month < 10) {
  r_l_month = `0${r_l_month}`;
}
var rDate = `${r_l_year}-${r_l_month}-${r_l_day}`;

app.post("/profile-creation/:id", async (req, res) => {
  const { id } = req.params;
  const admins = await Admin.findById({ _id: "623ecdcaa333699c3c9cd93c" });
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
        createdAt: c_date,
        remindLater: rDate,
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
    .populate("addUser")
    .populate("addUserInstitute")
    .populate({
      path: "student",
      populate: {
        path: "studentClass",
        populate: {
          path: "ApproveStudent",
        },
      },
    })
    .populate({
      path: "support",
      populate: {
        path: "user",
      },
    })
    .populate("videoPurchase");
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
    const results = await uploadDocFile(file);
    const user = await User.findById({ _id: id });
    const post = new UserPost({ ...req.body });
    post.imageId = "0";
    post.userCreateImage = results.key;
    // console.log("this is fronted post data : ", post);
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

////////////FOR THE VIDEO UPLOAD//////////////////////////////////

app.post(
  "/userdashboard/:id/user-post/video",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const results = await uploadVideo(file);
    const user = await User.findById({ _id: id });
    const post = new UserPost({ ...req.body });
    post.userCreateVideo = results.key;
    post.imageId = "1";
    user.userPosts.push(post);
    post.user = user._id;
    await user.save();
    await post.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Post Successfully Created", user });
  }
);

app.get("/userdashboard/user-post/video/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
////////////////////////////

app.put(
  "/userdashboard/:id/user-post/:uid/update",
  isLoggedIn,
  async (req, res) => {
    const { id, uid } = req.params;
    const { userPostStatus } = req.body;
    const userpost = await UserPost.findById({ _id: uid });
    userpost.userPostStatus = userPostStatus;
    await userpost.save();
    res.status(200).send({ message: "visibility change", userpost });
  }
);

app.delete(
  "/userdashboard/:id/user-post/:uid",
  isLoggedIn,
  async (req, res) => {
    const { id, uid } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { userPosts: uid } });
    await User.findByIdAndUpdate(id, { $pull: { saveUsersPost: uid } });
    await UserPost.findByIdAndDelete({ _id: uid });
    res.status(200).send({ message: "deleted Post" });
  }
);

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
    const width = 200;
    const height = 200;
    const results = await uploadFile(file, width, height);
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
    const width = 900;
    const height = 260;
    const results = await uploadFile(file, width, height);
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
  const user_sessions = req.session.user;
  const institute_sessions = req.session.institute;
  if (user_sessions) {
    userpost.userlike.splice(user_sessions._id, 1);
    await userpost.save();
    // console.log("delete");
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
  // console.log(req.params, req.body);
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
      user.conversation = newConversation;
      suser.conversation = newConversation;
      await user.save();
      await suser.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
    try {
      suser.userFollowing.splice(req.session.user._id, 1);
      user.userFollowers.splice(req.body.followId, 1);
      suser.userCircle.push(req.session.user._id);
      user.userCircle.push(req.body.followId);
      // console.log(id, ids)
      // console.log(suser, user.userFollowing)
      await user.save();
      await suser.save();
    } catch {
      res.status(500).send({ error: "error" });
    }
  }
});

app.put("/user/uncircle-ins", isLoggedIn, async (req, res) => {
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
      user.conversation = "";
      suser.conversation = "";
      // console.log(id, ids)
      // console.log(suser, user.userFollowing)
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

app.post("/user/save/post", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const user = await User.findById({ _id: req.session.user._id });
  const userPostsData = await UserPost.findById({ _id: postId });
  user.saveUsersPost.push(userPostsData);
  await user.save();
  res.status(200).send({ message: "Added To favourites", user });
});

app.post("/user/unsave/post", isLoggedIn, async (req, res) => {
  const { postId } = req.body;
  const user = await User.findById({ _id: req.session.user._id });
  const userPostsData = await UserPost.findById({ _id: postId });
  user.saveUsersPost.splice(userPostsData, 1);
  await user.save();
  res.status(200).send({ message: "Remove To favourites", user });
});

app.post("/user/phone/info/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { userPhoneNumber } = req.body;
  const user = await User.findById({ _id: id });
  user.userPhoneNumber = userPhoneNumber;
  await user.save();
  res.status(200).send({ message: "Mobile No Updated", user });
});

app.patch("/user/personal/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body);
    await user.save();
    res.status(200).send({ message: "Personal Info Updated", user });
  } catch {}
});

app.post("/user/:id/add/ins/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: iid });
    user.addUserInstitute.push(institute);
    institute.addInstituteUser.push(user);
    await user.save();
    await institute.save();
    res.status(200).send({ message: "Added", user, institute });
  } catch {}
});

app.post("/user/:id/add/user/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const userNew = await User.findById({ _id: iid });
    user.addUser.push(userNew);
    userNew.addUser.push(user);
    await user.save();
    await userNew.save();
    res.status(200).send({ message: "Added", user, userNew });
  } catch {}
});

app.post("/ins/:id/add/ins/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const instituteNew = await InstituteAdmin.findById({ _id: iid });
    institute.addInstitute.push(instituteNew);
    instituteNew.addInstitute.push(institute);
    await institute.save();
    await instituteNew.save();
    res.status(200).send({ message: "Added", institute, instituteNew });
  } catch {}
});

app.post("/ins/:id/add/user/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: iid });
    institute.addInstituteUser.push(user);
    user.addUserInstitute.push(institute);
    await institute.save();
    await user.save();
    res.status(200).send({ message: "Added", institute, user });
  } catch {}
});

////////////////////////////////////////////////////////////
//////////////////////////////////

////////////////////////////THIS IS E CONTENT API////////////////////////

// =========================================================== FOR ALL E CONTENT ROUTE =================================================
app.get("/insdashboard/:id/e-content", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id }).populate(
    "elearning"
  );
  res.status(200).send({ message: "data is fetched", institute });
});

app.post("/insdashboard/:id/e-content", async (req, res) => {
  const insId = req.params.id;
  const { sid } = req.body;
  const institute = await InstituteAdmin.findById({ _id: insId });
  const staff = await Staff.findById({ _id: sid });
  const elearning = new ELearning({
    elearningHead: sid,
    institute: insId,
    photoId: "1",
    coverId: "2",
  });
  institute.elearningActivate = "Activated";
  institute.elearning = elearning._id;
  staff.elearning.push(elearning._id);
  await institute.save();
  await staff.save();
  await elearning.save();
  res.status(200).send({ message: "E Learning is successfully is updated" });
});

app.get("/insdashboard/:id/e-content/info", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const elearning = await ELearning.findById({
    _id: institute.elearning,
  })
    .populate("elearningHead")
    .populate("playlist");
  res
    .status(200)
    .send({ message: "E Learning is successfully is updated", elearning });
});

////////////FOR AS THE USER ONLY////////////////////
app.get("/playlist", async (req, res) => {
  const playlist = await Playlist.find({}).populate({
    path: "topic",
    populate: {
      path: "video",
    },
  });
  res.status(200).send({ message: "fetched all details", playlist });
});

/////////////FOR THE USER SIDE//////////////////////

app.get("/e-content/:eid", async (req, res) => {
  const { eid } = req.params;
  const elearning = await ELearning.findById({ _id: eid }).populate({
    path: "institute",
    populate: {
      path: "classRooms",
    },
  });
  res
    .status(200)
    .send({ message: "E Learning is successfully is updated", elearning });
});

app.post("/e-content/:eid", async (req, res) => {
  const { eid } = req.params;
  const {
    emailId,
    phoneNumber,
    vision,
    mission,
    about,
    award,
    achievement,
    activities,
  } = req.body;
  const elearning = await ELearning.findById({
    _id: eid,
  });
  elearning.emailId = emailId;
  elearning.phoneNumber = phoneNumber;
  elearning.vision = vision;
  elearning.mission = mission;
  elearning.about = about;
  elearning.award = award;
  elearning.achievement = achievement;
  elearning.activities = activities;
  await elearning.save();
  res
    .status(200)
    .send({ message: "E Learning is successfully is updated", elearning });
});

app.get("/e-content/:eid/:photo", async (req, res) => {
  const photo = req.params.photo;
  const readStream = getFileStream(photo);
  readStream.pipe(res);
});

app.post("/e-content/:eid/photo", upload.single("file"), async (req, res) => {
  const { eid } = req.params;
  const file = req.file;
  const elearning = await ELearning.findById({ _id: eid });
  if (elearning.photo) {
    await deleteFile(elearning.photo);
  }
  const width = 200;
  const height = 200;
  const results = await uploadFile(file, width, height);
  elearning.photoId = "0";
  elearning.photo = results.key;
  await elearning.save();
  await unlinkFile(file.path);
  res.status(200).send({ message: "Photo is uploades" });
});

app.get("/e-content/:eid/:cover", async (req, res) => {
  const cover = req.params.cover;
  const readStream = getFileStream(cover);
  readStream.pipe(res);
});

app.post("/e-content/:eid/cover", upload.single("file"), async (req, res) => {
  const { eid } = req.params;
  const file = req.file;
  const elearning = await ELearning.findById({ _id: eid });
  if (elearning.cover) {
    await deleteFile(elearning.cover);
  }
  const width = 1000;
  const height = 260;
  const results = await uploadFile(file, width, height);
  // console.log(results);
  elearning.coverId = "0";
  elearning.cover = results.key;
  await elearning.save();
  await unlinkFile(file.path);
  res.status(200).send({ message: "Photo is uploades" });
});

///////////////////////////////////FOR MAKING THE PLAYLIST FUNCTIONALITY////////////////////////////
app.get("/:eid/playlist", async (req, res) => {
  const { eid } = req.params;
  const elearning = await ELearning.findById({ _id: eid }).populate({
    path: "playlist",
  });
  res.status(200).send({ message: "All playlist is fetched", elearning });
});

app.post("/:eid/playlist/create", upload.single("file"), async (req, res) => {
  const { eid } = req.params;
  const file = req.file;
  const width = 300;
  const height = 160;
  const results = await uploadFile(file, width, height);
  const playlist = new Playlist(req.body);
  const elearning = await ELearning.findById({ _id: eid });
  const classMe = await Class.findById({ _id: req.body.class });
  elearning.playlist.push(playlist._id);
  classMe.playlist.push(playlist._id);
  playlist.photo = results.key;
  playlist.elearning = eid;
  await classMe.save();
  await elearning.save();
  await playlist.save();
  await unlinkFile(file.path);
  res
    .status(200)
    .send({ message: "playlist is created successfully", playlist });
});

app.get("/playlist/thumbnail/:key", async (req, res) => {
  const { key } = req.params;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.get("/playlist/:pid", async (req, res) => {
  const { pid } = req.params;
  const playlist = await Playlist.findById({ _id: pid })
    .populate({
      path: "elearning",
      populate: {
        path: "institute",
        populate: {
          path: "classRooms",
        },
      },
    })
    .populate({
      path: "class",
    })
    .populate({
      path: "elearning",
      populate: {
        path: "institute",
        populate: {
          path: "financeDepart",
        },
      },
    });
  res.status(200).send({ message: "Single playlist is fetched", playlist });
});

app.patch("/playlist/:pid/edit", async (req, res) => {
  const { pid } = req.params;
  const playlist = await Playlist.findByIdAndUpdate(pid, req.body);
  playlist.save();
  res.status(201).send({ message: "Edited Successfull" });
});

app.put("/playlist/:pid/edit", upload.single("file"), async (req, res) => {
  const { pid } = req.params;
  const file = req.file;
  const playlist = await Playlist.findByIdAndUpdate(pid, req.body);
  if (playlist.photo) {
    await deleteFile(playlist.photo);
  }
  const width = 300;
  const height = 160;
  const results = await uploadFile(file, width, height);
  playlist.photo = results.key;
  await playlist.save();
  await unlinkFile(file.path);
  res.status(200).send({ message: "Edited Successfull" });
});

app.delete("/playlist/:pid", async (req, res) => {
  const { pid } = req.params;
  const playlist = await Playlist.findById({ _id: pid });
  const elearning = await ELearning.findById({ _id: playlist.elearning });
  elearning.playlist.pull(pid);
  for (let cls of playlist.class) {
    const clas = await Class.findById({ _id: cls });
    clas.playlist.pull(pid);
    await clas.save();
  }
  for (let join of playlist.joinNow) {
    const user = await User.findById({ _id: join });
    user.playlistJoin.pull(pid);
    await user.save();
  }
  for (let top of playlist.topic) {
    const topic = await Topic.findById({ _id: top });
    for (let vid of topic.video) {
      const video = await Video.findById({ _id: vid });
      for (let reso of video.resource) {
        const resource = await Resource.findById({ _id: reso });
        for (let keys of resource.resourceKeys) {
          const resKey = await ResourcesKey.findById({ _id: keys });
          if (resKey.resourceKey) {
            await deleteFile(resKey.resourceKey);
          }
          await ResourcesKey.deleteOne({ _id: keys });
        }
        await Resource.deleteOne({ _id: reso });
      }

      for (let vlik of video.userLike) {
        const user = await User.findById({ _id: vlik });
        user.videoLike.pull(vid);
      }
      for (let vsav of video.userSave) {
        const user = await User.findById({ _id: vsav });
        user.userSave.pull(vid);
      }
      for (let ucom of video.userComment) {
        await VideoComment.deleteOne({ _id: ucom });
      }

      if (video.video) {
        await deleteFile(video.video);
      }
      await Video.deleteOne({ _id: vid });
    }

    await Topic.deleteOne({ _id: top });
  }

  if (playlist.photo) {
    await deleteFile(playlist.photo);
  }
  await Playlist.deleteOne({ _id: pid });
  // await Playlist.findByIdAndDelete({ _id: pid });
  await elearning.save();
  res.status(201).send({ message: "playlist is deleted:" });
});

//////////////////FOR THE TOPIC ADD AND RETRIEVE /////////////////
app.get("/playlist/:pid/topic", async (req, res) => {
  const { pid } = req.params;
  const playlist = await Playlist.findById({ _id: pid }).populate({
    path: "topic",
    populate: {
      path: "video",
    },
  });

  res.status(200).send({ message: "playlist is fetched ", playlist });
});

app.post("/playlist/:pid/topic", async (req, res) => {
  const { pid } = req.params;
  const topic = new Topic(req.body);
  const playlist = await Playlist.findById({ _id: pid });
  playlist.topic.push(topic._id);
  topic.playlist = pid;
  await topic.save();
  await playlist.save();
  res.status(200).send({ message: "topic is Created " });
});

//////////////////////////////FOR THE UPLOAD VIDEO/////////////////////

app.post("/topic/:tid/upload", upload.single("file"), async (req, res) => {
  const { tid } = req.params;
  const file = req.file;
  const fileStream = fs.createReadStream(file.path);
  const videoTime = await getVideoDurationInSeconds(fileStream);
  const time = new Date(videoTime * 1000).toISOString().slice(11, 16);
  const timeInHour = videoTime / 3600;
  const results = await uploadVideo(file);
  const { name, price, access } = req.body;
  const topic = await Topic.findById({ _id: tid }).populate({
    path: "playlist",
  });
  const playlist = await Playlist.findById({ _id: topic.playlist._id });
  const videoName =
    topic.playlist.name + " | " + topic.topicName + " | " + name;
  const videoKey = results.Key;
  const video = new Video({
    name: videoName,
    videoName: file.originalname,
    access: access,
    video: videoKey,
    price: price,
    topic: tid,
    videoTime: time,
    fileName: name,
  });
  topic.video.push(video._id);
  playlist.time = playlist.time + timeInHour;
  playlist.lecture = playlist.lecture + 1;
  await playlist.save();
  await topic.save();
  await video.save();
  await unlinkFile(file.path);
  res.status(200).send({ message: "video is uploaded " });
});

app.get("/oneVideo/:vid", async (req, res) => {
  const { vid } = req.params;
  const video = await Video.findById({ _id: vid }).populate({
    path: "resource",
    populate: {
      path: "resourceKeys",
    },
  });
  res.status(200).send({ message: "video fetched", video });
});

app.patch("/oneVideo/:vid", async (req, res) => {
  const { vid } = req.params;
  const video = await Video.findByIdAndUpdate(vid, req.body.formData);
  await video.save();
});
app.put("/oneVideo/:vid", upload.single("file"), async (req, res) => {
  const { vid } = req.params;
  const file = req.file;
  const video = await Video.findById({ _id: vid });
  const fileStream = fs.createReadStream(file.path);
  const videoTime = await getVideoDurationInSeconds(fileStream);
  const time = new Date(videoTime * 1000).toISOString().slice(11, 16);
  video.videoTime = time;
  video.videoName = file.originalname;
  video.name = req.body.name;
  video.price = req.body.price;
  video.access = req.body.access;
  video.fileName = req.body.name;
  await deleteFile(video.video);
  const results = await uploadVideo(file);
  video.video = results.Key;
  await video.save();
  res.status(201).send({ message: "video updated successfully" });
});

app.delete("/oneVideo/:vid", async (req, res) => {
  const { vid } = req.params;
  const video = await Video.findById({ _id: vid });
  const topic = await Topic.findById({ _id: video.topic });
  topic.video.pull(vid);
  for (let like of video.userLike) {
    const user = await User.findById({ _id: like });
    user.videoLike.pull(vid);
    await user.save();
  }

  for (let sav of video.userSave) {
    const user = await User.findById({ _id: sav });
    user.videoSave.pull(vid);
    await user.save();
  }

  for (let sav of video.userComment) {
    await VideoComment.deleteOne({ _id: sav });
  }
  await deleteFile(video.video);
  await topic.save();
  await Video.deleteOne({ _id: vid });
  res.status(201).send({ message: "video is deleted" });
});
app.get("/video/:key", async (req, res) => {
  const { key } = req.params;
  const readStream = await getFileStream(key);
  readStream.pipe(res);
});
/////////////////////////////EXTRACT ALL VIDEO FROM PLAYLIST/////////////////////

app.get("/playlist/:pid", async (req, res) => {
  const { pid } = req.params;
  const playlist = await Playlist.findById({ _id: pid }).populate({
    path: "video",
  });
  res.status(200).send({ message: "all video is fetched", playlist });
});

app.get("/playlist/video/:key", async (req, res) => {
  const { key } = req.params;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

////////////////////FOR THE RESOURCES ONLY ////////////////////////////////

app.post("/video/:vid/resource", upload.array("file"), async (req, res) => {
  const { vid } = req.params;
  const resource = new Resource({ name: req.body.name });
  for (let file of req.files) {
    const results = await uploadDocFile(file);
    const fileKey = new ResourcesKey({ resourceName: file.originalname });
    fileKey.resourceKey = results.key;
    resource.resourceKeys.push(fileKey._id);
    await fileKey.save();
    await unlinkFile(file.path);
  }
  const video = await Video.findById({ _id: vid });
  video.resource = resource._id;
  await video.save();
  await resource.save();
  res.status(200).send({ message: "Resources is added" });
});

app.get("/resource/:key", async (req, res) => {
  const { key } = req.params;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

//////////////////////FOR USER SIDE LIKE AND SAVE FUNCTIONALITY////////////

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.status(201).send({ message: "data is fetched", user });
});
app.get("/video/:vid/comment", async (req, res) => {
  const { vid } = req.params;
  const comment = await Video.findById({ _id: vid })
    .populate({
      path: "userComment",
      populate: {
        path: "user",
      },
    })
    .populate({
      path: "userComment",
      populate: {
        path: "video",
      },
    });
  res.status(200).send({ message: "comment is fetched", comment });
});

app.post("/:id/video/:vid/comment", async (req, res) => {
  const { id, vid } = req.params;
  // console.log(req.body);
  const comment = new VideoComment(req.body);
  const video = await Video.findById({ _id: vid });
  video.userComment.push(comment._id);
  comment.user = id;
  comment.video = vid;
  await video.save();
  await comment.save();
  res.status(200).send({ message: "commented" });
});
app.get("/video/alllike/:vid", async (req, res) => {
  const { vid } = req.params;
  const like = await Video.findById({ _id: vid });
  res.status(200).send({ message: "all liked fetched", like });
});

app.post("/user/:id/video/:vid/like", async (req, res) => {
  const { vid } = req.params;
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  const video = await Video.findById({ _id: vid });
  video.userLike.push(id);
  user.videoLike.push(vid);
  await user.save();
  await video.save();
  res.status(200).send({ message: "Like video" });
});
app.post("/user/:id/video/:vid/unlike", async (req, res) => {
  const { id, vid } = req.params;
  const video = await Video.findById({ _id: vid });
  const user = await User.findById({ _id: id });
  user.videoLike.splice(vid, 1);
  video.userLike.splice(id, 1);
  await user.save();
  await video.save();
  res.status(200).send({ message: "unLike video" });
});

app.get("/video/allbookmark/:vid", async (req, res) => {
  const { vid } = req.params;
  const bookmark = await Video.findById({ _id: vid });
  res.status(200).send({ message: "all saved fetched", bookmark });
});
app.post("/user/:id/video/:vid/bookmark", async (req, res) => {
  const { id, vid } = req.params;
  const user = await User.findById({ _id: id });
  const video = await Video.findById({ _id: vid });
  video.userSave.push(id);
  user.videoSave.push(vid);
  await user.save();
  await video.save();
  res.status(200).send({ message: "Save video" });
});
app.post("/user/:id/video/:vid/unbookmark", async (req, res) => {
  const { id, vid } = req.params;
  // console.log(id, vid);
  const video = await Video.findById({ _id: vid });
  const user = await User.findById({ _id: id });
  user.videoSave.splice(vid, 1);
  video.userSave.splice(id, 1);
  // console.log(video.userSave);
  await user.save();
  await video.save();
  res.status(200).send({ message: "unSave video" });
});

//////////////////////////FOR USER SIDE ALL SAVE AND LIKE Functionality///////////////

app.get("/user/:id/userside", async (req, res) => {
  const { id } = req.params;
  const userSide = await User.findById({ _id: id })
    .populate({
      path: "videoLike",
      populate: {
        path: "topic",
        populate: {
          path: "playlist",
        },
      },
    })
    .populate({
      path: "videoSave",
      populate: {
        path: "topic",
        populate: {
          path: "playlist",
        },
      },
    })
    .populate({
      path: "playlistJoin",
    });
  res.status(200).send({ message: "all detail fetched", userSide });
});

///////////User PLAYLIST JOIN////////////////////
// app.post("/user/:id/playlist/:pid/join", async (req, res) => {
//   const { id, pid } = req.params;
//   const playlist = await Playlist.findById({ _id: pid });
//   const user = await User.findById({ _id: id });
//   playlist.joinNow.push(id);
//   playlist.salse = playlist.salse + 1;
//   playlist.enroll = playlist.enroll + 1;
//   user.playlistJoin.push(pid);
//   await user.save();
//   await playlist.save();
//   res.status(200).send({ message: "you have joined playlist" });
// });

//////////////////////////FOR LIBRARY ////////////////////////////////

app.get("/insdashboard/:id/library", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id }).populate(
    "library"
  );
  res.status(200).send({ message: "data is fetched", institute });
});

app.post("/insdashboard/:id/library", async (req, res) => {
  const insId = req.params.id;
  const { sid } = req.body;
  const institute = await InstituteAdmin.findById({ _id: insId });
  const staff = await Staff.findById({ _id: sid });
  const library = new Library({
    libraryHead: sid,
    institute: insId,
    photoId: "1",
    coverId: "2",
  });
  institute.libraryActivate = "Activated";
  institute.library = library._id;
  staff.library.push(library._id);
  await institute.save();
  await staff.save();
  await library.save();
  res.status(200).send({ message: "Library is successfully is updated" });
});

app.get("/insdashboard/:id/library/info", async (req, res) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  const library = await Library.findById({
    _id: institute.library,
  })
    .populate("libraryHead")
    .populate("books");
  res
    .status(200)
    .send({ message: "Library is successfully is updated", library });
});

app.get("/library/allbook", async (req, res) => {
  const library = await Book.find({});
  res.status(200).send({ message: "fetched", library });
});
/////////////FOR THE USER SIDE//////////////////////

app.get("/library/:lid", async (req, res) => {
  const { lid } = req.params;
  const library = await Library.findById({ _id: lid })
    .populate({
      path: "members",
    })
    .populate({
      path: "books",
    })
    .populate({
      path: "issues",
      populate: {
        path: "book",
      },
    })
    .populate({
      path: "issues",
      populate: {
        path: "member",
      },
    })
    .populate({
      path: "collects",
      populate: {
        path: "book",
      },
    })
    .populate({
      path: "collects",
      populate: {
        path: "member",
      },
    })
    .populate({
      path: "institute",
      populate: {
        path: "ApproveStudent",
      },
    });
  res
    .status(200)
    .send({ message: "Library is successfully is fetched", library });
});

app.post("/library/:lid/about", async (req, res) => {
  const { lid } = req.params;
  const { emailId, phoneNumber, about } = req.body;
  console.log(req.body);
  const library = await Library.findById({
    _id: lid,
  });
  library.emailId = emailId;
  library.phoneNumber = phoneNumber;
  library.about = about;
  await library.save();
  res.status(200).send({ message: "Library is successfully is updated" });
});

app.get("/library/:lid/:photo", async (req, res) => {
  const photo = req.params.photo;
  const readStream = getFileStream(photo);
  readStream.pipe(res);
});
app.post("/library/:lid/photo", upload.single("file"), async (req, res) => {
  const { lid } = req.params;
  const file = req.file;
  const library = await Library.findById({ _id: lid });
  if (library.photo) {
    await deleteFile(library.photo);
  }
  const width = 200;
  const height = 200;
  const results = await uploadFile(file, width, height);
  library.photoId = "0";
  library.photo = results.key;
  await library.save();
  await unlinkFile(file.path);
  res.status(200).send({ message: "Photo is uploades" });
});
app.get("/library/:lid/:cover", async (req, res) => {
  const cover = req.params.cover;
  const readStream = getFileStream(cover);
  readStream.pipe(res);
});

app.post("/library/:lid/cover", upload.single("file"), async (req, res) => {
  const { lid } = req.params;
  const file = req.file;
  const library = await Library.findById({ _id: lid });
  if (library.cover) {
    await deleteFile(library.cover);
  }
  const width = 1000;
  const height = 260;
  const results = await uploadFile(file, width, height);
  library.coverId = "0";
  library.cover = results.key;
  await library.save();
  await unlinkFile(file.path);
  res.status(200).send({ message: "Photo is uploades" });
});

////////////////////FOR THE LIBRARY BOOKS ONLY ///////////////////////

app.post(
  "/library/:lid/create-book",
  upload.single("file"),
  async (req, res) => {
    const { lid } = req.params;
    const file = req.file;
    const width = 150;
    const height = 150;
    const results = await uploadFile(file, width, height);
    const book = new Book(req.body);
    const library = await Library.findById({ _id: lid });
    library.books.push(book._id);
    book.library = lid;
    book.photo = results.key;
    book.photoId = "0";
    await library.save();
    await book.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "book is created" });
  }
);

app.get("/book/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.get("/onebook/:bid", async (req, res) => {
  const { bid } = req.params;
  const book = await Book.findById({ _id: bid });
  res.status(200).send({ message: "fetched", book });
});
app.post(
  "/library/:lid/edit-book/:bid",
  upload.single("file"),
  async (req, res) => {
    const { bid } = req.params;
    const {
      bookName,
      author,
      totalPage,
      language,
      publication,
      price,
      totalCopies,
      shellNumber,
    } = req.body;
    const file = req.file;
    const width = 150;
    const height = 150;
    // console.log(req.body);
    const book = await Book.findById({ _id: bid });
    // if (book.photo) {
    //   await deleteFile(book.photo);
    // }
    const results = await uploadFile(file, width, height);
    book.photo = results.key;
    book.bookName = bookName;
    book.author = author;
    book.totalPage = totalPage;
    book.language = language;
    book.publication = publication;
    book.totalCopies = totalCopies;
    book.shellNumber = shellNumber;
    book.price = price;
    await book.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "book is updated" });
  }
);

app.delete("/library/:lid/book/:bid", async (req, res) => {
  const { bid } = req.params;
  const book = await Book.findById({ _id: bid });
  if (book.totalCopies > 0) {
    book.totalCopies = book.totalCopies - 1;
    await book.save();
  }
  // const library = await Library.findById({ _id: lid });
  // await deleteFile(book.photo);
  // await Book.deleteOne({ _id: bid });
  // library.books.pull(bid);
  // await library.save();
  res.status(200).send({ message: "book is deleted" });
});

app.post("/library/:lid/issue", async (req, res) => {
  const { lid } = req.params;
  const { member, book } = req.body;
  // console.log(req.body);
  const library = await Library.findById({ _id: lid });
  const student = await Student.findById({ _id: member });
  const bookData = await Book.findById({ _id: book });
  const issue = new Issue(req.body);
  student.borrow.push(issue._id);
  library.issues.push(issue._id);
  library.members.push(member);
  issue.library = lid;
  bookData.totalCopies = bookData.totalCopies - 1;
  await student.save();
  await library.save();
  await issue.save();
  await bookData.save();
  res.status(200).send({ message: "book is issued" });
});

///////////////////FOR COLLECT THE BOOK/////////////////////

app.post("/library/:lid/collect/:cid", async (req, res) => {
  const { lid, cid } = req.params;
  const issue = await Issue.findById({ _id: cid });
  const library = await Library.findById({ _id: lid });
  const book = await Book.findById({ _id: issue.book });
  const collect = new Collect({
    book: issue.book,
    member: issue.member,
    library: issue.library,
  });
  const student = await Student.findById({ _id: issue.member });
  student.deposite.push(collect._id);
  student.borrow.pull(cid);
  library.issues.pull(cid);
  library.collects.push(collect._id);
  collect.library = lid;
  book.totalCopies = book.totalCopies + 1;
  await book.save();
  await student.save();
  await library.save();
  await collect.save();
  res.status(200).send({ message: "book is collected" });
});

/////////FOR BORROW BOOK/////////////////////////////

app.get("/user/:id/borrow", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id }).populate({
    path: "student",
  });
  res.status(200).send({ user });
});
app.get("/student/:id/borrow", async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById({ _id: id })
    .populate({
      path: "borrow",
      populate: {
        path: "book",
      },
    })
    .populate({
      path: "deposite",
      populate: {
        path: "book",
      },
    });
  res.status(200).send({ student });
});

// ============================ Vaibhav Admission Part ===========================
// institute Admission Admin Allotting

// Is Rought per status wapas nahi jaa raha hai...(important)
app.post(
  "/ins/:id/new-admission-admin",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    const { id } = req.params;
    const { sid } = req.body;
    const staff = await Staff.findById({ _id: sid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const admissionAdmin = await new AdmissionAdmin({ ...req.body });

    institute.insAdmissionAdmin = admissionAdmin;
    institute.insAdmissionAdminStatus = "Alloted";
    admissionAdmin.institute = institute;
    admissionAdmin.adAdminName = staff;
    staff.staffAdmissionAdmin.push(admissionAdmin);
    await institute.save();
    await staff.save();
    await admissionAdmin.save();

    console.log(`Admission Admin Successfully Alloted`);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      admissionAdmin,
      staff,
      institute,
    });
  }
);
app.get("/admission-applications-details/:sid", async (req, res) => {
  console.log("/admission-applications-details/:sid");
  const { sid } = req.params;
  try {
    if (sid) {
      const staffText = await Staff.findById({ _id: sid });
      adId = staffText.staffAdmissionAdmin[0];
      const adAdminData = await AdmissionAdmin.findById({ _id: adId })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationForDepartment",
            populate: {
              path: "batches",
            },
          },
        })
        .populate("institute")
        .populate("adAdminName")
        // .populate("applicationForDepartment")
        .populate({
          path: "departmentApplications",
          populate: {
            path: "studentData",
            // populate: {
            // path: "studentDetails",
            // populate: {
            //   path: "userId"
            // },
            // },
          },
        });
      res
        .status(200)
        .send({ message: "Department Application List", adAdminData });
    } else {
    }
  } catch {}
});

// // find Admission Admin form ins Id
app.get("/admission-applications/details/:iid", async (req, res) => {
  console.log("/admission-applications/details/:iid");
  const { iid } = req.params;
  const institute = await InstituteAdmin.findById({ _id: iid });

  try {
    if (institute.insAdmissionAdmin) {
      const adAdminData = await AdmissionAdmin.findById({
        _id: institute.insAdmissionAdmin._id,
      })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "batch",
          },
        })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationForDepartment",
          },
        });
      res
        .status(200)
        .send({ message: "Applications List Detail", adAdminData });
    } else {
      res.status(204).send({ message: "Applications Details Not Found" });
    }
  } catch {}
});

app.post("/admission-application/:sid", isLoggedIn, async (req, res) => {
  console.log("/admission-application/:sid");
  const { sid } = req.params;
  const { applicationData } = req.body;
  const newApplication = await new DepartmentApplication(applicationData);
  const staffText = await Staff.findById({ _id: sid });
  const adAdminText = await AdmissionAdmin.findById({
    _id: staffText.staffAdmissionAdmin[0],
  });
  await adAdminText.departmentApplications.push(newApplication._id);
  await newApplication.save();
  await adAdminText.save();
  console.log("Application Created Sucessfully");
  res.status(200).send({ message: "Application Save Successfully" });
});
app.post(
  "/admission-application/:aid/student-apply/:id",
  isLoggedIn,
  async (req, res) => {
    console.log("/admission-application/:aid/student-apply/:id");
    const { aid, id } = req.params;
    const { formData } = req.body;
    const userText = await User.findById({ _id: id });
    const newPreStudent = await new PreAppliedStudent(formData);
    const dAppliText = await DepartmentApplication.findById({
      _id: aid,
    }).populate({
      path: "applicationForDepartment",
      populate: {
        path: "institute",
      },
    });
    const appForAppli = {
      appName: aid,
      appUpdates: [],
    };
    const notify = `You have applied in ${dAppliText.applicationForDepartment.institute.insName} for ${dAppliText.applicationForDepartment.dName} Department admission application. Stay Updated to check status for your application.`;
    const notiObj = {
      notificationType: 1,
      notification: notify,
    };
    await appForAppli.appUpdates.push(notiObj);
    newPreStudent.applicationForApply = aid;
    newPreStudent.userId = id;
    await userText.preAppliedStudent.push(newPreStudent._id);
    await userText.appliedForApplication.push(appForAppli);
    const studentDataObj = {
      studentStatus: "Applied",
      studentDetails: newPreStudent._id,
    };
    await dAppliText.studentData.push(studentDataObj);
    await dAppliText.save();
    await newPreStudent.save();
    await userText.save();
    res.status(200).send({ message: "Application Applied Successfully" });
  }
);

app.get("/batch/class/student/:bid", async (req, res) => {
  const { bid } = req.params;
  const batch = await Batch.findById({ _id: bid }).populate({
    path: "classroom",
    populate: {
      path: "ApproveStudent",
    },
  });
  res.status(200).send({ message: "Classes Are here", batch });
});

app.get("/user/:id/applied-application", async (req, res) => {
  console.log("/user/:id/applied-application");
  const { id } = req.params;
  const user = await User.findById({ _id: id }).populate({
    path: "appliedForApplication",
    populate: {
      path: "appName",
      populate: {
        path: "applicationForDepartment",
      },
      populate: {
        path: "rounds",
      },
      populate: {
        path: "studentData",
        // populate: {
        //   path: "studentDetails",
        //     // populate: {
        //     //   path: "userId",
        //     // },
        // },
      },
    },
  });
  let applicationList = user.appliedForApplication;
  res
    .status(200)
    .send({ message: "Student Applied Application List", applicationList, id });
});
app.post(
  "/admission-application/confirm-student-auto/:aid",
  async (req, res) => {
    console.log("/admission-application/confirm-student-auto/:aid");
    const { aid } = req.params;
    const { qualifyStudentList, actRound } = req.body;
    const dAppliText = await DepartmentApplication.findById({
      _id: aid,
    }).populate({
      path: "applicationForDepartment",
      populate: {
        path: "institute",
      },
    });
    const appStList = dAppliText.studentData;
    for (let i = 0; i < qualifyStudentList.length; i++) {
      const index = appStList.findIndex(
        (x) => x.studentDetails == qualifyStudentList[i].studentDetails._id
      );
      dAppliText.studentData[index].studentStatus = "Selected";
      dAppliText.studentData[index].studentSelectedRound = actRound.roundName;
      const userText = await User.findById({
        _id: qualifyStudentList[i].studentDetails.userId,
      });
      const notiObj = {
        notificationType: 2,
        notification: `You have been selected in ${
          dAppliText.applicationForDepartment.institute.insName
        } for ${dAppliText.applicationForDepartment.dName} in ${
          actRound.roundName
        }. Confirm your admission or floor to next round Last Date to action is ${moment(
          actRound.candidateSelectionLastDate
        ).format("DD/MM/YYYY")}.`,
        actonBtnText: "Pay & confirm",
        deActBtnText: "Float",
      };
      const indexofApp = userText.appliedForApplication.findIndex(
        (x) => (x.appName = dAppliText._id)
      );
      userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
      await userText.save();
      console.log(qualifyStudentList[i].studentDetails.studentFirstName);
      console.log(userText.studentFirstName);
    }
    dAppliText.autoUpdateProcess.selectionStatus = "Updated";
    await dAppliText.save();
    console.log("working Application");
    res.status(200).send({ message: "Student Move to Selected SuccessFully" });
  }
);

app.get("/admission-preapplied/student-details/:aid", async (req, res) => {
  console.log("/admission-preapplied/student-details/:aid");
  const { aid } = req.params;
  const application = await DepartmentApplication.findById({ _id: aid });
  const preAppliedStudent = await PreAppliedStudent.find({
    applicationForApply: aid,
  }).populate("userId");
  let studentDataText = application.studentData;
  for (let i = 0; i < studentDataText.length; i++) {
    let currStudent = studentDataText[i];
    let findPreAppSt = await PreAppliedStudent.find({
      _id: currStudent.studentDetails,
    }).populate("userId");
    studentDataText[i].studentDetails = findPreAppSt[0];
  }
  const preAppliedStList = studentDataText;
  res.status(200).send({
    message: "Admission Application Applied Student List Detail",
    preAppliedStList,
  });
});
app.post("/admission-application/select-student/:aid", async (req, res) => {
  console.log("/admission-application/select-student/:aid");
  const { aid } = req.params;
  const { stId, actRound } = req.body;

  const dAppliText = await DepartmentApplication.findById({ _id: aid })
    .populate({
      path: "studentData",
      populate: {
        path: "studentDetails",
        populate: {
          path: "userId",
        },
      },
    })
    .populate({
      path: "applicationForDepartment",
      populate: {
        path: "institute",
      },
    });
  const appStList = dAppliText.studentData;
  const preStudNum = appStList.findIndex((x) => x.studentDetails._id == stId);
  dAppliText.studentData[preStudNum].studentStatus = "Selected";
  dAppliText.studentData[preStudNum].studentSelectedRound = actRound.roundName;
  console.log("This is colsoemm", appStList[preStudNum].studentDetails);
  const uid = appStList[preStudNum].studentDetails.userId._id;
  const userText = await User.findById({
    _id: uid,
  });
  const notiObj = {
    notificationType: 2,
    notification: `You have been selected in ${
      dAppliText.applicationForDepartment.institute.insName
    } 
                for ${
                  dAppliText.applicationForDepartment.dName
                } Department in ${actRound.roundName}. 
                Confirm your admission or float to next round Last Date to action is 
                ${moment(actRound.candidateSelectionLastDate).format(
                  "DD/MM/YYYY"
                )}.`,
    actonBtnText: "Pay & confirm",
    deActBtnText: "Float",
  };
  console.log(userText);
  const indexofApp = userText.appliedForApplication.findIndex(
    (x) => (x.appName = dAppliText._id)
  );
  console.log(indexofApp);
  userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
  await userText.save();
  await dAppliText.save();
  console.log("working Application");
  res.status(200).send({ message: "Student Selected SuccessFully" });
});

app.post(
  "/admission-application/applicationfee-payed-student/:aid/:id",
  async (req, res) => {
    console.log("/admission-application/applicationfee-payed-student/:aid");
    const { aid, id } = req.params;
    const { actRound } = req.body;
    const dAppliText = await DepartmentApplication.findById({ _id: aid })
      .populate({
        path: "studentData",
        populate: {
          path: "studentDetails",
          populate: {
            path: "userId",
          },
        },
      })
      .populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });
    const appStList = dAppliText.studentData;
    const preStudNum = appStList.findIndex(
      (x) => x.studentDetails.userId._id == id
    );
    dAppliText.studentData[preStudNum].studentStatus = "AdPayed";
    dAppliText.studentData[preStudNum].admissionFeeStatus = "Payed";
    // dAppliText.studentData[preStudNum].studentSelectedRound = actRound.roundName;
    const userText = await User.findById({
      _id: appStList[preStudNum].studentDetails.userId._id,
    });
    const notiObj = {
      notificationType: 1,
      notification: `Your admission have been confirmed. Please visit ${
        dAppliText.applicationForDepartment.institute.insName
      } with Required Documents to confirm your seat. Last Date for document submission -  
      ${moment(actRound.candidateSelectionLastDate).format("DD/MM/YYYY")}.`,
      // actonBtnText: "Pay & confirm",
      // deActBtnText: "Float",
    };
    console.log(userText);
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );

    console.log(indexofApp);
    userText.appliedForApplication[indexofApp].appUpdates.pop();
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

    console.log(userText);
    await userText.save();
    await dAppliText.save();

    console.log("working Application");
    res
      .status(200)
      .send({ message: "Student Application Fee Payed SuccessFully" });
  }
);

app.post(
  "/admission-application/application-floated-student/:aid/:id",
  async (req, res) => {
    console.log("/admission-application/applicationfee-payed-student/:aid/:id");
    const { aid, id } = req.params;
    const { actRound } = req.body;
    const dAppliText = await DepartmentApplication.findById({ _id: aid })
      .populate({
        path: "studentData",
        populate: {
          path: "studentDetails",
          populate: {
            path: "userId",
          },
        },
      })
      .populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });
    const appStList = dAppliText.studentData;
    const preStudNum = appStList.findIndex(
      (x) => x.studentDetails.userId._id == id
    );

    console.log(actRound);
    let roundList = dAppliText.rounds;
    let actRondIndex = roundList.findIndex(
      (x) => x.roundName == actRound.roundName
    );

    console.log(actRondIndex + 1);
    console.log(roundList.length);
    // notiObj;
    if (actRondIndex + 1 == roundList.length) {
      dAppliText.studentData[preStudNum].studentStatus = "Reserve";
      notiObj = {
        notificationType: 3,
        notification: `You can not be floated to next round becouse of this is last round for Application
        would you like to want apply through Menegment Seats.`,
        actonBtnText: "Apply in Reserve",
        deActBtnText: "Cancel",
      };
    } else {
      dAppliText.studentData[preStudNum].studentStatus = "Floated";
      dAppliText.studentData[preStudNum].studentFloatedTo = `${
        roundList[actRondIndex + 1].roundName
      }`;
      notiObj = {
        notificationType: 1,
        notification: `You have been floated to second round as of your confirmaction.`,
      };
    }

    console.log(notiObj);
    const userText = await User.findById({
      _id: appStList[preStudNum].studentDetails.userId._id,
    });
    console.log(userText);
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );

    userText.appliedForApplication[indexofApp].appUpdates.pop();
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

    await userText.save();
    await dAppliText.save();

    console.log("working Application");
    res.status(200).send({ message: "Student float SuccessFully" });
  }
);
app.post("/admission-application/confirm-lc-student/:aid", async (req, res) => {
  console.log("/admission-application/confirm-lc-student/:aid");
  const { aid } = req.params;
  const { stId, actRound } = req.body;
  const dAppliText = await DepartmentApplication.findById({ _id: aid })
    .populate({
      path: "studentData",
      populate: {
        path: "studentDetails",
        populate: {
          path: "userId",
        },
      },
    })
    .populate({
      path: "applicationForDepartment",
      populate: {
        path: "institute",
      },
    });
  const appStList = dAppliText.studentData;
  const preStudNum = appStList.findIndex((x) => x.studentDetails._id == stId);
  dAppliText.studentData[preStudNum].studentStatus = "Confirmed";
  dAppliText.studentData[preStudNum].studentSelectedRound = actRound.roundName;
  const userText = await User.findById({
    _id: appStList[preStudNum].studentDetails.userId._id,
  });
  const notiObj = {
    notificationType: 1,
    notification: `Welcome to ${dAppliText.applicationForDepartment.institute.insName}.
                your seat has been confirmed. You will be alloted your class, stay updated.`,
  };
  console.log(userText);
  const indexofApp = userText.appliedForApplication.findIndex(
    (x) => (x.appName = dAppliText._id)
  );
  console.log(indexofApp);
  userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
  await userText.save();
  await dAppliText.save();
  console.log("working Application");
  res.status(200).send({ message: "Student Confirmed SuccessFully" });
});

app.post(
  "/admission-application/:aid/class-allot-student/:stid",
  async (req, res) => {
    console.log("/admission-application/class-allot-student");
    const { aid, stid } = req.params;
    const { classAllotData } = req.body;

    console.log(aid);
    console.log(stid);
    console.log(classAllotData);
    const dAppliText = await DepartmentApplication.findById({ _id: aid })
      .populate({
        path: "studentData",
        populate: {
          path: "studentDetails",
          populate: {
            path: "userId",
          },
        },
      })
      .populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });

    const institute = await InstituteAdmin.findById({
      _id: dAppliText.applicationForDepartment.institute._id,
    });
    const classText = await Class.findById({ _id: classAllotData.classId });
    const StText = await PreAppliedStudent.findById({ _id: stid });
    const studentData = await new Student({
      studentFirstName: StText.studentFirstName,
      studentMiddleName: StText.studentMiddleName,
      studentLastName: StText.studentLastName,
      studentDOB: StText.studentDOB,
      studentGender: StText.studentGender,
      studentNationality: StText.studentNationality,
      studentMTongue: StText.studentMotherTongue,
      studentCast: StText.studentCast,
      studentCastCategory: StText.studentCategory,
      studentReligion: StText.studentReligion,
      studentBirthPlace: StText.studentBirthPlace,
      studentDistrict: StText.studentDistrict,
      studentState: StText.studentState,
      studentAddress: StText.studentAddress,
      studentPhoneNumber: StText.studentSelfContactNo,
      studentAadharNumber: "000000000000",
      studentParentsName: StText.studentParents_GuardianName,
      studentParentsPhoneNumber: StText.studentParents_GuardianContactNo,
      studentDocuments: "",
      studentPName: "",
      studentAadharCard: "",
    });

    const appStList = dAppliText.studentData;
    const preStudNum = appStList.findIndex((x) => x.studentDetails._id == stid);
    dAppliText.studentData[preStudNum].studentStatus = "Class Alloted";
    const userText = await User.findById({
      _id: appStList[preStudNum].studentDetails.userId._id,
    });
    const notiObj = {
      notificationType: 1,
      notification: `Welcome to ${classText.className} - ${classText.classTitle}, Enjoy Your Journey.`,
    };
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

    institute.student.push(studentData);
    studentData.institute = institute;
    userText.student.push(studentData);
    studentData.user = userText;
    classText.student.push(studentData);
    studentData.studentClass = classText;

    await institute.save();
    await classText.save();
    await studentData.save();
    await userText.save();
    await dAppliText.save();

    console.log("working Application");
    res.status(200).send({ message: "Student Class Alloted SuccessFully" });
  }
);

app.post(
  "/admission-application/class-allot-cancel-student/:aid",
  async (req, res) => {
    console.log("/admission-application/class-allot-cancel-student/:aid");
    const { aid } = req.params;
    const { stId, actRound } = req.body;
    const dAppliText = await DepartmentApplication.findById({ _id: aid })
      .populate({
        path: "studentData",
        populate: {
          path: "studentDetails",
          populate: {
            path: "userId",
          },
        },
      })
      .populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });
    const appStList = dAppliText.studentData;
    const preStudNum = appStList.findIndex((x) => x.studentDetails._id == stId);
    dAppliText.studentData[preStudNum].studentStatus = "Cancelled";
    const userText = await User.findById({
      _id: appStList[preStudNum].studentDetails.userId._id,
    });
    // const notiObj = {
    //   notificationType: 1,
    //   notification: `Welcome to ${dAppliText.applicationForDepartment.institute.insName}.
    //               your seat has been confirmed. You will be alloted your class, stay updated.`,
    // };
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );
    console.log(indexofApp);
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
    await userText.save();
    await dAppliText.save();
    console.log("working Application: Application Cancled");
    res
      .status(200)
      .send({ message: "Student Application Canciled SuccessFully" });
  }
);
// ============================ Vaibhav Extra-Curricular ===========================

app.get("/department-elections-details/:did", async (req, res) => {
  const { did } = req.params;
  if (did) {
    const departmentText = await Department.findById({ _id: did }).populate(
      "deptElections"
    );
    const departmentElections = departmentText.deptElections;
    res
      .status(200)
      .send({ message: "All Elections Details", departmentElections });
  }
});

app.post("/department-election-creation/:did", isLoggedIn, async (req, res) => {
  const { did } = req.params;
  const { electionData } = req.body;
  const departmentText = await Department.findById({ _id: did }).populate({
    path: "userBatch",
    populate: {
      path: "classroom",
      populate: {
        path: "ApproveStudent",
      },
    },
  });
  let classrooms = departmentText.userBatch.classroom;
  let studentCount = 0;
  for (let i = 0; i < classrooms.length; i++) {
    let students = classrooms[i].ApproveStudent;
    studentCount = Number(studentCount) + Number(students.length);
  }
  const Election = await new Elections({
    electionForDepartment: did,
    positionName: electionData.positionName,
    applicationDate: electionData.applicationDate,
    electionDate: electionData.electionDate,
    totalVoters: studentCount,
    voteCount: [],
    candidates: [],
  });
  await departmentText.deptElections.push(Election);
  await Election.save();
  await departmentText.save();
  console.log("Department Election is Created.");
  res
    .status(200)
    .send({ message: "Department Election is Created.", classrooms });
});

///////////////////////FOR THE DEPART AND ALL EDIT AND DELETE//////////////////

app.get("/getDepartment/:did", update.getDepartment);
app.patch("/updateDepartment/:did", update.updateDepartment);
app.delete("/delDepartment/:did", update.delDepartment);

app.patch("/updateClassMaster/:cid", update.updateClassMaster);
app.delete("/delClassMaster/:cid", update.delClassMaster);
//bjbj
app.patch("/updateClass/:cid", update.updateClass);
app.delete("/delClass/:cid", update.delClass);

app.patch("/updateSubjectMaster/:sid", update.updateSubjectMaster);
app.delete("/delSubjectMaster/:sid", update.delSubjectMaster);

app.patch("/updateSubject/:sid", update.updateSubject);
app.delete("/delSubject/:sid", update.delSubject);

app.patch("/updateSubjectTitle/:sid", update.updateSubjectTitle);
app.delete("/delSubjectTitle/:sid", update.delSubjectTitle);

app.patch("/updateChecklist/:cid", update.updateChecklist);
app.delete("/delChecklist/:cid", update.delChecklist);

// updateFees
app.patch("/updateFees/:fid", update.updateFees);
app.patch("/updateHoliday/:hid", update.updateHoliday);
app.delete("/delHoliday/:hid", update.delHoliday);

// updateStudentProfile; updateStaffProfile
app.patch("/updateStudentProfile/:sid", update.updateStudentProfile);
app.patch("/updateStaffProfile/:sid", update.updateStaffProfile);

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
