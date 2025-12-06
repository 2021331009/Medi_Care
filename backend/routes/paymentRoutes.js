import express from 'express';
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/init', initPayment);

// Accept POST requests for success, fail, cancel
router.post('/success/:tran_id', paymentSuccess);
router.post('/fail/:tran_id', paymentFail);
router.post('/cancel/:tran_id', paymentCancel);

// Optionally accept GET too if you want:
// router.route('/success/:tran_id').get(paymentSuccess).post(paymentSuccess);
// router.route('/fail/:tran_id').get(paymentFail).post(paymentFail);
// router.route('/cancel/:tran_id').get(paymentCancel).post(paymentCancel);

export default router;
