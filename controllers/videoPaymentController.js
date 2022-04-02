require("dotenv").config();
const paytm = require("paytmchecksum");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Playlist = require("../models/Playlist");
const Finance = require("../models/Finance");
const PlaylistPayment = require("../models/PlaylistPayment");
const Video = require("../models/Video");

// ================================== Video Payment Portal ====================================
// ================= Check All Controllers Regarding Video Payment =====================

// ================ Video Payment Initiate ====================

exports.processVideoPayment = async (req, res, next) => {
  const { amount, pid, uid, fid, vid } = req.body;
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
  )}/api/v1/e-content/video/callback/user/${uid}/playlist/${pid}/video/${vid}/ins/${fid}`;
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

// =============== Video CallBack Response =================

exports.paytmVideoResponse = (req, res, next) => {
  const { uid, pid, fid, vid } = req.params;
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
              addVideoPayment(body, uid, vid, pid);
              userVideoUpdated(uid, pid, fid, vid, status, price);
              res.redirect(`https://qviple.com/user/${uid}/e-content`);
            } else {
              res.redirect(`https://qviple.com/`);
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

// ====================== Video Payment Schema Developing =======================

const addVideoPayment = async (data, userId, videoId, playlistId) => {
  try {
    const user = await User.findById({ _id: userId });
    const playlistPayment = await new PlaylistPayment(data);
    playlistPayment.userId = userId;
    playlistPayment.videoId = videoId;
    playlistPayment.playlistId = playlistId;
    user.playlistPayment.push(playlistPayment);
    await playlistPayment.save();
    await user.save();
  } catch (error) {
    console.log("video Payment Failed!");
  }
};

// ======================= Video Purchase Response Regarding ==========================

const userVideoUpdated = async (
  userId,
  playlistId,
  financeId,
  videoId,
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
    const video = await Video.findById({ _id: videoId });
    user.videoPurchase.push(video);
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
    res.status(200).send({ message: "you have purchased video" });
  } catch {}
};
