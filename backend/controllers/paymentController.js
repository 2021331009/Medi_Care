import SSLCommerzPayment from 'sslcommerz-lts';
import Appointment from '../models/appointmentModel.js';

const store_id = process.env.SSLCZ_STORE_ID;
const store_pass = process.env.SSLCZ_STORE_PASS;
const is_live = process.env.SSLCZ_IS_LIVE === 'true';

export const initPayment = async (req, res) => {
  try {
    const { name, email, phone, amount, appointmentId } = req.body;
    const tran_id = `TRAN_${Date.now()}`;

    // Save tran_id to appointment
    await Appointment.findByIdAndUpdate(appointmentId, { transactionId: tran_id });

    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id,
      success_url: `${process.env.BACKEND_URL}/api/payment/success/${tran_id}`,
      fail_url: `${process.env.BACKEND_URL}/api/payment/fail/${tran_id}`,
      cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel/${tran_id}`,
      ipn_url: `${process.env.BACKEND_URL}/api/payment/ipn`,
      shipping_method: 'NO',
      product_name: 'Doctor Appointment',
      product_category: 'Healthcare',
      product_profile: 'general',
      cus_name: name,
      cus_email: email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: phone,
      ship_name: name,
      ship_add1: 'Dhaka',
      ship_city: 'Dhaka',
      ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_pass, is_live);
    const apiResponse = await sslcz.init(data);

    return res.status(200).json({ url: apiResponse.GatewayPageURL });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Payment initiation failed' });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const appointment = await Appointment.findOne({ transactionId: tran_id });
    if (!appointment) return res.status(404).send('Appointment not found');

    appointment.payment = true;
    appointment.paymentMethod = 'online';
    appointment.isConfirmed = true;
    appointment.status = 'pending'; // So it shows in "My Appointments"
    appointment.isConfirmed = false; // Optional, if you’re using this flag

    appointment.paymentInfo = {
      status: 'completed',
      paidAt: new Date(),
    };
    await appointment.save();

    return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Payment success processing failed');
  }
};

export const paymentFail = (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
};

export const paymentCancel = (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/payment-cancelled`);
};
