import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaUserAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaCreditCard,
  FaSearch,
  FaSpinner,
  FaTrash,
  FaCheck,
  FaTimes,
  FaFilter,
  FaChevronDown,
} from 'react-icons/fa';

const DoctorAppointment = () => {
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAppointments, setProcessingAppointments] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all'
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        { headers: { dtoken: dToken } }
      );
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus, patientName) => {
    if (newStatus === 'cancelled') {
      // Show confirmation toast
      toast.warn(
        <div>
          <p className="font-medium mb-2">Cancel Appointment?</p>
          <p className="text-sm mb-4">Are you sure you want to cancel the appointment with {patientName}?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                toast.dismiss(); // Close the confirmation toast
                processStatusChange(appointmentId, newStatus);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              Yes, Cancel
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              No, Keep
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          className: "confirmation-toast"
        }
      );
    } else {
      // For confirmation, proceed directly
      await processStatusChange(appointmentId, newStatus);
    }
  };

  const processStatusChange = async (appointmentId, newStatus) => {
    try {
      setProcessingAppointments(prev => new Set([...prev, appointmentId]));

      if (newStatus === 'confirmed') {
        const { data } = await axios.put(
          `${backendUrl}/api/doctor/confirm-appointment`,
          { appointmentId },
          { headers: { dtoken: dToken } }
        );
        
        if (data.success) {
          toast.success('Appointment confirmed successfully');
          // Update the appointment status locally
          setAppointments(prev => prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, isConfirmed: true, status: 'confirmed' }
              : apt
          ));
        } else {
          toast.error(data.message || 'Failed to confirm appointment');
        }
      } else if (newStatus === 'completed') {
        const { data } = await axios.put(
          `${backendUrl}/api/doctor/complete-appointment`,
          { appointmentId, patientVisited: true },
          { headers: { dtoken: dToken } }
        );

        if (data.success) {
          toast.success('Appointment marked as completed');
          // Update the appointment status locally
          setAppointments(prev => prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, isCompleted: true, patientVisited: true, status: 'completed', isConfirmed: true }
              : apt
          ));
        } else {
          toast.error(data.message || 'Failed to complete appointment');
        }
      } else if (newStatus === 'cancelled') {
        const { data } = await axios.put(
          `${backendUrl}/api/doctor/cancel-appointment`,
          { appointmentId },
          { headers: { dtoken: dToken } }
        );

        if (data.success) {
          toast.success('Appointment cancelled successfully');
          // First update local state
          setAppointments(prev => prev.map(apt => 
            apt._id === appointmentId 
              ? { 
                  ...apt, 
                  cancelled: true, 
                  status: 'cancelled',
                  isConfirmed: false,
                  isCompleted: false,
                  patientVisited: false
                }
              : apt
          ));
          // Then fetch fresh data after a short delay to ensure backend has processed the change
          setTimeout(async () => {
            try {
              await fetchAppointments();
            } catch (error) {
              console.error('Error refreshing appointments:', error);
              // If refresh fails, at least we have the local state update
            }
          }, 500);
        } else {
          toast.error(data.message || 'Failed to cancel appointment');
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to update appointment status. Please try again.'
      );
    } finally {
      setProcessingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleDelete = async (appointmentId, patientName) => {
    // Show confirmation toast
    toast.warn(
      <div>
        <p className="font-medium mb-2">Delete Appointment Record?</p>
        <p className="text-sm mb-4">Are you sure you want to delete the appointment record with {patientName}? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss();
              processDelete(appointmentId);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
          >
            No, Keep
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: "confirmation-toast"
      }
    );
  };

  const processDelete = async (appointmentId) => {
    try {
      setProcessingAppointments(prev => new Set([...prev, appointmentId]));

      const { data } = await axios.delete(
        `${backendUrl}/api/doctor/delete-appointment/${appointmentId}`,
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        toast.success('Appointment record deleted successfully');
        setAppointments(prev => prev.filter(app => app._id !== appointmentId));
      } else {
        toast.error(data.message || 'Failed to delete appointment record');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to delete appointment record. Please try again.'
      );
    } finally {
      setProcessingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (dToken) {
      fetchAppointments();
      const refreshInterval = setInterval(fetchAppointments, 30000);
      return () => clearInterval(refreshInterval);
    }
  }, [dToken]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const [day, month, year] = dateString.split('_').map(num => parseInt(num));
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${day.toString().padStart(2, '0')} ${months[month - 1]}, ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      appointment.patientName?.toLowerCase().includes(searchLower) ||
      appointment.userData?.email?.toLowerCase().includes(searchLower) ||
      appointment.userData?.phone?.includes(searchTerm) ||
      formatDate(appointment.date).toLowerCase().includes(searchLower) ||
      formatTime(appointment.time).toLowerCase().includes(searchLower)
    );

    const matchesStatus = filters.status === 'all' || appointment.status?.toLowerCase() === filters.status;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 border-b-4 border-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">My Appointments</h2>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow sm:max-w-md">
            <input
              type="text"
              placeholder="Search by patient name, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="missed">Missed</option>
            </select>
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FaCalendarAlt className="text-6xl text-gray-300" />
            <p className="text-xl text-gray-500">No appointments found</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    {/* Patient Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {appointment.userData?.image ? (
                          <img
                            src={appointment.userData.image}
                            alt={appointment.patientName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center border-2 border-teal-400">
                            <FaUserAlt className="text-teal-600 text-xl" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{appointment.patientName}</div>
                          <div className="text-sm text-gray-500">Age: {appointment.age} years</div>
                          {appointment.userData?.email && (
                            <div className="text-sm text-gray-500 truncate max-w-[200px]" title={appointment.userData.email}>
                              {appointment.userData.email}
                            </div>
                          )}
                          {appointment.userData?.phone && (
                            <div className="text-sm text-gray-500">{appointment.userData.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Appointment Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-blue-500" />
                          {formatTime(appointment.time)}
                        </div>
                      </div>
                    </td>

                    {/* Payment Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <FaMoneyBillWave className="mr-2 text-blue-500" />
                          Tk {appointment.fees}
                        </div>
                        <div className="flex items-center">
                          <FaCreditCard className="mr-2 text-blue-500" />
                          {appointment.payment ? (
                            appointment.paymentMethod === 'cash' ? (
                              <span className="text-green-600 font-medium">Cash Payment</span>
                            ) : (
                              <span className="text-green-600 font-medium">
                                {appointment.paymentMethod ? `Paid via ${appointment.paymentMethod}` : 'Payment with CASH'}
                              </span>
                            )
                          ) : (
                            <span className="text-yellow-600">Unpaid</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeClass(appointment.status)} capitalize`}>
                        {appointment.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {/* Confirm Button */}
                        {!appointment.isConfirmed && !appointment.isCompleted && !appointment.cancelled && (
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'confirmed', appointment.patientName)}
                            disabled={processingAppointments.has(appointment._id)}
                            className={`flex items-center px-3 py-1 rounded-lg text-white text-sm transition-colors duration-200 ${
                              processingAppointments.has(appointment._id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {processingAppointments.has(appointment._id) ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaCheck className="mr-1" />
                            )}
                            Confirm
                          </button>
                        )}
                        {/* Complete Button */}
                        {appointment.isConfirmed && !appointment.isCompleted && !appointment.cancelled && (
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'completed', appointment.patientName)}
                            disabled={processingAppointments.has(appointment._id)}
                            className={`flex items-center px-3 py-1 rounded-lg text-white text-sm transition-colors duration-200 ${
                              processingAppointments.has(appointment._id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {processingAppointments.has(appointment._id) ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaCheck className="mr-1" />
                            )}
                            Complete
                          </button>
                        )}
                        {/* Cancel Button */}
                        {!appointment.isCompleted && !appointment.cancelled && (
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'cancelled', appointment.patientName)}
                            disabled={processingAppointments.has(appointment._id)}
                            className={`flex items-center px-3 py-1 rounded-lg text-white text-sm transition-colors duration-200 ${
                              processingAppointments.has(appointment._id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            {processingAppointments.has(appointment._id) ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaTimes className="mr-1" />
                            )}
                            Cancel
                          </button>
                        )}
                        {/* Delete Button */}
                        {(appointment.cancelled || appointment.isCompleted) && (
                          <button
                            onClick={() => handleDelete(appointment._id, appointment.patientName)}
                            disabled={processingAppointments.has(appointment._id)}
                            className={`flex items-center px-3 py-1 rounded-lg text-white text-sm transition-colors duration-200 ${
                              processingAppointments.has(appointment._id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gray-500 hover:bg-gray-600'
                            }`}
                          >
                            {processingAppointments.has(appointment._id) ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaTrash className="mr-1" />
                            )}
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;
