// const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paytm = require("paytmchecksum");
const https = require("https");
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const Fees = require("../models/Fees");
const Checklist = require("../models/Checklist");
const Finance = require("../models/Finance");
const User = require("../models/User");
const PlaylistPayment = require("../models/PlaylistPayment");
const Playlist = require("../models/Playlist");
const ApplyPayment = require("../models/ApplyPayment");
const IdCardPayment = require("../models/IdCardPayment");
const Admin = require("../models/superAdmin");
const InstituteAdmin = require("../models/InstituteAdmin");
const Batch = require("../models/Batch");
// const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require("uuid");

// Process Payment
exports.processPayment = async (req, res, next) => {
  const { amount, fiid, uid, sid, fid } = req.body;

  var params = {};

  /* initialize an array */
  params["MID"] = process.env.PAYTM_MID;
  params["WEBSITE"] = process.env.PAYTM_WEBSITE;
  params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
  params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
  params["ORDER_ID"] = "oid" + uuidv4();
  params["CUST_ID"] = process.env.PAYTM_CUST_ID;
  params["TXN_AMOUNT"] = amount;
  // params["CALLBACK_URL"] = `${req.protocol}://${req.get("host")}/api/v1/callback`;
  params["CALLBACK_URL"] = `http://${req.get(
    "host"
  )}/api/v1/callback/pay/${fiid}/${uid}/student/${sid}/fee/${fid}`;

  let paytmChecksum = paytm.generateSignature(
    params,
    process.env.PAYTM_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };

      res.status(200).json({
        paytmParams,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

// Paytm Callback
exports.paytmResponse = (req, res, next) => {
  const { fiid, uid, sid, fid } = req.params;

  // console.log(req.body, req.params);

  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;

  let isVerifySignature = paytm.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    // console.log("Checksum Matched");

    var paytmParams = {};

    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
    };

    paytm
      .generateSignature(
        JSON.stringify(paytmParams.body),
        process.env.PAYTM_MERCHANT_KEY
      )
      .then(function (checksum) {
        paytmParams.head = {
          signature: checksum,
        };

        /* prepare JSON string for request */
        var post_data = JSON.stringify(paytmParams);

        var options = {
          /* for Staging */
          hostname: "securegw-stage.paytm.in",
          /* for Production */
          // hostname: 'securegw.paytm.in',
          port: 443,
          path: "/v3/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };

        // Set up the request
        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            let { body } = JSON.parse(response);
            let status = body.resultInfo.resultStatus;
            // res.json(body);
            let price = body.txnAmount;

            if (status === "TXN_SUCCESS") {
              addPayment(body, sid, fid, uid);
              studentPaymentUpdated(fiid, sid, fid, status, price);
              res.redirect(
                `http://107.20.124.171:3000/user/${uid}/student/fee/${sid}`
              );
            } else {
              res.redirect(`http://107.20.124.171:3000/`);
            }
            // res.redirect(`${req.protocol}://${req.get("host")}/order/${body.orderId}`)
          });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();
      });
  } else {
    console.log("Checksum Mismatched");
  }
};

const addPayment = async (data, studentId, feeId, userId) => {
  try {
    const student = await Student.findById({ _id: studentId });
    const payment = await new Payment(data);
    payment.studentId = studentId;
    payment.feeId = feeId;
    payment.userId = userId;
    student.paymentList.push(payment);
    await payment.save();
    await student.save();
  } catch (error) {
    console.log("Payment Failed!");
  }
};

const studentPaymentUpdated = async (
  financeId,
  studentId,
  feeId,
  statusType,
  tx_amount
) => {
  try {
    const student = await Student.findById({ _id: studentId });
    const finance = await Finance.findById({ _id: financeId }).populate({
      path: "institute",
    });
    const fData = await Fees.findById({ _id: feeId });
    const checklistData = await Checklist.findById({ _id: feeId });
    if (fData) {
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
          fData.feeStatus = statusType;
          fData.studentsList.push(student);
          fData.feeStudent = student;
          student.onlineFeeList.push(fData);
          finance.financeBankBalance =
            finance.financeBankBalance + parseInt(tx_amount);
          finance.institute.insBankBalance =
            finance.institute.insBankBalance + parseInt(tx_amount);
          await student.save();
          await fData.save();
          await finance.save();
          await finance.institute.save();
        } catch {}
      }
    } else if (checklistData) {
      if (
        checklistData.studentsList.length >= 1 &&
        checklistData.studentsList.includes(String(student._id))
      ) {
        res.status(200).send({
          message: `${student.studentFirstName} paid the ${checklistData.checklistName}`,
        });
      } else {
        try {
          student.studentChecklist.push(checklistData);
          checklistData.checklistFeeStatus = statusType;
          checklistData.studentsList.push(student);
          checklistData.checklistStudent = student;
          student.onlineCheckList.push(checklistData);
          finance.financeBankBalance =
            finance.financeBankBalance + parseInt(tx_amount);
          finance.institute.insBankBalance =
            finance.institute.insBankBalance + parseInt(tx_amount);
          await student.save();
          await checklistData.save();
          await finance.save();
          await finance.institute.save();
        } catch {}
      }
    }
  } catch {}
};

exports.getPaymentStatus = async (req, res, next) => {
  const payment = await Payment.findOne({ orderId: req.params.id });

  if (!payment) {
    // return next(new ErrorHandler("Payment Details Not Found", 404));
    console.log("Payment Details Not Found");
  }

  const txn = {
    id: payment.txnId,
    status: payment.resultInfo.resultStatus,
  };

  res.status(200).json({
    success: true,
    txn,
  });
};

// ================================== E-Content Payment Portal ====================================
// ================= Check All Controllers Regarding EContent Payment =====================

// ================ EContent Payment Initiate ====================

exports.processEContentPayment = async (req, res, next) => {
  const { amount, pid, uid, fid } = req.body;
  var params = {};
  params["MID"] = process.env.PAYTM_MID;
  params["WEBSITE"] = process.env.PAYTM_WEBSITE;
  params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
  params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
  params["ORDER_ID"] = "oid" + uuidv4();
  params["CUST_ID"] = process.env.PAYTM_CUST_ID;
  params["TXN_AMOUNT"] = amount;
  params["CALLBACK_URL"] = `http://${req.get(
    "host"
  )}/api/v1/e-content/callback/user/${uid}/playlist/${pid}/ins/${fid}`;
  let paytmChecksum = paytm.generateSignature(
    params,
    process.env.PAYTM_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };
      res.status(200).json({
        paytmParams,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

// =============== EContent CallBack Response =================

exports.paytmEContentResponse = (req, res, next) => {
  const { uid, pid, fid } = req.params;
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = paytm.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
    };
    paytm
      .generateSignature(
        JSON.stringify(paytmParams.body),
        process.env.PAYTM_MERCHANT_KEY
      )
      .then(function (checksum) {
        paytmParams.head = {
          signature: checksum,
        };
        var post_data = JSON.stringify(paytmParams);
        var options = {
          hostname: "securegw-stage.paytm.in",
          // hostname: 'securegw.paytm.in',
          port: 443,
          path: "/v3/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };
        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });
          post_res.on("end", function () {
            let { body } = JSON.parse(response);
            let status = body.resultInfo.resultStatus;
            // res.json(body);
            let price = body.txnAmount;
            if (status === "TXN_SUCCESS") {
              addEContentPayment(body, uid, pid);
              userEContentUpdated(uid, pid, fid, status, price);
              res.redirect(
                `http://107.20.124.171:3000/user/${uid}/e-content/playlist/${pid}`
              );
            } else {
              res.redirect(`http://107.20.124.171:3000/`);
            }
          });
        });
        post_req.write(post_data);
        post_req.end();
      });
  } else {
    console.log("Checksum Mismatched");
  }
};

// ====================== EContent Payment Schema Developing =======================

const addEContentPayment = async (data, userId, playlistId) => {
  try {
    const user = await User.findById({ _id: userId });
    const playlistPayment = await new PlaylistPayment(data);
    playlistPayment.userId = userId;
    playlistPayment.playlistId = playlistId;
    user.playlistPayment.push(playlistPayment);
    await playlistPayment.save();
    await user.save();
  } catch (error) {
    console.log("playlistPayment Failed!");
  }
};

// ======================= EContent Playlist Purchase Response Regarding ==========================

const userEContentUpdated = async (
  userId,
  playlistId,
  financeId,
  statusType,
  tx_amounts
) => {
  try {
    const user = await User.findById({ _id: userId });
    const playlist = await Playlist.findById({ _id: playlistId }).populate({
      path: "elearning",
    });
    const finance = await Finance.findById({ _id: financeId }).populate({
      path: "institute",
    });
    playlist.joinNow.push(userId);
    playlist.salse = playlist.salse + 1;
    playlist.enroll = playlist.enroll + 1;
    user.playlistJoin.push(playlistId);
    playlist.elearning.bankBalance =
      playlist.elearning.bankBalance + parseInt(tx_amounts);
    finance.financeEContentBalance =
      finance.financeEContentBalance + parseInt(tx_amounts);
    finance.institute.insEContentBalance =
      finance.institute.insEContentBalance + parseInt(tx_amounts);
    await user.save();
    await playlist.save();
    await playlist.elearning.save();
    await finance.save();
    await finance.institute.save();
    res.status(200).send({ message: "you have joined playlist" });
  } catch {}
};

// ================================== Id Card Payment Portal ====================================
// ================= Check All Controllers Regarding Id Card Payment =====================

// ================ Id Card Payment Initiate ====================

exports.processIdCardPayment = async (req, res, next) => {
  const { amount, id, batchId } = req.body;
  var params = {};
  params["MID"] = process.env.PAYTM_MID;
  params["WEBSITE"] = process.env.PAYTM_WEBSITE;
  params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
  params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
  params["ORDER_ID"] = "oid" + uuidv4();
  params["CUST_ID"] = process.env.PAYTM_CUST_ID;
  params["TXN_AMOUNT"] = amount;
  params["CALLBACK_URL"] = `http://${req.get(
    "host"
  )}/api/v1/callback/ins/${id}/batch/${batchId}`;
  let paytmChecksum = paytm.generateSignature(
    params,
    process.env.PAYTM_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };
      res.status(200).json({
        paytmParams,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

// =============== Id Card CallBack Response =================

exports.paytmIdCardResponse = (req, res, next) => {
  const { id, batchId } = req.params;
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = paytm.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
    };
    paytm
      .generateSignature(
        JSON.stringify(paytmParams.body),
        process.env.PAYTM_MERCHANT_KEY
      )
      .then(function (checksum) {
        paytmParams.head = {
          signature: checksum,
        };
        var post_data = JSON.stringify(paytmParams);
        var options = {
          hostname: "securegw-stage.paytm.in",
          // hostname: 'securegw.paytm.in',
          port: 443,
          path: "/v3/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };
        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });
          post_res.on("end", function () {
            let { body } = JSON.parse(response);
            let status = body.resultInfo.resultStatus;
            // res.json(body);
            let price = body.txnAmount;
            if (status === "TXN_SUCCESS") {
              addIdCardPayment(body, id, batchId);
              userIdCardUpdated(id, batchId, status, price);
              res.redirect(`http://107.20.124.171:3000/ins/${id}/student/card`);
            } else {
              res.redirect(`http://107.20.124.171:3000/`);
            }
          });
        });
        post_req.write(post_data);
        post_req.end();
      });
  } else {
    console.log("Checksum Mismatched");
  }
};

// ====================== IdCard Payment Schema Developing =======================

const addIdCardPayment = async (data, insId, bid) => {
  try {
    const idcard = await new IdCardPayment(data);
    const admin = await Admin.findById({ _id: "623b803ab9b2954fcea8328e" });
    idcard.insId = insId;
    idcard.batchId = bid;
    admin.idCardPaymentList.push(idcard);
    await idcard.save();
    await admin.save();
  } catch (error) {
    console.log("Id Card Payment Failed!");
  }
};

// ======================= Id Card Purchase Response Regarding ==========================

const userIdCardUpdated = async (insId, bid, statusType, tx_iAmounts) => {
  try {
    const institute = await InstituteAdmin.findById({ _id: insId });
    const admin = await Admin.findById({ _id: "623b803ab9b2954fcea8328e" });
    var batch = await Batch.findById({ _id: bid });
    institute.idCardBatch.push(batch);
    admin.instituteIdCardBatch.push(batch);
    admin.idCardBalance = admin.idCardBalance + parseInt(tx_iAmounts);
    batch.batchPaymentStatus = statusType;
    await institute.save();
    await admin.save();
    await batch.save();
  } catch {}
};

