// src/pages/PaymentSuccess.jsx
import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-green-50">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🎉 Payment Successful!</h1>
      <p className="text-lg text-green-800 mb-6">
        Thank you for your payment. Your appointment is now confirmed.
      </p>
      <Link
        to="/my-appointment"
        className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
       Go to My Appointments
      </Link>
    </div>
  );
};

export default PaymentSuccess;
