import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AppointmentHistory = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const getAppointmentHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const historicalAppointments = data.appointments
          .filter(apt => apt.status !== 'pending' || apt.isConfirmed)
          .sort((a, b) => {
            const [d1, m1, y1] = a.slotDate.split('_');
            const [d2, m2, y2] = b.slotDate.split('_');
            return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
          });
        setAppointments(historicalAppointments);
      } else {
        toast.error(data.message || "Failed to fetch appointment history");
        setAppointments([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Remove this appointment from history?")) return;
    setDeleting(id);
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/user/delete-appointment/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setAppointments(prev => prev.filter(apt => apt._id !== id));
        toast.success(data.message);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const [d, m, y] = dateString.split('_');
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
  };

  const getStatusStyle = (status) => {
    const base = "px-3 py-1 text-sm font-semibold rounded-full border capitalize";
    switch (status?.toLowerCase()) {
      case 'completed': return `${base} bg-green-100 text-green-800 border-green-200`;
      case 'confirmed': return `${base} bg-teal-100 text-teal-800 border-teal-200`;
      case 'cancelled': return `${base} bg-red-100 text-red-800 border-red-200`;
      case 'missed': return `${base} bg-orange-100 text-orange-800 border-orange-200`;
      default: return `${base} bg-gray-100 text-gray-800 border-gray-200`;
    }
  };

  useEffect(() => {
    if (token) getAppointmentHistory();
    else {
      setAppointments([]);
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-center text-gray-800 underline underline-offset-8 decoration-indigo-500">
        Appointment History
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.length > 0 ? (
            appointments.map((item) => (
              <div
                key={item._id}
                className="relative bg-white border border-teal-100 rounded-xl shadow-md p-5 flex flex-col gap-4 hover:shadow-xl transition-all duration-300"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteAppointment(item._id)}
                  disabled={deleting === item._id}
                  title="Remove from history"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition cursor-pointer"
                >
                  {deleting === item._id ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Image */}
                <div className="w-20 h-20 mx-auto">
                  <img
                    src={item.docData.image}
                    alt={item.docData.name}
                    className={`w-full h-full object-cover rounded-full border-4 ${
                      item.status === 'cancelled' ? 'border-gray-300 grayscale' : 'border-green-200'
                    }`}
                  />
                </div>

                {/* Details */}
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-semibold text-gray-800">{item.docData.name}</h3>
                  <p className="text-indigo-600 text-sm">{item.docData.speciality}</p>
                  <p className="text-gray-700 text-sm">{item.docData.address.line1}</p>
                  <p className="text-gray-500 text-sm">{item.docData.address.line2}</p>
                  <div className="text-sm text-gray-600 mt-2">
                    📅 {formatDate(item.slotDate)} <span className="text-gray-400">|</span> ⏰ {item.slotTime}
                  </div>
                  <div className="mt-2">{item.status && <span className={getStatusStyle(item.status)}>{item.status}</span>}</div>
                  <div className="mt-2 text-sm">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full ${
                      item.payment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      💳 {item.payment ? 
                          (item.paymentMethod === 'cash' ? "will Pay with Cash" : 
                           item.paymentMethod ? `Paid via ${item.paymentMethod}` : "Payment Completed") 
                          : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-gray-500 text-lg">No appointment history found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;
