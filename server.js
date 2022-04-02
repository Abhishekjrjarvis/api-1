require("dotenv").config();
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
const ApplyPayment = require("./models/ApplyPayment");
const payment = require("./routes/paymentRoute");

const dburl = `${process.env.DB_URL}`;
// const dburl = `${process.env.L_DB_URL}`;

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
    // origin: "http://107.20.124.171:3000",
    origin: "https://qviple.com",
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
  try {
    const admins = await Admin.find({});
    res.send(admins);
  } catch {
    console.log(`SomeThing went wrong at this endPoint(/)`);
  }
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
  try {
    const institute = await InstituteAdmin.find({});
    res.status(200).send({ message: "institute detail", institute });
  } catch {
    console.log(
      `SomeThing went wrong at this endPoint(/all/referral/ins/detail)`
    );
  }
});

app.get("/admindashboard/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing went wrong at this endPoint(/admindashboard/:id)`);
  }
});

// Get All User for Institute Referals

app.get("/all/user/referal", async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).send({ message: "User Referal Data", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/user/referal)`);
  }
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
    res.status(200).send({
      message: `Congrats for Approval ${institute.insName}`,
      admin,
      institute,
    });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admin/:aid/approve/ins/:id)`
    );
  }
});

// Reject Institute By Super Admin

app.post("/admin/:aid/reject/ins/:id", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admin/:aid/reject/ins/:id)`
    );
  }
});

// Institute Admin Routes

// Institute Creation
//for global user admin "6247207f1d91bbdacaeb0883"
//for local my system "6247207f1d91bbdacaeb0883"
app.post("/ins-register", async (req, res) => {
  try {
    const admins = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883" });
    const existInstitute = await InstituteAdmin.findOne({
      name: req.body.name,
    });
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
        res.status(201).send({ message: "Institute", institute });
      }
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-register)`);
  }
});

app.get("/ins-register/doc/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins-register/doc/:key)`
    );
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
  try {
    const id = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insDocument = results.key;
    await institute.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-register/doc/:id)`);
  }
});

// Create Institute Password
app.post("/create-password/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/create-password/:id)`);
  }
});

// Get Login Credentials of Super Admin & Institute Admin & User

app.get("/ins-login", (req, res) => {
  try {
    if (req.session.institute || req.session.user || req.session.admin) {
      res.send({
        loggedIn: true,
        User: req.session.institute || req.session.user || req.session.admin,
      });
    } else {
      res.send({ loggedIn: false });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-login)`);
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
  try {
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
            user.activeDate >= deactivate_date
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(ins-login")`);
  }
});

// Logout Handler

app.get("/ins-logout", (req, res) => {
  try {
    res.clearCookie("SessionID", { path: "/" });
    res.status(200).send({ message: "Successfully Logout" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-logout)`);
  }
});

// Get All Data From Institute Collections

app.get("/insdashboard", async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({});
    res.status(200).send({ message: "All Institute List", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/insdashboard)`);
  }
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
      })
      .populate("userReferral")
      .populate("insAdmissionAdmin");
    res.status(200).send({ message: "Your Institute", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/insdashboard/:id)`);
  }
});

// All Post From Institute

app.get("/insdashboard/:id/ins-post", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    res.render("post", { institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post)`
    );
  }
});

// Institute Post Route
app.post(
  "/insdashboard/:id/ins-post",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { id } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const post = new Post({ ...req.body });
      post.imageId = "1";
      institute.posts.push(post);
      post.institute = institute._id;
      await institute.save();
      await post.save();
      res.status(200).send({ message: "Your Institute", institute });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post)`
      );
    }
  }
);

app.post(
  "/insdashboard/:id/ins-post/image",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/image)`
      );
    }
  }
);

app.get("/insdashboard/ins-post/images/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/ins-post/images/:key)`
    );
  }
});

////////////////////FOR THE VIDEO UPLOAD///////////////////////////
app.post(
  "/insdashboard/:id/ins-post/video",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/video)`
      );
    }
  }
);

app.get("/insdashboard/ins-post/video/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/ins-post/video/:key)`
    );
  }
});

app.put(
  "/insdashboard/:id/ins-post/:uid/update",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, uid } = req.params;
      const { CreatePostStatus } = req.body;
      const post = await Post.findById({ _id: uid });
      post.CreatePostStatus = CreatePostStatus;
      await post.save();
      res.status(200).send({ message: "visibility change", post });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/:uid/update)`
      );
    }
  }
);

app.delete("/insdashboard/:id/ins-post/:uid", isLoggedIn, async (req, res) => {
  try {
    const { id, uid } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: uid } });
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { saveInsPost: uid } });
    await Post.findByIdAndDelete({ _id: uid });
    res.status(200).send({ message: "deleted Post" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/:uid)`
    );
  }
});

app.post("/ins/phone/info/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { insPhoneNumber } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insPhoneNumber = insPhoneNumber;
    await institute.save();
    res.status(200).send({ message: "Mobile No Updated", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/phone/info/:id)`);
  }
});

app.patch("/ins/personal/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
    await institute.save();
    res.status(200).send({ message: "Personal Info Updated", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/personal/info/:id)`
    );
  }
});

// Institute Display Data
app.post("/insprofiledisplay/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insprofiledisplay/:id)`
    );
  }
});

app.get("/allstaff", async (req, res) => {
  try {
    const staff = await Staff.find({});
    res.status(200).send({ message: "staff data", staff });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/allstaff)`);
  }
});

// Institute Profile About Data
////////////////////////////////////

app.post("/insprofileabout/:id", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/insprofileabout/:id)`);
  }
});

app.get("/insprofileabout/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insprofileabout/photo/:key)`
    );
  }
});

app.post(
  "/insprofileabout/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insprofileabout/photo/:id)`
      );
    }
  }
);

app.get("/insprofileabout/coverphoto/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insprofileabout/coverphoto/:key)`
    );
  }
});

app.post(
  "/insprofileabout/coverphoto/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insprofileabout/coverphoto/:id)`
      );
    }
  }
);
//////////////////////////////////////////////
// Institute Announcements Data
app.post("/ins-announcement/:id", isLoggedIn, isApproved, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const announcements = await new InsAnnouncement({ ...req.body });
    institute.announcement.push(announcements);
    announcements.institute = institute;
    await institute.save();
    await announcements.save();
    res.status(200).send({ message: "Successfully Created" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-announcement/:id)`);
  }
});

// Institute Announcement Details
app.get("/ins-announcement-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await InsAnnouncement.findById({ _id: id }).populate(
      "institute"
    );
    res.status(200).send({ message: "Announcement Detail", announcement });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins-announcement-detail/:id)`
    );
  }
});

// Institute Data Departments
app.get("/insdashboard/:id/ins-department", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    res.render("Department", { institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-department)`
    );
  }
});

app.post("/ins/:id/student/certificate", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { sid, studentReason, studentCertificateDate } = req.body;
    const student = await Student.findById({ _id: sid });
    student.studentReason = studentReason;
    student.studentCertificateDate = studentCertificateDate;
    await student.save();
    res.status(200).send({ message: "student certificate ready", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/student/certificate)`
    );
  }
});

app.post(
  "/ins/:id/student/leaving/certificate",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/student/leaving/certificate)`
      );
    }
  }
);

// Search Institute For Follow

app.post("/search/ins-dashboard", isLoggedIn, async (req, res) => {
  let name = req.body.insSearch.trim();
  try {
    const institute = await InstituteAdmin.findOne({ insName: name });
    res.status(200).send({ message: "Search Institute", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/search/ins-dashboard)`);
  }
});

// Institute Staff Joining

app.post("/search/:uid/insdashboard/data/:id", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/:uid/insdashboard/data/:id)`
    );
  }
});

// Institute Staff Joining Form Details
app.post(
  "/search/insdashboard/staffdata/:sid",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/:sid)`
      );
    }
  }
);

app.get("/search/insdashboard/staffdata/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/photo/:key)`
    );
  }
});

app.post(
  "/search/insdashboard/staffdata/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/photo/:id)`
      );
    }
  }
);

app.post(
  "/search/insdashboard/staffdata/doc/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const staff = await Staff.findById({ _id: sid });
      staff.staffDocuments = results.key;
      await staff.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/doc/:id)`
      );
    }
  }
);
app.post(
  "/search/insdashboard/staffdata/adh/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const staff = await Staff.findById({ _id: sid });
      staff.staffAadharCard = results.key;
      await staff.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/adh/:id)`
      );
    }
  }
);

// Institute Post For Like
app.post("/post/like", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/post/like)`);
  }
});

app.post("/ins/save/post", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/save/post)`);
  }
});

app.post("/ins/unsave/post", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/unsave/post)`);
  }
});

app.post("/post/unlike", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/post/unlike)`);
  }
});

// Institute Post For Comments

app.post("/post/comments/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/post/comments/:id)`);
  }
});

// Institute For Staff Approval

app.get("/ins-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate({
      path: "groupConversation",
    });
    res.send(institute);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-data/:id)`);
  }
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
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/approve/:sid)`
    );
  }
});

app.post("/ins/:id/staff/reject/:sid", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/reject/:sid)`
    );
  }
});

// Institute Department Creation

app.post(
  "/ins/:id/new-department",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/new-department)`
      );
    }
  }
);

app.get("/departmentimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/departmentimage/photo/:key)`
    );
  }
});
app.post(
  "/departmentimage/photo/:did",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/departmentimage/photo/:did)`
      );
    }
  }
);

app.get("/departmentimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/departmentimage/cover/:key)`
    );
  }
});
app.post(
  "/departmentimage/coverphoto/:did",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/departmentimage/coverphoto/:did)`
      );
    }
  }
);

app.get("/classimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/classimage/photo/:key)`
    );
  }
});
app.post("/classimage/photo/:cid", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/classimage/photo/:cid)`
    );
  }
});

app.get("/classimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/classimage/cover/:key)`
    );
  }
});
app.post(
  "/classimage/coverphoto/:cid",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/classimage/coverphoto/:cid)`
      );
    }
  }
);

////////////FOR THE FINANCE AND SPORTS/////////////////////////////

app.get("/financeimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/financeimage/photo/:key)`
    );
  }
});
app.post(
  "/financeimage/photo/:fid",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/financeimage/photo/:fid)`
      );
    }
  }
);

app.get("/financeimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/financeimage/cover/:key)`
    );
  }
});
app.post(
  "/financeimage/coverphoto/:fid",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/financeimage/coverphoto/:fid)`
      );
    }
  }
);
app.get("/sportimage/photo/:key", async (req, res) => {
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportimage/photo/:key)`
    );
  }
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post("/sportimage/photo/:sid", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportimage/photo/:sid)`
    );
  }
});

app.get("/sportimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportimage/cover/:key)`
    );
  }
});
app.post(
  "/sportimage/coverphoto/:sid",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/sportimage/coverphoto/:sid)`
      );
    }
  }
);
app.get("/sportclassimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportclassimage/photo/:key)`
    );
  }
});
app.post(
  "/sportclassimage/photo/:scid",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/sportclassimage/photo/:scid)`
      );
    }
  }
);

app.get("/sportclassimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportclassimage/cover/:key)`
    );
  }
});
app.post(
  "/sportclassimage/coverphoto/:scid",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/sportclassimage/coverphoto/:scid)`
      );
    }
  }
);

// Institute Search for follow Institute Profile

app.post("/ins-search-profile", isLoggedIn, async (req, res) => {
  try {
    const institute = await InstituteAdmin.findOne({
      insName: req.body.insSearchProfile,
    });
    res.status(200).send({ message: "Search Institute Here", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-search-profile)`);
  }
});

app.post("/ins/staff/code", async (req, res) => {
  try {
    const { InsId, code } = req.body;
    const institute = await InstituteAdmin.findById({ _id: InsId });
    institute.staffJoinCode = code;
    await institute.save();
    res.status(200).send({ message: "staff joining code", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/staff/code)`);
  }
});

app.post("/ins/class/code", async (req, res) => {
  try {
    const { classId, code } = req.body;
    const classes = await Class.findById({ _id: classId });
    classes.classCode = code;
    await classes.save();
    res.status(200).send({ message: "class joining code", classes });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/class/code)`);
  }
});

// Institute To Institute Follow Handler

app.put("/follow-ins", async (req, res) => {
  try {
    const institutes = await InstituteAdmin.findById({
      _id: req.session.institute._id,
    });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.followId,
    });

    if (institutes.following.includes(req.body.followId)) {
      res.status(200).send({ message: "You Already Following This Institute" });
    } else {
      sinstitute.followers.push(req.session.institute._id);
      institutes.following.push(req.body.followId);
      await sinstitute.save();
      await institutes.save();
      res.status(200).send({ message: "Following This Institute" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/follow-ins)`);
  }
});

app.put("/unfollow-ins", async (req, res) => {
  try {
    const institutes = await InstituteAdmin.findById({
      _id: req.session.institute._id,
    });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.followId,
    });

    if (institutes.following.includes(req.body.followId)) {
      sinstitute.followers.splice(req.session.institute._id, 1);
      institutes.following.splice(req.body.followId, 1);
      await sinstitute.save();
      await institutes.save();
      res.status(200).send({ message: "UnFollow This Institute" });
    } else {
      res.status(200).send({ message: "You Already UnFollow This Institute" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/unfollow-ins)`);
  }
});

// Depreceated Currently No Use

// Institute Department Data

app.get("/department/:did", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/department/:did)`);
  }
});

// Institute Batch in Department

app.get("/:id/batchdetail/:bid", isLoggedIn, async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { batchDetail } = req.body;
    const department = await Department.findById({ _id: id });
    const batches = await Batch.findById({ _id: bid });
    department.departmentSelectBatch = batches;
    department.userBatch = batches;
    await department.save();
    res.status(200).send({ message: "Batch Detail Data", batches, department });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:id/batchdetail/:bid)`);
  }
});

// Institute Batch Class Data

app.get("/batch/class/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid }).populate("classroom");
    res.status(200).send({ message: "Classes Are here", batch });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch/class/:bid)`);
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/addbatch/:did/ins/:id)`
    );
  }
});

app.get("/search/insdashboard/staffdata/adh/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/adh/:key)`
    );
  }
});

app.get("/search/insdashboard/studentdata/adh/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/adh/:key)`
    );
  }
});

// / Master Class Creator Route
// Get all ClassMaster Data
app.get("/ins/:id/departmentmasterclass/:did", async (req, res) => {
  try {
    const { id, did } = req.params;
    const classMaster = await ClassMaster.find({ department: did });
    res.status(200).send({ message: "ClassMaster Are here", classMaster });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/departmentmasterclass/:did)`
    );
  }
});
// Create Master Class Data
app.post(
  "/ins/:id/departmentmasterclass/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    try {
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
      res.status(200).send({
        message: "Successfully Created MasterClasses",
        classroomMaster,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/departmentmasterclass/:did/batch/:bid)`
      );
    }
  }
);

app.post(
  "/ins/:id/department/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/department/:did/batch/:bid)`
      );
    }
  }
);

// Get all Exam Data
app.get("/exam/:did/batch/:bid", async (req, res) => {
  try {
    const { did, bid } = req.params;
    console.log(bid);
    const exams = await Exam.find({ examForDepartment: did })
      .populate("examForClass")
      .populate("subject");
    // let exams = examsList.filter((e) => {
    //   return e.batch === bid;
    // });
    res.status(200).send({ message: "All Exam Data", exams });
  } catch {
    console.log("somethin went wrong /exam/:did/batch/:bid");
  }
});

// Get all Exam From Subject
app.get("/exam/subject/:suid", async (req, res) => {
  try {
    const { suid } = req.params;

    const subject = await Subject.findById({ _id: suid }).populate({
      path: "subjectExams",
      populate: {
        path: "examForClass",
      },
    });
    const subExamList = subject.subjectExams;

    res.status(200).send({ message: "Subject Exam List", subExamList });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/exam/subject/:suid)`);
  }
});

// Route For Exam Creation
// Route For Exam Creation
app.post(
  "/user/:id/department/function/exam/creation/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, did, bid } = req.params;
      const {
        subject,
        examForClass,
        examName,
        examType,
        examMode,
        examWeight,
      } = req.body;

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
        let d = await SubjectMaster.find({ subjectName: subject[i].examSubId });
        let Sub = {
          subMasterId: d[0]._id,
          subjectName: subject[i].examSubId,
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
    } catch {
      console.log(
        "something went wrong /user/:id/department/function/exam/creation/:did/batch/:bid"
      );
    }
  }
);

// Code Fr Get Subject and class Details
// Code For Get Class Details
app.get("/class-detail/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classData = await Class.findById({ _id: cid })
      .populate("ApproveStudent")
      .populate("classExam")
      .populate("attendence")
      .populate("subject")
      .populate("institute");

    res.status(200).send({ message: " Subject & class Data", classData });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/class-detail/:cid)`);
  }
});

app.get("/subject-detail/:suid", async (req, res) => {
  try {
    const { suid } = req.params;
    const subData = await Subject.findById({ _id: suid }).populate("class");
    let classId = subData.class._id;
    classData = await Class.findById({ _id: classId }).populate(
      "ApproveStudent"
    );
    res
      .status(200)
      .send({ message: " Subject & class Data", subData, classData });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/subject-detail/:suid)`);
  }
});

app.get("/subject-detail/:suid", async (req, res) => {
  try {
    const { suid } = req.params;
    const subData = await Subject.findById({ _id: suid }).populate("class");
    let classId = subData.class._id;
    classData = await Class.findById({ _id: classId }).populate(
      "ApproveStudent"
    );
    res
      .status(200)
      .send({ message: " Subject & class Data", subData, classData });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/subject-detail/:suid)`);
  }
});

// Marks Submit and Save of Student
// Marks Submit and Save of Student
app.post("/student/:sid/marks/:eid/:eSubid", async (req, res) => {
  try {
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
    // // // Find Exam Subject in List of Exam Subjects

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
  } catch {
    console.log("some thing went wrong /student/:sid/marks/:eid/:eSubid");
  }
});

app.get("/class/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .populate({ path: "classTeacher" })
      .populate({
        path: "batch",
      })
      .populate("subject");
    res.status(200).send({ message: "create class data", classes });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/class/:cid)`);
  }
});

// Institute Subject Creation In Class
app.post(
  "/ins/:id/department/:did/batch/:bid/class/:cid/subject",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/department/:did/batch/:bid/class/:cid/subject)`
      );
    }
  }
);

// Institute Student Joining Procedure

app.post(
  "/search/:uid/insdashboard/data/student/:id",
  isLoggedIn,
  async (req, res) => {
    try {
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
      res.status(200).send({
        message: "student code",
        institute,
        user,
        studentData,
        classes,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/:uid/insdashboard/data/student/:id)`
      );
    }
  }
);

app.post("/all/account/switch", async (req, res) => {
  try {
    const { userPhoneNumber } = req.body;
    const user = await User.find({ userPhoneNumber: userPhoneNumber });
    res.status(200).send({ message: "Switch Account Data", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/account/switch)`);
  }
});

app.post("/all/account/switch/user", async (req, res) => {
  try {
    const { userPhoneNumber } = req.body;
    const user = await User.find({ userPhoneNumber: userPhoneNumber });
    const institute = await InstituteAdmin.find({
      insPhoneNumber: userPhoneNumber,
    });
    res.status(200).send({ message: "Switch Account Data", user, institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/account/switch/user)`
    );
  }
});

app.post("/switchUser/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/switchUser/:id)`);
  }
});

app.post("/switchUser/ins/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/switchUser/ins/:id)`);
  }
});

// Institute Student Joining Form

app.post(
  "/search/insdashboard/studentdata/:sid",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/:sid)`
      );
    }
  }
);
app.get("/search/insdashboard/studentdata/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/photo/:key)`
    );
  }
});
app.post(
  "/search/insdashboard/studentdata/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/photo/:id)`
      );
    }
  }
);

app.post(
  "/search/insdashboard/studentdata/doc/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const student = await Student.findById({ _id: sid });
      student.studentDocuments = results.key;
      await student.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/doc/:id)`
      );
    }
  }
);

app.post(
  "/search/insdashboard/studentdata/adh/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const student = await Student.findById({ _id: sid });
      student.studentAadharCard = results.key;
      await student.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/adh/:id)`
      );
    }
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
    try {
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/student/:cid/approve/:sid/depart/:did/batch/:bid)`
      );
    }
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
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/student/:cid/reject/:sid)`
    );
  }
});

app.post("/student/report/finilized/:id", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/report/finilized/:id)`
    );
  }
});

// Get Batch Details class and Subject data
app.get("/ins/:id/allclassdata/:did/batch/:bid", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/allclassdata/:did/batch/:bid)`
    );
  }
});

// get all Master Subject Data

app.get("/ins/:id/departmentmastersubject/:did", async (req, res) => {
  try {
    const { id, did } = req.params;
    const subjectMaster = await SubjectMaster.find({ department: did });
    res.status(200).send({ message: "SubjectMaster Are here", subjectMaster });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/departmentmastersubject/:did)`
    );
  }
});

// Create Master Subject data
app.post(
  "/ins/:id/departmentmastersubject/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    try {
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
      res.status(200).send({
        message: "Successfully Created Master Subject",
        subjectMaster,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/departmentmastersubject/:did/batch/:bid)`
      );
    }
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
    console.log(`SomeThing Went Wrong at this EndPoint(/:id/roleData/:rid`);
  }
});

// Get all Exam From a Class

app.get("/exam/class/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const classroom = await Class.findById({ _id: cid }).populate({
      path: "classExam",
    });
    const classExamList = classroom.classExam;

    res.status(200).send({ message: "Classroom Exam List", classExamList });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/exam/class/:cid)`);
  }
});

app.get("/exam/:eid", async (req, res) => {
  try {
    const { eid } = req.params;
    const exam = await Exam.findById({ _id: eid }).populate({
      path: "examForClass",
    });
    res.status(200).send({ message: " exam data", exam });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/exam/:eid)`);
  }
});

// Staff Data

app.get("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById({ _id: id })
      .populate("user")
      .populate("institute");
    res.status(200).send({ message: "Staff Data To Member", staff });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staff/:id)`);
  }
});

app.get("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id })
      .populate("user")
      .populate("institute");
    res.status(200).send({ message: "Student Data To Member", student });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/student/:id)`);
  }
});

// for finding Staff By Id

app.post("/:id/staffdetaildata", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:id/staffdetaildata)`);
  }
});

// Student Detail Data

app.post("/:id/studentdetaildata", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const student = await Student.findById({ _id: studentId });
    const user = await User.findById({ _id: id });
    const role = await new Role({
      userSelectStudentRole: student,
    });
    user.role = role;
    await role.save();
    await user.save();
    res.status(200).send({ message: "Student Detail Data", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/:id/studentdetaildata)`
    );
  }
});

app.get("/studentdetaildata/:id", isLoggedIn, async (req, res) => {
  try {
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
    res
      .status(200)
      .send({ message: "Student Detail Data", student, behaviour });
  } catch {
    console.log("some thing went wrong /studentdetaildata/:id ");
  }
});
// Student Status Updated

app.post("/student/status", isLoggedIn, async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById({ _id: studentId })
      .populate("studentFee")
      .populate("offlineFeeList");
    res.status(200).send({ message: "Student Detail Data", student });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/student/status)`);
  }
});

// Staff Designation Data in members tab at User
// Staff Designation Data in members tab at User
app.get("/staffdesignationdata/:sid", isLoggedIn, async (req, res) => {
  try {
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
      .populate("staffSportClass")
      // .populate("staffAdmissionAdmin")
      .populate({
        path: "staffAdmissionAdmin",
        populate: {
          path: "adAdminName",
        },
      });
    res.status(200).send({ message: "Staff Designation Data", staff });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staffdesignationdata/:sid)`
    );
  }
});

// Student Designation Data in members Tab at users

app.get("/studentdesignationdata/:sid", async (req, res) => {
  try {
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
      .populate({
        path: "studentMarks",
        populate: {
          path: "examId",
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/studentdesignationdata/:sid)`
    );
  }
});

// Staff Department Info

app.get("/staffdepartment/:did", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staffdepartment/:did)`);
  }
});

//Staff Class Info
app.get("/staffclass/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staffclass/:sid)`);
  }
});

app.get("/staffclass/:sid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staffclass/:sid)`);
  }
});

// Staff Subject Info

app.get("/staffsubject/:sid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staffsubject/:sid)`);
  }
});

// Staff Department Batch Data

app.post("/:did/department/batch", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const { BatchId } = req.body;
    const batch = await Batch.findById({ _id: BatchId })
      .populate("classroom")
      .populate("batchStaff");

    // const department = await Department.findById({_id: did})
    // department.userBatch = batch
    // await department.save()
    res.status(200).send({ message: "Batch Class Data", batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/:did/department/batch)`
    );
  }
});

// Staff Batch Detail Data
app.get("/batch-detail/:bid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch-detail/:bid)`);
  }
});

// ================ Batch Unlock Vaibhav ===================

app.post("/batch-unlock/:bid", isLoggedIn, async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid });
    batch.batchStatus = "UnLocked";
    await batch
      .save()(res)
      .status(200)
      .send({ message: "Batch Successfully Unlocked" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch-unlock/:bid)`);
  }
});

// ================= Identical Batch vaibhav ================

app.post("/add-identical-batch/:did/ins/:id", isLoggedIn, async (req, res) => {
  try {
    const { did, id } = req.params;
    const { batchData } = req.body;
    const department = await Department.findById({ _id: did });
    const institute = await InstituteAdmin.findById({ _id: id });
    const BatchText = await Batch.findById({ _id: batchData.identicalBatch })
      .populate({
        path: "classroom",
      })
      .populate({
        path: "subjectMasters",
      });
    const batchTextNew = await new Batch({
      batchName: batchData.batchName,
    });
    const StaffRandomCodeHandler = () => {
      let rand1 = Math.floor(Math.random() * 5) + 1;
      let rand2 = Math.floor(Math.random() * 5) + 1;
      let rand3 = Math.floor(Math.random() * 5) + 1;
      let rand4 = Math.floor(Math.random() * 5) + 1;
      let rand5 = Math.floor(Math.random() * 5) + 1;
      return `${rand1}${rand2}${rand3}${rand4}${rand5}`;
    };
    for (let i = 0; i < BatchText.classroom.length; i++) {
      const classroomOld = await Class.findById({
        _id: BatchText.classroom[i]._id,
      }).populate({
        path: "subject",
      });
      const masterClass = await ClassMaster.findById({
        _id: classroomOld.masterClassName,
      });
      const staffClass01 = await Staff.findById({
        _id: classroomOld.classTeacher,
      });
      const classRoom = await new Class({
        masterClassName: classroomOld.masterClassName,
        className: classroomOld.className,
        classTitle: classroomOld.classTitle,
        classHeadTitle: classroomOld.classHeadTitle,
        classCode: `C-${StaffRandomCodeHandler()}`,
      });
      institute.classRooms.push(classRoom);
      classRoom.institute = institute;
      batchTextNew.classroom.push(classRoom);
      masterClass.classDivision.push(classRoom);
      if (String(department.dHead._id) == String(staffClass01._id)) {
      } else {
        department.departmentChatGroup.push(staffClass01);
      }
      classRoom.batch = batchTextNew;
      batchTextNew.batchStaff.push(staffClass01);
      staffClass01.batches = batchTextNew;
      staffClass01.staffClass.push(classRoom);
      classRoom.classTeacher = staffClass01;
      department.class.push(classRoom);
      classRoom.department = department;
      for (let j = 0; j < classroomOld.subject.length; j++) {
        const subjectOld = await Subject.findById({
          _id: classroomOld.subject[j]._id,
        });
        const subjectMaster = await SubjectMaster.findById({
          _id: subjectOld.subjectMasterName,
        });
        const staffSub01 = await Staff.findById({
          _id: subjectOld.subjectTeacherName,
        });
        const subject = await new Subject({
          subjectTitle: subjectOld.subjectTitle,
          subjectName: subjectOld.subjectName,
          subjectMasterName: subjectOld.subjectMasterName,
        });
        classRoom.subject.push(subject);
        subjectMaster.subjects.push(subject);
        subject.class = classRoom;
        if (String(classRoom.classTeacher) == String(staffSub01._id)) {
        } else {
          batchTextNew.batchStaff.push(staffSub01);
          staffSub01.batches = batchTextNew;
        }
        if (String(department.dHead._id) == String(staffSub01._id)) {
        } else {
          department.departmentChatGroup.push(staffSub01);
        }
        staffSub01.staffSubject.push(subject);
        subject.subjectTeacherName = staffSub01;
        await subjectMaster.save();
        await classRoom.save();
        await staffSub01.save();
        await subject.save();
        await department.save();
      }
      await staffClass01.save();
      await masterClass.save();
      await classRoom.save();
    }
    department.batches.push(batchTextNew);
    batchTextNew.department = department;
    batchTextNew.institute = institute;
    await department.save();
    await batchTextNew.save();
    res.status(200).send({ message: "Identical Batch Created Successfully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/add-identical-batch/:did/ins/:id)`
    );
  }
});

// Staff Batch Class Data

app.post("/batch/class", isLoggedIn, async (req, res) => {
  try {
    const { ClassId } = req.body;
    const classes = await Class.findById({ _id: ClassId }).populate("subject");
    res.status(200).send({ message: "Class Data", classes });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch/class)`);
  }
});

app.get("/holiday/:did", async (req, res) => {
  try {
    const { did } = req.params;
    const depart = await Department.findById({ _id: did }).populate("holiday");
    res.status(200).send({ message: "holiday data", depart });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/holiday/:did)`);
  }
});

// Staff Class Info Updated at Users End

app.post("/staff/class-info/:cid", isLoggedIn, async (req, res) => {
  try {
    const { cid } = req.params;
    const { classAbout, classDisplayPerson, classStudentTotal } = req.body;
    const classInfo = await Class.findById({ _id: cid });
    classInfo.classAbout = classAbout;
    classInfo.classDisplayPerson = classDisplayPerson;
    classInfo.classStudentTotal = classStudentTotal;
    await classInfo.save();
    res.status(200).send({ message: "Class Info Updated", classInfo });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/class-info/:cid)`
    );
  }
});

// Staff Department Info Updated at Users End

app.post("/staff/department-info/:did", isLoggedIn, async (req, res) => {
  try {
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
    res
      .status(200)
      .send({ message: "Department Info Updates", departmentInfo });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/department-info/:did)`
    );
  }
});

// Staff Checklist in Department Updated

app.post("/department-class/checklist/:did", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department-class/checklist/:did)`
    );
  }
});

app.get("/checklist/:checklistId", isLoggedIn, async (req, res) => {
  try {
    const { checklistId } = req.params;
    const checklist = await Checklist.findById({ _id: checklistId }).populate(
      "student"
    );
    res.status(200).send({ message: "Checklist Data", checklist });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/checklist/:checklistId)`
    );
  }
});

app.post("/department-class/fee/:did", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department-class/fee/:did)`
    );
  }
});

app.get("/fees/:feesId", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/fees/:feesId)`);
  }
});

app.post("/class/:cid/student/:sid/fee/:id", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/student/:sid/fee/:id)`
    );
  }
});

app.post("/class/:cid/student/:sid/behaviour", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/student/:sid/behaviour)`
    );
  }
});

app.post("/class/:cid/student/attendence", isLoggedIn, async (req, res) => {
  try {
    const { cid, sid } = req.params;
    const dLeave = await Holiday.findOne({
      dDate: { $eq: `${req.body.attendDate}` },
    });
    if (dLeave) {
      res.status(200).send({
        message: "Today will be holiday Provided by department Admin",
      });
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/student/attendence)`
    );
  }
});

app.post("/department/:did/staff/attendence", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const dLeaves = await Holiday.findOne({
      dDate: { $eq: `${req.body.staffAttendDate}` },
    });
    if (dLeaves) {
      res.status(200).send({
        message: "Today will be holiday Provided by department Admin",
      });
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department/:did/staff/attendence)`
    );
  }
});

app.post(
  "/student/:sid/attendence/:aid/present/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/student/:sid/attendence/:aid/present/:rid)`
      );
    }
  }
);

app.post(
  "/student/:sid/attendence/:aid/absent/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/student/:sid/attendence/:aid/absent/:rid)`
      );
    }
  }
);

app.post(
  "/staff/:sid/attendence/:aid/present/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/staff/:sid/attendence/:aid/present/:rid)`
      );
    }
  }
);

app.post(
  "/staff/:sid/attendence/:aid/absent/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/staff/:sid/attendence/:aid/absent/:rid)`
      );
    }
  }
);

app.post("/attendence/detail", isLoggedIn, async (req, res) => {
  try {
    const attendDates = await AttendenceDate.findOne({
      attendDate: { $gte: `${req.body.attendDate}` },
    })
      .populate("presentStudent")
      .populate("absentStudent");
    res.status(200).send({ message: "Attendence on that day", attendDates });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/attendence/detail)`);
  }
});

app.post("/attendence/status/student/:sid", isLoggedIn, async (req, res) => {
  try {
    const { sid } = req.params;
    const { dateStatus } = req.body;
    const attendStatus = await AttendenceDate.findOne({
      attendDate: dateStatus,
    });
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/attendence/status/student/:sid)`
    );
  }
});

app.post("/staff/attendence", isLoggedIn, async (req, res) => {
  try {
    const staffDates = await StaffAttendenceDate.findOne({
      staffAttendDate: { $gte: `${req.body.staffAttendDate}` },
    })
      .populate("presentStaff")
      .populate("absentStaff");
    res.status(200).send({ message: "Attendence on that day", staffDates });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staff/attendence)`);
  }
});

app.post("/attendence/status/staff/:sid", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/attendence/status/staff/:sid)`
    );
  }
});

app.post("/department/holiday/:did", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department/holiday/:did)`
    );
  }
});

app.post("/student/:sid/checklist/:cid", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/checklist/:cid)`
    );
  }
});

// ========================= Finance Department =========================

app.post(
  "/ins/:id/staff/:sid/finance",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/:sid/finance)`
      );
    }
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/finance/:fid/add/bank/details/:id)`
      );
    }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/finance/ins/bank/:id)`);
  }
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/finance/:fid/bank/details/:id/update)`
      );
    }
  }
);

app.get("/finance/detail/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/finance/detail/:id)`);
  }
});

app.post("/staff/finance-info/:fid", isLoggedIn, async (req, res) => {
  try {
    const { fid } = req.params;
    const { financeAbout, financeEmail, financePhoneNumber } = req.body;
    const financeInfo = await Finance.findById({ _id: fid });
    financeInfo.financeAbout = financeAbout;
    financeInfo.financeEmail = financeEmail;
    financeInfo.financePhoneNumber = financePhoneNumber;
    await financeInfo.save();
    res.status(200).send({ message: "Finance Info Updates", financeInfo });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/finance-info/:fid)`
    );
  }
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
      finance.financeIncomeCashBalance =
        finance.financeIncomeCashBalance + incomes.incomeAmount;
    } else if (req.body.incomeAccount === "By Bank") {
      finance.financeIncomeBankBalance =
        finance.financeIncomeBankBalance + incomes.incomeAmount;
    }
    // console.log(finance.financeBankBalance)
    await finance.save();
    await incomes.save();
    res.status(200).send({ message: "Add New Income", finance, incomes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/:sid/finance/:fid/income)`
    );
  }
});

app.post(
  "/finance/income/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const incomes = await Income.findById({ _id: sid });
      incomes.incomeAck = results.key;
      await incomes.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(`SomeThing Went Wrong at this EndPoint(/finance/income/:id)`);
    }
  }
);

app.get("/finance/income/ack/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/income/ack/:key)`
    );
  }
});

app.post("/all/incomes", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const income = await Income.find({ incomeAccount: queryStatus });
    res.status(200).send({ message: "cash data", income });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/incomes)`);
  }
});

app.post("/all/bank/incomes", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const income = await Income.find({ incomeAccount: queryStatus });
    res.status(200).send({ message: "bank data", income });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/bank/incomes)`);
  }
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
      finance.financeExpenseCashBalance =
        finance.financeExpenseCashBalance - expenses.expenseAmount;
    } else if (req.body.expenseAccount === "By Bank") {
      finance.financeExpenseBankBalance =
        finance.financeExpenseBankBalance - expenses.expenseAmount;
    }
    await finance.save();
    await expenses.save();
    res.status(200).send({ message: "Add New Expense", finance, expenses });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/:sid/finance/:fid/expense)`
    );
  }
});

app.post(
  "/finance/expense/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const expenses = await Expense.findById({ _id: sid });
      expenses.expenseAck = results.key;
      await expenses.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/finance/expense/:id)`
      );
    }
  }
);

app.get("/finance/expense/ack/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/expense/ack/:key)`
    );
  }
});

app.post("/all/expenses", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const expense = await Expense.find({ expenseAccount: queryStatus });
    res.status(200).send({ message: "cash data", expense });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/expenses)`);
  }
});

app.post("/all/bank/expenses", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const expense = await Expense.find({ expenseAccount: queryStatus });
    res.status(200).send({ message: "bank data", expense });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/bank/expenses)`);
  }
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
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/all/fee/online/:id)`
    );
  }
});

app.post("/class/:cid/total/online/fee", async (req, res) => {
  try {
    const { cid } = req.params;
    const { fee } = req.body;
    const classes = await Class.findById({ _id: cid });
    classes.onlineTotalFee = fee;
    await classes.save();
    res.status(200).send({ message: "class online total", classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/total/online/fee)`
    );
  }
});

app.post("/class/:cid/total/offline/fee", async (req, res) => {
  try {
    const { cid } = req.params;
    const { fee } = req.body;
    const classes = await Class.findById({ _id: cid });
    classes.offlineTotalFee = fee;
    await classes.save();
    res.status(200).send({ message: "class offline total", classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/total/offline/fee)`
    );
  }
});

app.post("/class/:cid/total/collected/fee", async (req, res) => {
  try {
    const { cid } = req.params;
    const { fee } = req.body;
    const classes = await Class.findById({ _id: cid });
    classes.classTotalCollected = fee;
    await classes.save();
    res.status(200).send({ message: "class offline total", classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/total/collected/fee)`
    );
  }
});

app.get("/finance/:fid/class/collect", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/collect)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/:cid/fee/:id/receieve)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/:cid/fee/:id/submi)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/:cid/fee/incorrect)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/online/payment/updated)`
    );
  }
});

// ============================== Sport Department ==============================

app.post(
  "/ins/:id/staff/:sid/sport",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/:sid/sport)`
      );
    }
  }
);

app.get("/sport/detail/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/sport/detail/:id)`);
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/sport/:sid/class)`
    );
  }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/sport/:sid/event)`);
  }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/sport/info/:sid)`);
  }
});

app.get("/event/detail/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/event/detail/:id)`);
  }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/event/:eid/match)`);
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/event/:eid/inter/match)`
    );
  }
});

app.get("/sport/class/detail/:cid", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/detail/:cid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/student/:sid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/info/:sid)`
    );
  }
});

app.get("/ins/approve/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "ApproveStudent"
    );
    res.status(200).send({ message: "Approve Institute Data", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/approve/student/:id)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/student/:id/add)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/student/:id/remove)`
    );
  }
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
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/team)`
    );
  }
});

app.get("/match/detail/:mid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/match/detail/:mid)`);
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/individual)`
    );
  }
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
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/inter/individual)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/team)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/inter/team)`
    );
  }
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
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/free)`
    );
  }
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
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/inter/free)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:id/detail/leave)`
    );
  }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staff/:sid/leave/:id)`);
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/leave/:id)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/grant/:eid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:id/student/leave/grant/:eid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/reject/:eid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:id/student/leave/reject/:eid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/:sid/transfer/:id)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/transfer/:id)`
    );
  }
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
      .populate("library")
      .populate("staffAdmissionAdmin");
    // .populate("sportDepartment")
    // .populate("staffSportClass")
    // .populate("elearning")
    transfer.transferStatus = status;
    await transfer.save();
    for (let i = 0; i < transferStaff.staffDepartment.length; i++) {
      const department = await Department.findById({
        _id: transferStaff.staffDepartment[i]._id,
      });
      staffNew.staffDepartment.push(department);
      department.dHead = staffNew;
      transferStaff.staffDepartment.pull(department);
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
      transferStaff.staffClass.pull(classes);
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
      transferStaff.staffSubject.pull(subject);
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
      transferStaff.financeDepartment.pull(finance);
      await staffNew.save();
      await finance.save();
      await transferStaff.save();
    }
    // for (let i = 0; i < transferStaff.sportDepartment.length; i++) {
    //   const sport = await Sport.findById({
    //     _id: transferStaff.sportDepartment[i]._id,
    //   });
    //   staffNew.sportDepartment.push(sport);
    //   sport.sportHead = staffNew;
    //   transferStaff.sportDepartment.pull(sport);
    //   await staffNew.save();
    //   await sport.save();
    //   await transferStaff.save();
    // }
    // for (let i = 0; i < transferStaff.staffSportClass.length; i++) {
    //   const sportClass = await SportClass.findById({
    //     _id: transferStaff.staffSportClass[i]._id,
    //   });
    //   staffNew.staffSportClass.push(sportClass);
    //   sportClass.sportClassHead = staffNew;
    //   transferStaff.staffSportClass.pull(sportClass);
    //   await staffNew.save();
    //   await sportClass.save();
    //   await transferStaff.save();
    // }
    // for (let i = 0; i < transferStaff.elearning.length; i++) {
    //   const elearn = await ELearning.findById({
    //     _id: transferStaff.elearning[i]._id,
    //   });
    //   staffNew.elearning.push(elearn);
    //   elearn.elearningHead = staffNew;
    //   transferStaff.elearning.pull(elearn);
    //   await staffNew.save();
    //   await elearn.save();
    //   await transferStaff.save();
    // }
    for (let i = 0; i < transferStaff.library.length; i++) {
      const libr = await Library.findById({
        _id: transferStaff.library[i]._id,
      });
      staffNew.library.push(libr);
      libr.libraryHead = staffNew;
      transferStaff.library.pull(libr);
      await staffNew.save();
      await libr.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.staffAdmissionAdmin.length; i++) {
      const sAdmin = await AdmissionAdmin.findById({
        _id: transferStaff.staffAdmissionAdmin[i]._id,
      });
      staffNew.staffAdmissionAdmin.push(sAdmin);
      sAdmin.adAdminNameHead = staffNew;
      transferStaff.staffAdmissionAdmin.pull(sAdmin);
      await staffNew.save();
      await sAdmin.save();
      await transferStaff.save();
    }
    if (
      institute.ApproveStaff.length >= 1 &&
      institute.ApproveStaff.includes(String(transferStaff._id))
    ) {
      institute.ApproveStaff.pull(transferStaff._id);
      transferStaff.institute = "";
      await institute.save();
      await transferStaff.save();
    } else {
      console.log("Not To Leave");
    }
    for (let i = 0; i < institute.depart.length; i++) {
      const depart = await Department.findById({
        _id: institute.depart[i]._id,
      });
      depart.departmentChatGroup.pull(transferStaff);
      depart.departmentChatGroup.push(staffNew);
      await depart.save();
    }
    for (let i = 0; i < institute.depart.length; i++) {
      for (let j = 0; j < i.batches.length; j++) {
        const batchData = await Batch.findById({ _id: i.batches[j]._id });
        batchData.batchStaff.pull(transferStaff);
        batchData.batchStaff.push(staffNew);
        staffNew.batches = batchData;
        await batchData.save();
        await staffNew.save();
      }
    }
    res
      .status(200)
      .send({ message: "Transfer Granted", staffNew, transferStaff, transfer });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/:sid/transfer/:ssid/grant/:eid)`
    );
  }
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/class/:id/student/:sid/transfer/grant/:eid/department/:did/batch/:bid)`
      );
    }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/transfer/reject/:eid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:id/student/transfer/reject/:eid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/complaint)`
    );
  }
});

app.post("/student/complaint/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const complaint = await Complaint.findById({ _id: id });
    complaint.complaintStatus = status;
    await complaint.save();
    res.status(200).send({ message: "Complaint Resolevd", complaint });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/complaint/reply/:id)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/complaint/:id/institute/:iid)`
    );
  }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/:id/add/field)`);
  }
});

// app.post("/ins/:id/id-card/export", async (req, res) => {
//   // console.log(req.params, req.body)
//   // , fieldText
//   try {
//     const { id } = req.params;
//     const { batchId } = req.body;
//     const institute = await InstituteAdmin.findById({ _id: id });
//     const admin = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883"  });
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
    const admin = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883" });
    const report = await new Report({ reportStatus: reportStatus });
    admin.reportList.push(report);
    report.reportUserPost = post;
    report.reportBy = user;
    await admin.save();
    await report.save();
    res.status(200).send({ message: "reported", report });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/user-post/:uid/report)`
    );
  }
});

app.post("/ins/:id/ins-post/:uid/report", async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reportStatus } = req.body;
    const user = await User.findById({ _id: id });
    const post = await Post.findById({ _id: uid });
    const admin = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883" });
    const report = await new Report({ reportStatus: reportStatus });
    admin.reportList.push(report);
    report.reportInsPost = post;
    report.reportBy = user;
    await admin.save();
    await report.save();
    res.status(200).send({ message: "reported", report });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/ins-post/:uid/report)`
    );
  }
});

app.patch("/sport/:sid/event/:eid/update", isLoggedIn, async (req, res) => {
  console.log(req.body);
  try {
    const { sid, eid } = req.params;
    const event = await SportEvent.findByIdAndUpdate(eid, req.body);
    await event.save();
    res.status(200).send({ message: "Event Updated", event });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/:sid/event/:eid/update)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/:sid/event/:eid/delete)`
    );
  }
});

app.post("/ins/:id/id-card/:bid/send/print", async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883" });
    admin.idCardPrinting.push(batch);
    batch.idCardStatus = status;
    await admin.save();
    await batch.save();
    res.status(200).send({ message: "Send for Printing", admin, batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/id-card/:bid/send/print)`
    );
  }
});

app.post("/ins/:id/id-card/:bid/un-send/print", async (req, res) => {
  try {
    const { id, bid } = req.params;
    // const { status } = req.body
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883" });
    admin.idCardPrinting.splice(batch, 1);
    batch.idCardStatus = "";
    await admin.save();
    await batch.save();
    res.status(200).send({ message: "Un Send for Printing", admin, batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/id-card/:bid/un-send/print)`
    );
  }
});

app.post("/ins/:id/id-card/:bid/done", async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883" });
    admin.idCardPrinted.push(batch);
    admin.idCardPrinting.splice(batch, 1);
    batch.idCardStatus = status;
    await admin.save();
    await batch.save();
    res.status(200).send({ message: "Id Card Printed", admin, batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/id-card/:bid/done)`
    );
  }
});

app.delete("/event/:eid/match/:mid/delete", async (req, res) => {
  try {
    const { eid, mid } = req.params;
    const event = await SportEvent.findById({ _id: eid });
    event.sportEventMatch.pull(mid);
    await event.save();
    const match = await SportEventMatch.findByIdAndDelete({ _id: mid });
    res.status(200).send({ message: "Deleted Event", sport, event });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/event/:eid/match/:mid/delete)`
    );
  }
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
    institute.userReferral.push(user);
    user.transferInstitute.push(institute);
    await institute.save();
    await user.save();
    res.status(200).send({ message: "transfer", user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/credit/transfer)`
    );
  }
});

app.post("/ins/:id/support", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const support = await new InstituteSupport({ ...req.body });
    institute.supportIns.push(support);
    support.institute = institute;
    await institute.save();
    await support.save();
    res.status(200).send({ message: "Successfully Updated", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/:id/support)`);
  }
});

app.get("/all/ins/support", async (req, res) => {
  try {
    const support = await InstituteSupport.find({}).populate({
      path: "institute",
    });
    res.status(200).send({ message: "all institute support data", support });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/ins/support)`);
  }
});

app.get("/all/user/support", async (req, res) => {
  try {
    const userSupport = await UserSupport.find({}).populate({
      path: "user",
    });
    res
      .status(200)
      .send({ message: "all institute userSupport data", userSupport });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/user/support)`);
  }
});

app.post("/user/:id/support/:sid/reply", async (req, res) => {
  try {
    const { id, sid } = req.params;
    const { queryReply } = req.body;
    const reply = await UserSupport.findById({ _id: sid });
    reply.queryReply = queryReply;
    await reply.save();
    res.status(200).send({ message: "reply", reply });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/support/:sid/reply)`
    );
  }
});

app.post("/ins/:id/support/:sid/reply", async (req, res) => {
  try {
    const { id, sid } = req.params;
    const { queryReply } = req.body;
    const reply = await InstituteSupport.findById({ _id: sid });
    reply.queryReply = queryReply;
    await reply.save();
    res.status(200).send({ message: "reply", reply });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/support/:sid/reply)`
    );
  }
});

app.post("/user/:id/support", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const support = await new UserSupport({ ...req.body });
    user.support.push(support);
    support.user = user;
    await user.save();
    await support.save();
    res.status(200).send({ message: "Successfully Updated", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id/support)`);
  }
});

// ========================== Payment Portal ===========================

app.get("/student/detail/:sid/payment", async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid });
    res
      .status(200)
      .send({ message: "Student Data For Payment Portal", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/detail/:sid/payment)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/fee/detail/:fid/payment)`
    );
  }
});

app.get("/admin/all/payment/day", async (req, res) => {
  try {
    const payment = await Payment.find({});
    res.status(200).send({ message: "Data", payment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admin/all/payment/day)`
    );
  }
});

app.get("/all/student/list/data", async (req, res) => {
  try {
    const student = await Student.find({}).populate({
      path: "institute",
    });
    res.status(200).send({ message: "Student data", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/student/list/data)`
    );
  }
});

app.get("/all/user/list/data", async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).send({ message: "User data", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/user/list/data)`);
  }
});

app.get("/admin/all/e-content/payment/day", async (req, res) => {
  try {
    const ePayment = await PlaylistPayment.find({});
    res.status(200).send({ message: "Data", ePayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint("/admin/all/e-content/payment/day)`
    );
  }
});

app.get("/all/playlist/list/data", async (req, res) => {
  try {
    const playlist = await Playlist.find({}).populate({
      path: "elearning",
      populate: {
        path: "elearningHead",
      },
    });
    res.status(200).send({ message: "playlist data", playlist });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/playlist/list/data)`
    );
  }
});

app.get("/all/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.find({ userId: `${id}` });
    res.status(200).send({ message: "pay", payment });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/payment/user/:id)`);
  }
});

app.get("/all/e-content/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ePayment = await PlaylistPayment.find({ userId: `${id}` });
    res.status(200).send({ message: "pay", ePayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/e-content/payment/user/:id)`
    );
  }
});

app.get("/all/fee/list/payment", async (req, res) => {
  try {
    const fee = await Fees.find({});
    res.status(200).send({ message: "Fee data", fee });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/fee/list/payment)`);
  }
});

app.get("/all/checklist/list/payment", async (req, res) => {
  try {
    const checklist = await Checklist.find({});
    res.status(200).send({ message: "checklist data", checklist });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/checklist/list/payment)`
    );
  }
});

app.get("/all/institute/list/data", async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({});
    res.status(200).send({ message: "Institute data", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/institute/list/data)`
    );
  }
});

app.get("/all/batch/list/data", async (req, res) => {
  try {
    const batch = await Batch.find({});
    res.status(200).send({ message: "Batch data", batch });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/batch/list/data)`);
  }
});

app.get("/admin/all/id-card/payment/day", async (req, res) => {
  try {
    const iPayment = await IdCardPayment.find({});
    res.status(200).send({ message: "Data", iPayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admin/all/id-card/payment/day)`
    );
  }
});

app.get("/all/video/list/data", async (req, res) => {
  try {
    const video = await Video.find({});
    res.status(200).send({ message: "Video Data", video });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/video/list/data)`);
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/deactivate/account)`
    );
  }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/feedback/:id)`);
  }
});

app.post("/feedback/remind/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { remindDate } = req.body;
    const user = await User.findById({ _id: id });
    user.remindLater = remindDate;
    await user.save();
    res.status(200).send({ message: "Remind me Later" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/feedback/remind/:id)`);
  }
});

app.get("/all/application/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const aPayment = await ApplyPayment.find({ userId: `${id}` });
    res.status(200).send({ message: "Data", aPayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/application/payment/user/:id)`
    );
  }
});

app.get("/all/application/list/data", async (req, res) => {
  try {
    const application = await DepartmentApplication.find({});
    res.status(200).send({ message: "Application Data", application });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/application/list/data)`
    );
  }
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
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user-detail)`);
  }
});

app.post("/user-detail-verify/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user-detail-verify/:id)`
    );
  }
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
  try {
    const { id } = req.params;
    const admins = await Admin.findById({ _id: "6247207f1d91bbdacaeb0883" });
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/profile-creation/:id)`);
  }
});

app.get("/create-user-password", (req, res) => {
  try {
    res.render("CreateUserPassword");
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/create-user-password)`);
  }
});

app.post("/create-user-password/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/create-user-password/:id)`
    );
  }
});

app.get("/userdashboard", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({ message: "All User List", users });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/userdashboard)`);
  }
});

app.get("/userdashboard/:id", async (req, res) => {
  try {
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
        path: "staff",
        populate: {
          path: "staffAdmissionAdmin",
        },
      })
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
      .populate({
        path: "staff",
        populate: {
          path: "financeDepartment",
        },
      })
      .populate("addUserInstitute")
      .populate({
        path: "staff",
        populate: {
          path: "sportDepartment",
        },
      })
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
        path: "staff",
        populate: {
          path: "staffSportClass",
        },
      })
      .populate({
        path: "support",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "staff",
        populate: {
          path: "elearning",
        },
      })
      .populate("videoPurchase")
      .populate({
        path: "staff",
        populate: {
          path: "library",
        },
      })
      .populate("InstituteReferals")
      .populate("admissionPaymentList");

    res.status(200).send({ message: "Your User", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/userdashboard/:id)`);
  }
});

app.get("/userdashboard/:id/user-post", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    res.render("userPost", { user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post)`
    );
  }
});

app.post("/userdashboard/:id/user-post", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const post = new UserPost({ ...req.body });
    post.imageId = "1";
    user.userPosts.push(post);
    post.user = user._id;
    await user.save();
    await post.save();
    res.status(200).send({ message: "Post Successfully Created", user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post)`
    );
  }
});

app.post(
  "/userdashboard/:id/user-post/image",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/image)`
      );
    }
  }
);

app.get("/userdashboard/user-post/images/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/user-post/images/:key)`
    );
  }
});

////////////FOR THE VIDEO UPLOAD//////////////////////////////////

app.post(
  "/userdashboard/:id/user-post/video",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/video)`
      );
    }
  }
);

app.get("/userdashboard/user-post/video/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/user-post/video/:key)`
    );
  }
});
////////////////////////////

app.put(
  "/userdashboard/:id/user-post/:uid/update",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, uid } = req.params;
      const { userPostStatus } = req.body;
      const userpost = await UserPost.findById({ _id: uid });
      userpost.userPostStatus = userPostStatus;
      await userpost.save();
      res.status(200).send({ message: "visibility change", userpost });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/:uid/update)`
      );
    }
  }
);

app.delete(
  "/userdashboard/:id/user-post/:uid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, uid } = req.params;
      await User.findByIdAndUpdate(id, { $pull: { userPosts: uid } });
      await User.findByIdAndUpdate(id, { $pull: { saveUsersPost: uid } });
      await UserPost.findByIdAndDelete({ _id: uid });
      res.status(200).send({ message: "deleted Post" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/:uid)`
      );
    }
  }
);

////////////////////////////

app.post("/userprofileabout/:id", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/userprofileabout/:id)`);
  }
});
app.get("/userprofileabout/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userprofileabout/photo/:key)`
    );
  }
});

app.post(
  "/userprofileabout/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userprofileabout/photo/:id)`
      );
    }
  }
);
app.get("/userprofileabout/coverphoto/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userprofileabout/coverphoto/:key)`
    );
  }
});

app.post(
  "/userprofileabout/coverphoto/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userprofileabout/coverphoto/:id)`
      );
    }
  }
);

////////////////////////////////

app.post("/user/post/like", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/post/like)`);
  }
});

app.post("/user/post/unlike", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/post/unlike)`);
  }
});

app.post("/user/post/comments/:id", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/post/comments/:id)`
    );
  }
});

app.put("/user/follow-ins/institute", async (req, res) => {
  try {
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
      res.status(200).send({ message: "Following This Institute" });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/follow-ins/institute)`
    );
  }
});

app.put("/user/unfollow/institute", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/unfollow/institute)`
    );
  }
});

app.post("/user-search-profile", isLoggedIn, async (req, res) => {
  try {
    // console.log(req.body
    const user = await User.findOne({
      userLegalName: req.body.userSearchProfile,
    });
    res.status(200).send({ message: "Search User Here", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user-search-profile)`);
  }
});

app.put("/user/follow-ins", async (req, res) => {
  try {
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
      res.status(200).send({ message: " Following This Institute" });
    }
    // }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/follow-ins)`);
  }
});

app.put("/user/circle-ins", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/circle-ins)`);
  }
});

app.put("/user/uncircle-ins", isLoggedIn, async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/uncircle-ins)`);
  }
});

app.post("/user/forgot", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/forgot)`);
  }
});

app.post("/user/forgot/:fid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/forgot/:fid)`);
  }
});

app.post("/user/reset/password/:rid", async (req, res) => {
  try {
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
        res
          .status(200)
          .send({ message: "Password Changed Successfully", user });
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/reset/password/:rid)`
    );
  }
});

app.post("/user-announcement/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const announcements = await new UserAnnouncement({ ...req.body });
    user.announcement.push(announcements);
    announcements.user = user;
    await user.save();
    await announcements.save();
    res.status(200).send({ message: "Successfully Created" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user-announcement/:id)`
    );
  }
});

// Institute Announcement Details
app.get("/user-announcement-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await UserAnnouncement.findById({ _id: id }).populate(
      "user"
    );
    res.status(200).send({ message: "Announcement Detail", announcement });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user-announcement-detail/:id)`
    );
  }
});

app.post("/user/save/post", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const user = await User.findById({ _id: req.session.user._id });
    const userPostsData = await UserPost.findById({ _id: postId });
    user.saveUsersPost.push(userPostsData);
    await user.save();
    res.status(200).send({ message: "Added To favourites", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/save/post)`);
  }
});

app.post("/user/unsave/post", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const user = await User.findById({ _id: req.session.user._id });
    const userPostsData = await UserPost.findById({ _id: postId });
    user.saveUsersPost.splice(userPostsData, 1);
    await user.save();
    res.status(200).send({ message: "Remove To favourites", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/unsave/post)`);
  }
});

app.post("/user/phone/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { userPhoneNumber } = req.body;
    const user = await User.findById({ _id: id });
    user.userPhoneNumber = userPhoneNumber;
    await user.save();
    res.status(200).send({ message: "Mobile No Updated", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/phone/info/:id)`);
  }
});

app.patch("/user/personal/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body);
    await user.save();
    res.status(200).send({ message: "Personal Info Updated", user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/personal/info/:id)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/add/ins/:iid)`
    );
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/add/user/:iid)`
    );
  }
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/:id/add/ins/:iid)`);
  }
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/add/user/:iid)`
    );
  }
});

////////////////////////////////////////////////////////////
//////////////////////////////////

////////////////////////////THIS IS E CONTENT API////////////////////////

// =========================================================== FOR ALL E CONTENT ROUTE =================================================
app.get("/insdashboard/:id/e-content", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "elearning"
    );
    res.status(200).send({ message: "data is fetched", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/e-content)`
    );
  }
});

app.post("/insdashboard/:id/e-content", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/e-content)`
    );
  }
});

app.get("/insdashboard/:id/e-content/info", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/e-content/info)`
    );
  }
});

////////////FOR AS THE USER ONLY////////////////////
app.get("/playlist", async (req, res) => {
  try {
    const playlist = await Playlist.find({}).populate({
      path: "topic",
      populate: {
        path: "video",
      },
    });
    res.status(200).send({ message: "fetched all details", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist)`);
  }
});

/////////////FOR THE USER SIDE//////////////////////

app.get("/e-content/:eid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid)`);
  }
});

app.post("/e-content/:eid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid)`);
  }
});

app.get("/e-content/:eid/:photo", async (req, res) => {
  try {
    const photo = req.params.photo;
    const readStream = getFileStream(photo);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/e-content/:eid/:photo)`
    );
  }
});

app.post("/e-content/:eid/photo", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid/photo)`);
  }
});

app.get("/e-content/:eid/:cover", async (req, res) => {
  try {
    const cover = req.params.cover;
    const readStream = getFileStream(cover);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/e-content/:eid/:cover)`
    );
  }
});

app.post("/e-content/:eid/cover", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid/cover)`);
  }
});

///////////////////////////////////FOR MAKING THE PLAYLIST FUNCTIONALITY////////////////////////////
app.get("/:eid/playlist", async (req, res) => {
  try {
    const { eid } = req.params;
    const elearning = await ELearning.findById({ _id: eid }).populate({
      path: "playlist",
    });
    res.status(200).send({ message: "All playlist is fetched", elearning });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:eid/playlist)`);
  }
});

app.post("/:eid/playlist/create", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:eid/playlist/create)`);
  }
});

app.get("/playlist/thumbnail/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/playlist/thumbnail/:key)`
    );
  }
});

app.get("/playlist/:pid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid)`);
  }
});

app.patch("/playlist/:pid/edit", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findByIdAndUpdate(pid, req.body);
    playlist.save();
    res.status(201).send({ message: "Edited Successfull" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/edit)`);
  }
});

app.put("/playlist/:pid/edit", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/edit)`);
  }
});

app.delete("/playlist/:pid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid)`);
  }
});

//////////////////FOR THE TOPIC ADD AND RETRIEVE /////////////////
app.get("/playlist/:pid/topic", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid }).populate({
      path: "topic",
      populate: {
        path: "video",
      },
    });

    res.status(200).send({ message: "playlist is fetched ", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/topic)`);
  }
});

app.post("/playlist/:pid/topic", async (req, res) => {
  try {
    const { pid } = req.params;
    const topic = new Topic(req.body);
    const playlist = await Playlist.findById({ _id: pid });
    playlist.topic.push(topic._id);
    topic.playlist = pid;
    await topic.save();
    await playlist.save();
    res.status(200).send({ message: "topic is Created " });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/topic)`);
  }
});

//////////////////////////////FOR THE UPLOAD VIDEO/////////////////////

app.post("/topic/:tid/upload", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/topic/:tid/upload)`);
  }
});

app.get("/oneVideo/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findById({ _id: vid }).populate({
      path: "resource",
      populate: {
        path: "resourceKeys",
      },
    });
    res.status(200).send({ message: "video fetched", video });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});

app.patch("/oneVideo/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findByIdAndUpdate(vid, req.body.formData);
    await video.save();
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});
app.put("/oneVideo/:vid", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});

app.delete("/oneVideo/:vid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});
app.get("/video/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = await getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/:key)`);
  }
});
/////////////////////////////EXTRACT ALL VIDEO FROM PLAYLIST/////////////////////

app.get("/playlist/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid }).populate({
      path: "video",
    });
    res.status(200).send({ message: "all video is fetched", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid)`);
  }
});

app.get("/playlist/video/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/video/:key)`);
  }
});

////////////////////FOR THE RESOURCES ONLY ////////////////////////////////

app.post("/video/:vid/resource", upload.array("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/:vid/resource)`);
  }
});

app.get("/resource/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/resource/:key)`);
  }
});

//////////////////////FOR USER SIDE LIKE AND SAVE FUNCTIONALITY////////////

app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(201).send({ message: "data is fetched", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id)`);
  }
});
app.get("/video/:vid/comment", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/:vid/comment)`);
  }
});

app.post("/:id/video/:vid/comment", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/:id/video/:vid/comment)`
    );
  }
});
app.get("/video/alllike/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const like = await Video.findById({ _id: vid });
    res.status(200).send({ message: "all liked fetched", like });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/alllike/:vid)`);
  }
});

app.post("/user/:id/video/:vid/like", async (req, res) => {
  try {
    const { vid } = req.params;
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const video = await Video.findById({ _id: vid });
    video.userLike.push(id);
    user.videoLike.push(vid);
    await user.save();
    await video.save();
    res.status(200).send({ message: "Like video" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/like)`
    );
  }
});
app.post("/user/:id/video/:vid/unlike", async (req, res) => {
  try {
    const { id, vid } = req.params;
    const video = await Video.findById({ _id: vid });
    const user = await User.findById({ _id: id });
    user.videoLike.splice(vid, 1);
    video.userLike.splice(id, 1);
    await user.save();
    await video.save();
    res.status(200).send({ message: "unLike video" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/unlike)`
    );
  }
});

app.get("/video/allbookmark/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const bookmark = await Video.findById({ _id: vid });
    res.status(200).send({ message: "all saved fetched", bookmark });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/video/allbookmark/:vid)`
    );
  }
});
app.post("/user/:id/video/:vid/bookmark", async (req, res) => {
  try {
    const { id, vid } = req.params;
    const user = await User.findById({ _id: id });
    const video = await Video.findById({ _id: vid });
    video.userSave.push(id);
    user.videoSave.push(vid);
    await user.save();
    await video.save();
    res.status(200).send({ message: "Save video" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/bookmark)`
    );
  }
});
app.post("/user/:id/video/:vid/unbookmark", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/unbookmark)`
    );
  }
});

app.post("/user/:id/video/:vid/watch", async (req, res) => {
  try {
    const { id, vid } = req.params;
    const user = await User.findById({ _id: id });
    user.watchLater.push(vid);
    await user.save();
    res.status(201).send({ message: "video gone to watch later" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/watch)`
    );
  }
});

//////////////////////////FOR USER SIDE ALL SAVE AND LIKE Functionality///////////////

app.get("/user/:id/userside", async (req, res) => {
  try {
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
        path: "watchLater",
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id/userside)`);
  }
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
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "library"
    );
    res.status(200).send({ message: "data is fetched", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/library)`
    );
  }
});

app.post("/insdashboard/:id/library", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/library)`
    );
  }
});

app.get("/insdashboard/:id/library/info", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/library/info)`
    );
  }
});

app.get("/library/allbook", async (req, res) => {
  try {
    const library = await Book.find({});
    res.status(200).send({ message: "fetched", library });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/allbook)`);
  }
});
/////////////FOR THE USER SIDE//////////////////////

app.get("/library/:lid", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid)`);
  }
});

app.post("/library/:lid/about", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/about)`);
  }
});

app.get("/library/:lid/:photo", async (req, res) => {
  try {
    const photo = req.params.photo;
    const readStream = getFileStream(photo);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/:photo)`);
  }
});
app.post("/library/:lid/photo", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/photo)`);
  }
});
app.get("/library/:lid/:cover", async (req, res) => {
  try {
    const cover = req.params.cover;
    const readStream = getFileStream(cover);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/:cover)`);
  }
});

app.post("/library/:lid/cover", upload.single("file"), async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/cover)`);
  }
});

////////////////////FOR THE LIBRARY BOOKS ONLY ///////////////////////

app.post(
  "/library/:lid/create-book",
  upload.single("file"),
  async (req, res) => {
    try {
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
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/library/:lid/create-book)`
      );
    }
  }
);

app.get("/book/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint()`);
  }
});

app.get("/onebook/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findById({ _id: bid });
    res.status(200).send({ message: "fetched", book });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/onebook/:bid)`);
  }
});
app.patch("/library/:lid/edit-book/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findByIdAndUpdate(bid, req.body);
    await book.save();
    res.status(201).send({ message: "book is updated updated" });
  } catch {
    console.log(
      "Some thing went wrong on this api /library/:lid/edit-book/:bid"
    );
  }
});
app.put(
  "/library/:lid/edit-book/:bid",
  upload.single("file"),
  async (req, res) => {
    try {
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
      const book = await Book.findById({ _id: bid });
      if (book.photo) {
        await deleteFile(book.photo);
      }
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
    } catch {
      console.log(
        "some thin went wrong on this api /library/:lid/edit-book/:bid"
      );
    }
  }
);

app.delete("/library/:lid/book/:bid", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/library/:lid/book/:bid)`
    );
  }
});

app.post("/library/:lid/issue", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/issue)`);
  }
});

///////////////////FOR COLLECT THE BOOK/////////////////////

app.post("/library/:lid/collect/:cid", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/library/:lid/collect/:cid)`
    );
  }
});

/////////FOR BORROW BOOK/////////////////////////////

app.get("/user/:id/borrow", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).populate({
      path: "student",
    });
    res.status(200).send({ user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id/borrow)`);
  }
});
app.get("/student/:id/borrow", async (req, res) => {
  try {
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
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/student/:id/borrow)`);
  }
});

// ============================ Vaibhav Admission Part ===========================
// institute Admission Admin Allotting

// Is Rought per status wapas nahi jaa raha hai...(important)
app.post(
  "/ins/:id/new-admission-admin",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
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

      res.status(200).send({
        message: "Successfully Assigned Staff",
        admissionAdmin,
        staff,
        institute,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/new-admission-admin)`
      );
    }
  }
);

app.get("/application/:aid/payment/success", async (req, res) => {
  try {
    const { aid } = req.params;
    const apply = await DepartmentApplication.findById({ _id: aid }).populate(
      "applicationFeePayment"
    );
    res.status(200).send({ message: "Application fee", apply });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/application/:aid/payment/success)`
    );
  }
});

app.get("/admission-applications-details/:sid", async (req, res) => {
  // console.log("/admission-applications-details/:sid");
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
        })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationFeePayment",
          },
        });
      res
        .status(200)
        .send({ message: "Department Application List", adAdminData });
    } else {
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-applications-details/:sid)`
    );
  }
});

// // find Admission Admin form ins Id
app.get("/admission-applications/details/:iid", async (req, res) => {
  try {
    const { iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: iid });

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
        })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationFeePayment",
          },
        });
      res
        .status(200)
        .send({ message: "Applications List Detail", adAdminData });
    } else {
      res.status(204).send({ message: "Applications Details Not Found" });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-applications/details/:iid)`
    );
  }
});

app.post("/admission-application/:sid", isLoggedIn, async (req, res) => {
  try {
    // console.log("/admission-application/:sid");
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
    res.status(200).send({ message: "Application Save Successfully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-application/:sid)`
    );
  }
});

app.post(
  "/admission-application/:aid/student-apply/:id",
  upload.array("file"),
  isLoggedIn,
  async (req, res) => {
    try {
      const { aid, id } = req.params;
      const newPreStudent = await new PreAppliedStudent(req.body);
      for (let file of req.files) {
        const results = await uploadDocFile(file);
        newPreStudent.studentAttachDocuments.push({
          docFieldName: file.originalname,
          docImagePath: results.key,
        });
        await unlinkFile(file.path);
      }
      const userText = await User.findById({ _id: id });
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
      dAppliText.admissionAdminName =
        dAppliText.applicationForDepartment.institute.insAdmissionAdmin;
      await dAppliText.studentData.push(studentDataObj);
      await dAppliText.save();
      await newPreStudent.save();
      await userText.save();
      res.status(200).send({ message: "Application Applied Successfully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/:aid/student-apply/:id)`
      );
    }
  }
);

app.get("/user/:id/applied-application-details/:aid", async (req, res) => {
  const { id, aid } = req.params;
  const ActApplication = await DepartmentApplication.findById({
    _id: aid,
  })
    .populate({
      path: "applicationForDepartment",
      populate: {
        path: "institute",
      },
    })
    .populate("admissionFeePayment");
  res
    .status(200)
    .send({ message: "Student Applied Application Details", ActApplication });
});

app.get("/batch/class/student/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid }).populate({
      path: "classroom",
      populate: {
        path: "ApproveStudent",
      },
    });
    res.status(200).send({ message: "Classes Are here", batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/batch/class/student/:bid)`
    );
  }
});

app.get("/user/:id/applied-application", async (req, res) => {
  try {
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
    res.status(200).send({
      message: "Student Applied Application List",
      applicationList,
      id,
    });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/applied-application)`
    );
  }
});
app.post(
  "/admission-application/confirm-student-auto/:aid",
  async (req, res) => {
    try {
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
      }
      dAppliText.autoUpdateProcess.selectionStatus = "Updated";
      await dAppliText.save();
      console.log("working Application");
      res
        .status(200)
        .send({ message: "Student Move to Selected SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/confirm-student-auto/:aid)`
      );
    }
  }
);

app.get("/admission-preapplied/student-details/:aid", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-preapplied/student-details/:aid)`
    );
  }
});
app.post("/admission-application/select-student/:aid", async (req, res) => {
  try {
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
    dAppliText.studentData[preStudNum].studentSelectedRound =
      actRound.roundName;
    const uid = appStList[preStudNum].studentDetails.userId._id;
    const userText = await User.findById({
      _id: uid,
    });
    const notiObj = {
      notificationType: 2,
      notification: `You have been selected in ${
        dAppliText.applicationForDepartment.institute.insName
      } 
    for ${dAppliText.applicationForDepartment.dName} Department in ${
        actRound.roundName
      }. 
    Confirm your admission or float to next round Last Date to action is 
    ${moment(actRound.candidateSelectionLastDate).format("DD/MM/YYYY")}.`,
      actonBtnText: "Pay & confirm",
      deActBtnText: "Float",
    };
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
    await userText.save();
    await dAppliText.save();
    res.status(200).send({ message: "Student Selected SuccessFully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-application/select-student/:aid)`
    );
  }
});

// app.post(
//   "/admission-application/applicationfee-payed-student/:aid/:id",
//   async (req, res) => {
//     try {
//       const { aid, id } = req.params;
//       const { actRound } = req.body;
//       const dAppliText = await DepartmentApplication.findById({ _id: aid })
//         .populate({
//           path: "studentData",
//           populate: {
//             path: "studentDetails",
//             populate: {
//               path: "userId",
//             },
//           },
//         })
//         .populate({
//           path: "applicationForDepartment",
//           populate: {
//             path: "institute",
//           },
//         });
//       const appStList = dAppliText.studentData;
//       const preStudNum = appStList.findIndex(
//         (x) => x.studentDetails.userId._id == id
//       );
//       dAppliText.studentData[preStudNum].studentStatus = "AdPayed";
//       dAppliText.studentData[preStudNum].admissionFeeStatus = "Payed";
//       // dAppliText.studentData[preStudNum].studentSelectedRound = actRound.roundName;
//       const userText = await User.findById({
//         _id: appStList[preStudNum].studentDetails.userId._id,
//       });
//       const notiObj = {
//         notificationType: 1,
//         notification: `Your admission have been confirmed. Please visit ${
//           dAppliText.applicationForDepartment.institute.insName
//         } with Required Documents to confirm your seat. Last Date for document submission -
//           ${moment(actRound.candidateSelectionLastDate).format("DD/MM/YYYY")}.`,
//         // actonBtnText: "Pay & confirm",
//         // deActBtnText: "Float",
//       };
//       const indexofApp = userText.appliedForApplication.findIndex(
//         (x) => (x.appName = dAppliText._id)
//       );

//       userText.appliedForApplication[indexofApp].appUpdates.pop();
//       userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

//       await userText.save();
//       await dAppliText.save();

//       res
//         .status(200)
//         .send({ message: "Student Application Fee Payed SuccessFully" });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/admission-application/applicationfee-payed-student/:aid/:id)`
//       );
//     }
//   }
// );

app.post(
  "/admission-application/application-floated-student/:aid/:id",
  async (req, res) => {
    try {
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

      let roundList = dAppliText.rounds;
      let actRondIndex = roundList.findIndex(
        (x) => x.roundName == actRound.roundName
      );

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

      const userText = await User.findById({
        _id: appStList[preStudNum].studentDetails.userId._id,
      });
      const indexofApp = userText.appliedForApplication.findIndex(
        (x) => (x.appName = dAppliText._id)
      );

      userText.appliedForApplication[indexofApp].appUpdates.pop();
      userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

      await userText.save();
      await dAppliText.save();

      res.status(200).send({ message: "Student float SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/application-floated-student/:aid/:id)`
      );
    }
  }
);
app.post("/admission-application/confirm-lc-student/:aid", async (req, res) => {
  try {
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
    dAppliText.studentData[preStudNum].studentSelectedRound =
      actRound.roundName;
    const userText = await User.findById({
      _id: appStList[preStudNum].studentDetails.userId._id,
    });
    const notiObj = {
      notificationType: 1,
      notification: `Welcome to ${dAppliText.applicationForDepartment.institute.insName}.
    your seat has been confirmed. You will be alloted your class, stay updated.`,
    };
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
    await userText.save();
    await dAppliText.save();
    res.status(200).send({ message: "Student Confirmed SuccessFully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-application/confirm-lc-student/:aid)`
    );
  }
});

app.post(
  "/admission-application/:aid/class-allot-student/:stid",
  async (req, res) => {
    try {
      console.log("/admission-application/class-allot-student");
      const { aid, stid } = req.params;
      const { classAllotData } = req.body;
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
        studentProfilePhoto: StText.studentAttachDocuments[0].docImagePath,
        photoId: "1",
        studentFirstName: StText.studentFirstName,
        studentMiddleName: StText.studentMiddleName,
        studentLastName: StText.studentLastName,
        studentDOB: StText.studentDOB,
        studentGender: StText.studentGender,
        studentNationality: StText.studentNationality,
        studentMTongue: StText.studentMTongue,
        studentCast: StText.studentCast,
        studentCastCategory: StText.studentCastCategory,
        studentReligion: StText.studentReligion,
        studentBirthPlace: StText.studentBirthPlace,
        studentDistrict: StText.studentDistrict,
        studentState: StText.studentState,
        studentAddress: StText.studentAddress,
        studentPhoneNumber: StText.studentPhoneNumber,
        studentParentsName: StText.studentParents_Name,
        studentParentsPhoneNumber: StText.studentParents_ContactNo,
        studentDocuments: StText.studentAttachDocuments[1].docImagePath,
        studentMothersName: StText.studentPName,
      });

      const appStList = dAppliText.studentData;
      const preStudNum = appStList.findIndex(
        (x) => x.studentDetails._id == stid
      );
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
      let adAdmin = await AdmissionAdmin.findById({
        _id: institute.insAdmissionAdmin,
      });
      let previousApprovedSt = adAdmin.feeCollection.totalAdmissionApprove;
      adAdmin.feeCollection.totalAdmissionApprove = previousApprovedSt + 1;

      institute.student.push(studentData);
      studentData.institute = institute;
      userText.student.push(studentData);
      studentData.user = userText;
      classText.ApproveStudent.push(studentData);
      studentData.studentClass = classText;

      await institute.save();
      await classText.save();
      await studentData.save();
      await userText.save();
      await dAppliText.save();
      res.status(200).send({ message: "Student Class Alloted SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/:aid/class-allot-student/:stid)`
      );
    }
  }
);

app.post(
  "/admission-application/class-allot-cancel-student/:aid",
  async (req, res) => {
    try {
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
      const preStudNum = appStList.findIndex(
        (x) => x.studentDetails._id == stId
      );
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
      userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
      await userText.save();
      await dAppliText.save();
      res
        .status(200)
        .send({ message: "Student Application Canciled SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/class-allot-cancel-student/:aid)`
      );
    }
  }
);

/////////////FOR IMAGE AND ALL FILE UPLOAD///////////////////////

app.get("/staffadminssionalldata/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const admissionAdmin = await AdmissionAdmin.findById({ _id: sid });
    res.status(201).send({ message: "all data fetched", admissionAdmin });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staffadminssionalldata/:sid)`
    );
  }
});

app.get("/staffadminssionimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log("some thing went /staffadminssionimage/photo/:key");
  }
});
app.post(
  "/staffadminssionimage/photo/:aid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { aid } = req.params;
      const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
      if (admissionAdmin.photo) {
        await deleteFile(admissionAdmin.photo);
      }
      const width = 200;
      const height = 200;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      admissionAdmin.photo = results.key;
      admissionAdmin.photoId = "0";
      await admissionAdmin.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log("some thing went /staffadminssionimage/photo/:aid");
    }
  }
);

app.get("/staffadminssionimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log("some thing went /staffadminssionimage/cover/:key");
  }
});
app.post(
  "/staffadminssionimage/coverphoto/:aid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { aid } = req.params;
      const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
      if (admissionAdmin.cover) {
        await deleteFile(admissionAdmin.cover);
      }
      const width = 840;
      const height = 250;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      admissionAdmin.cover = results.key;
      admissionAdmin.coverId = "0";
      await admissionAdmin.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log("some thing went /staffadminssionimage/coverphoto/:aid");
    }
  }
);

// / Department Batch Class and Subject Lock and Student Premote Rought Start Here

// Staff Section Batch Class Subject Lock rought start here
app.post("/staff/subject-lock/:suid", async (req, res) => {
  console.log("staff/subject-lock/:suid");
  const { suid } = req.params;
  const subjectText = await Subject.findById({ _id: suid });
  subjectText.subjectStatus = "Locked";
  await subjectText.save();
  console.log("Subject Status Locked SuccessFully");
  res.status(200).send({ message: "Subject Status Locked SuccessFully" });
});

app.post("/staff/class-lock/:cid", async (req, res) => {
  console.log("staff/class-lock/:cid");
  const { cid } = req.params;
  const classText = await Class.findById({ _id: cid });
  let studentList = classText.ApproveStudent;
  for (let i = 0; i < studentList.length; i++) {
    let stDataText = await Student.findById({ _id: studentList[i] });
    stDataText.studentPromoteStatus = "Not Promoted";
    await stDataText.save();
  }
  classText.classStatus = "Locked";
  await classText.save();
  console.log("Class Status Locked SuccessFully");
  res.status(200).send({ message: "Class Status Locked SuccessFully" });
});

app.post("/staff/batch-lock/:bid", async (req, res) => {
  console.log("staff/batch-lock/:bid");
  const { bid } = req.params;
  const batchText = await Batch.findById({ _id: bid });
  batchText.batchStatus = "Locked";
  await batchText.save();
  console.log("Batch Status Locked SuccessFully");
  res.status(200).send({ message: "Batch Status Locked SuccessFully" });
});

// Student Promote Rought

app.post("/class-promote/allStudent/:cid", async (req, res) => {
  console.log("/class-promote/allStudent/:cid");
  const { cid } = req.params;
  const { d } = req.body;
  const classText = await Class.findById({ _id: d.promoteClassId });

  const instituteText = await Institute.findById({ _id: classText.institute });

  const adAdmin = await AdmissionAdmin.findById({
    _id: instituteText.insAdmissionAdmin,
  });

  let studentList = d.studentList;
  for (let i = 0; i < studentList.length; i++) {
    let stDataText = await Student.findById({ _id: studentList[i]._id });
    const preYearData = {
      classId: stDataText.studentClass,
      studentMarks: stDataText.studentMarks,
      studentFinalReportData: stDataText.studentFinalReportData,
      studentBehaviourStatus: stDataText.studentBehaviourStatus,
    };
    stDataText.previousClassData.push(preYearData);
    stDataText.studentClass = cid;
    stDataText.studentPromoteStatus = "Promoted";
    (stDataText.studentMarks = []),
      (stDataText.studentBehaviourReportStatus = "Not Ready"),
      (stDataText.studentBehaviourStatus = null),
      (stDataText.studentStatus = "Approved");
    studentFinalReportFinalizedStatus = "Not Ready";
    (stDataText.studentFinalReportData = []), await stDataText.save();
    classText.ApproveStudent.push(stDataText);
    let count = adAdmin.feeCollection.totalAdmissionApprove;

    adAdmin.feeCollection.totalAdmissionApprove = count + 1;
  }
  await classText.save();
  await adAdmin.save();
  console.log("Student Premoted SuccessFully");
  res.status(200).send({ message: "Students Premoted SuccessFully" });
});

app.get("/admission-admin/detail/:aaid", async (req, res) => {
  try {
    const { aaid } = req.params;
    console.log(aaid);
    const admissionAdmin = await AdmissionAdmin.findById({ _id: aaid })
      .populate("adAdminName")
      .populate({
        path: "institute",
        populate: {
          path: "financeDepart",
        },
        populate: {
          path: "depart",
          populate: {
            path: "batches",
          },
          populate: {
            path: "class",
          },
        },
      });
    res.status(200).send({ admissionAdmin });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-admin/detials/:aaid)`
    );
  }
});

app.post(
  "/staff/admission-admin-info/:aid/set-info",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { aid } = req.params;
      console.log(aid);
      const admissionInfoData = req.body;
      const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
      admissionAdmin.contactNumber = admissionInfoData.admissionPhoneNumber;
      admissionAdmin.emailId = admissionInfoData.admissionEmail;
      admissionAdmin.about = admissionInfoData.admissionAbout;
      await admissionAdmin.save();
      res.status(200).send(admissionAdmin);
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/staff/admission-admin-info/:aid)`
      );
    }
  }
);

// Department Batch Class and Subject Lock and Student Premote Rought Start Here

// ============================ Vaibhav Extra-Curricular ===========================

app.get("/department-elections-details/:did", async (req, res) => {
  try {
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department-elections-details/:did)`
    );
  }
});

app.post("/department-election-creation/:did", isLoggedIn, async (req, res) => {
  try {
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
    res
      .status(200)
      .send({ message: "Department Election is Created.", classrooms });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department-election-creation/:did)`
    );
  }
});

app.get("/admission/admin/:aid/payment/success", async (req, res) => {
  try {
    const { aid } = req.params;
    const adAdmin = await AdmissionAdmin.findById({ _id: aid }).populate({
      path: "institute",
      populate: {
        path: "financeDepart",
      },
    });
    res.status(200).send({ message: "Data", adAdmin });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission/admin/:aid/payment/success)`
    );
  }
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

app.delete("/delBatch/:bid", update.delBatch);
app.patch("/updateBatch/:bid", update.updateBatch);

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
