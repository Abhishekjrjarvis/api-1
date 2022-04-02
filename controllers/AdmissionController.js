require("dotenv").config();
const paytm = require("paytmchecksum");
const https = require("https");
const User = require("../models/User");
const DepartmentApplication = require("../models/DepartmentApplication");
const InstituteAdmin = require("../models/InstituteAdmin");
const ApplyPayment = require("../models/ApplyPayment");
const Finance = require("../models/Finance");
const { v4: uuidv4 } = require("uuid");

// ================================== Admission Payment Portal ====================================
// ================= Check All Controllers Regarding Admission Payment =====================

// ================ Admission Payment Initiate ====================

exports.processAdmissionPayment = async (req, res, next) => {
  const { amount, uid, aid, iid, fid } = req.body;
  var params = {};
  params["MID"] = process.env.PAYTM_MID;
  params["WEBSITE"] = process.env.PAYTM_WEBSITE;
  params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
  params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
  params["ORDER_ID"] = "oid" + uuidv4();
  params["CUST_ID"] = process.env.PAYTM_CUST_ID;
  params["TXN_AMOUNT"] = amount;
  params["CALLBACK_URL"] = `https://${req.get(
    "host"
  )}/api/v1/admission/callback/${uid}/apply/${aid}/ins/${iid}/finance/${fid}`;
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

// =============== Admission CallBack Response =================

exports.paytmAdmissionResponse = (req, res, next) => {
  const { uid, aid, iid, fid } = req.params;
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
              addAdmissionPayment(body, uid, aid, iid);
              userAdmissionUpdated(uid, aid, iid, fid, status, price);
              res.redirect(`https://qviple.com/userdashboard/${uid}`);
            } else {
              res.redirect("https://qviple.com/");
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

// ====================== Admission Payment Schema Developing =======================

const addAdmissionPayment = async (data, userId, applyId, insId) => {
  try {
    const user = await User.findById({ _id: userId });
    const apply = await new ApplyPayment(data);
    apply.userId = userId;
    apply.admissionId = applyId;
    apply.insId = insId;
    user.admissionPaymentList.push(apply);
    await apply.save();
    await user.save();
  } catch (error) {
    console.log("admission Payment Failed!");
  }
};

// ======================= Admission Response Regarding ==========================

const userAdmissionUpdated = async (
  userId,
  applyId,
  insId,
  financeId,
  statusType,
  tx_adAmount
) => {
  try {
    // const user = await User.findById({ _id: userId });
    const institute = await InstituteAdmin.findById({ _id: insId });
    const finance = await Finance.findById({ _id: financeId });
    const dAppliText = await DepartmentApplication.findById({ _id: applyId })
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
      (x) => x.studentDetails.userId._id == userId
    );
    dAppliText.studentData[preStudNum].studentStatus = "AdPayed";
    dAppliText.studentData[preStudNum].admissionFeeStatus = "Payed";
    const userText = await User.findById({
      _id: userId,
    });
    const notiObj = {
      notificationType: 1,
      notification: `Your admission have been confirmed. Please visit ${dAppliText.applicationForDepartment.institute.insName} with Required Documents to confirm your seat.  
        `,
    };
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );

    userText.appliedForApplication[indexofApp].appUpdates.pop();
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

    dAppliText.admissionFeePayment.push(userText);
    institute.insAdmissionBalance =
      institute.insAdmissionBalance + parseInt(tx_adAmount);
    finance.financeAdmissionBalance =
      finance.financeAdmissionBalance + parseInt(tx_adAmount);

    await userText.save();
    await dAppliText.save();
    await institute.save();
    await finance.save();
  } catch {
    console.log("something went wrong in Admission Status");
  }
};
