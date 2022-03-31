require("dotenv").config();
const paytm = require("paytmchecksum");
const https = require("https");
const User = require("../models/User");
const DepartmentApplication = require("../models/DepartmentApplication");
const InstituteAdmin = require("../models/InstituteAdmin");
const ApplyPayment = require("../models/ApplyPayment");
const Finance = require("../models/Finance");
const { v4: uuidv4 } = require("uuid");

// ================================== Application Payment Portal ====================================
// ================= Check All Controllers Regarding Application Payment =====================

// ================ Application Payment Initiate ====================

exports.processApplicationPayment = async (req, res, next) => {
  const { amount, uid, aid, iid, fid } = req.body;
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
  )}/api/v1/application/callback/${uid}/apply/${aid}/ins/${iid}/finance/${fid}`;
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

// =============== Application CallBack Response =================

exports.paytmApplicationResponse = (req, res, next) => {
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
              addApplicationPayment(body, uid, aid, iid);
              userApplicationUpdated(uid, aid, iid, fid, status, price);
              res.redirect(
                `${process.env.FRONT_REDIRECT_URL}/user/${uid}/insjoinandapply/${iid}/application-apply/${aid}`
              );
            } else {
              res.redirect(`${process.env.FRONT_REDIRECT_URL}/`);
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

// ====================== Application Payment Schema Developing =======================

const addApplicationPayment = async (data, userId, applyId, insId) => {
  try {
    const user = await User.findById({ _id: userId });
    const apply = await new ApplyPayment(data);
    apply.userId = userId;
    apply.applicationId = applyId;
    apply.insId = insId;
    user.applicationPaymentList.push(apply);
    await apply.save();
    await user.save();
  } catch (error) {
    console.log("apply Payment Failed!");
  }
};

// ======================= Application Response Regarding ==========================

const userApplicationUpdated = async (
  userId,
  applyId,
  insId,
  financeId,
  statusType,
  tx_apAmount
) => {
  try {
    const user = await User.findById({ _id: userId });
    const application = await DepartmentApplication.findById({ _id: applyId });
    const institute = await InstituteAdmin.findById({ _id: insId });
    const finance = await Finance.findById({ _id: financeId });
    application.applicationFeePayment.push(user);
    // user.applicationPaymentList.push(application)
    institute.insApplicationBalance =
      institute.insApplicationBalance + parseInt(tx_apAmount);
    finance.financeApplicationBalance =
      finance.financeApplicationBalance + parseInt(tx_apAmount);
    await application.save();
    // await user.save()
    await institute.save();
    await finance.save();
  } catch {}
};
