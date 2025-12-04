// src/pages/PaymentFail.jsx
import React from "react";
import { Link } from "react-router-dom";

const PaymentFail = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-red-50">
     <h1 className="text-4xl font-bold text-red-700 mb-6">❌ Payment Failed</h1>
      <p className="text-lg text-red-800 mb-6">
        Unfortunately, your payment was not successful. Please try again.
      </p>
      <Link
        to="/my-appointment"
        className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Go Back to Appointments
      </Link>
    </div>
  );
};

export default PaymentFail;
