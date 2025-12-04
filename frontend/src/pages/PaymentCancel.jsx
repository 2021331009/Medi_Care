// src/pages/PaymentCancel.jsx
import React from "react";
import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-yellow-50">
      <h1 className="text-4xl font-bold text-yellow-700 mb-6">⚠️ Payment Cancelled</h1>
      <p className="text-lg text-yellow-800 mb-6">
        You have cancelled the payment process. You can try again anytime.
      </p>
      <Link
        to="/my-appointment"
        className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
      >
        Go Back to Appointments
      </Link>
    </div>
  );
};

export default PaymentCancel;
