import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MyAppointment = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const pendingAppointments = data.appointments.filter(
          apt => apt.status === 'pending' && !apt.isConfirmed
        );
        setAppointments(pendingAppointments);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
        setAppointments([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleCashPayment = async (appointmentId) => {
    const confirmPay = window.confirm("Confirm payment with cash?");
    if (!confirmPay) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-cash`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message || "Payment recorded successfully");
        setAppointments(prev =>
          prev.map(apt =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  payment: true,
                  paymentMethod: 'cash',
                  paymentInfo: {
                    method: 'cash',
                    recordedAt: new Date(),
                    recordedBy: 'user',
                  },
                }
              : apt
          )
        );
      } else {
        toast.error(data.message || "Failed to record payment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  };

 const handleOnlinePayment = async (appointment) => {
  const confirmPay = window.confirm("Proceed to pay online for this appointment?");
  if (!confirmPay) return;

  try {
    const { data } = await axios.post(`${backendUrl}/api/payment/init`, {
      name: appointment.userData?.name || "Patient",
      email: appointment.userData?.email || "test@example.com",
      phone: appointment.userData?.phone || "01811497418",
      amount: appointment.amount,
      appointmentId: appointment._id,
    });

    if (data?.url) {
      window.location.href = data.url; // redirect user to SSLCommerz payment page
    } else {
      toast.error("Failed to initiate online payment");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Payment initiation failed");
  }
};


  const formatAppointmentDate = (dateString) => {
    const [day, month, year] = dateString.split('_');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'missed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
      const interval = setInterval(getUserAppointments, 30000);
      return () => clearInterval(interval);
    } else {
      setAppointments([]);
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center text-gray-800 underline underline-offset-8 decoration-indigo-500">
        My Appointments
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500 border-solid"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {appointments.length > 0 ? (
              appointments.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white border border-teal-200 rounded-2xl shadow-md hover:shadow-xl p-6 flex flex-col"
                >
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeClass(item.status)} capitalize`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mx-auto w-24 h-24 mb-4">
                    <img
                      src={item.docData.image}
                      alt={item.docData.name}
                      className={`w-full h-full object-cover rounded-full border-4 ${
                        item.status === 'cancelled'
                          ? 'border-gray-300 grayscale'
                          : item.status === 'completed'
                          ? 'border-green-200'
                          : 'border-teal-200'
                      }`}
                    />
                  </div>

                  <div className="text-center space-y-1 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{item.docData.name}</h3>
                    <p className="text-indigo-600 font-medium">{item.docData.speciality}</p>
                    <p className="text-gray-700 text-sm">{item.docData.address.line1}</p>
                    <p className="text-gray-700 text-sm">{item.docData.address.line2}</p>
                    <div className="text-sm text-gray-600 font-medium mt-2 flex justify-center flex-wrap gap-2">
                      <span>📅 {formatAppointmentDate(item.slotDate)}</span>
                      <span>⏰ {item.slotTime}</span>
                    </div>
                  </div>

                  {item.status === 'cancelled' && (
                    <p className="text-red-600 text-sm font-medium text-center">This appointment has been cancelled</p>
                  )}
                  {item.status === 'completed' && (
                    <p className="text-green-600 text-sm font-medium text-center">Appointment completed</p>
                  )}
                  {item.status === 'confirmed' && (
                    <p className="text-teal-600 text-sm font-medium text-center">Appointment confirmed</p>
                  )}
                  {item.status === 'missed' && (
                    <p className="text-orange-600 text-sm font-medium text-center">Appointment was missed</p>
                  )}

                  {item.payment && (
                    <div className="mt-3 flex justify-center items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200 flex items-center">
                        ✔️ PAID
                      </span>
                      <span className="ml-2 text-gray-600 text-sm">
                        {item.paymentMethod === 'cash'
                          ? 'Cash payment'
                          : item.paymentMethod
                          ? `Paid via ${item.paymentMethod}`
                          : 'Online payment'}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {!item.payment && item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleCashPayment(item._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm shadow-md transition cursor-pointer"
                        >
                          Pay Cash
                        </button>
                        <button
                          onClick={() => handleOnlinePayment(item)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-sm shadow-md transition cursor-pointer"
                        >
                          Pay Online
                        </button>
                      </>
                    )}
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleCancelAppointment(item._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm shadow-md transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-gray-500 text-lg">No appointments found</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyAppointment;
