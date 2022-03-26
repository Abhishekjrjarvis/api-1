const express = require('express');
const { processPayment, paytmResponse, processEContentPayment, paytmEContentResponse, getPaymentStatus, 
     processIdCardPayment, paytmIdCardResponse 
} = require('../controllers/paymentController');

const { processVideoPayment, paytmVideoResponse } = require('../controllers/videoPaymentController')

// const { isLogged } = require('../middlewares/auth');
const router = express.Router();
// ================= Student Fee And Checklist Payment ====================

router.route('/payment/process').post(processPayment);
// router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);
router.route('/callback/pay/:fiid/:uid/student/:sid/fee/:fid').post(paytmResponse);
router.route('/payment/status/:id').get(getPaymentStatus);


// ================== EContent Payment Playlist =======================

router.route('/payment/e-content/process').post(processEContentPayment);
router.route('/e-content/callback/user/:uid/playlist/:pid/ins/:fid').post(paytmEContentResponse);


// ================== Video Payment ==========================

router.route('/payment/e-content/video/process').post(processVideoPayment)
router.route('/e-content/video/callback/user/:uid/playlist/:pid/video/:vid/ins/:fid').post(paytmVideoResponse)


// ================== Application Payment ========================

// router.route('/payment/application/process').post(processApplicationPayment);
// router.route('/application/callback/:aid/student/:sid/pay/:fid/user/:uid').post(paytmApplicationResponse);


// ================== Id Card Payment ========================

router.route('/payment/id-card/process').post(processIdCardPayment);
router.route('/callback/ins/:id/batch/:batchId').post(paytmIdCardResponse);


module.exports = router;
