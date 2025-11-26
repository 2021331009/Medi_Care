import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaUserMd, FaUsers, FaCalendarCheck, FaCalendarTimes, FaUserCircle } from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 flex items-center ${color}`}>
    <div className={`rounded-full p-4 ${color} bg-opacity-10 mr-4`}>
      <Icon className={`text-2xl ${color}`} />
    </div>
    <div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value || 0}</p>
    </div>
  </div>
);

const UserAvatar = ({ user, defaultIcon = FaUserCircle }) => {
  if (!user) return null;

  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="h-full w-full object-cover"
          />
        ) : (
          <defaultIcon className="h-5 w-5 text-gray-500" />
        )}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">
          {user.name || 'Unknown User'}
        </div>
      </div>
    </div>
  );
};

const DoctorAvatar = ({ doctor }) => {
  if (!doctor) return null;

  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
        {doctor.image ? (
          <img
            src={doctor.image}
            alt={doctor.name || 'Doctor'}
            className="h-full w-full object-cover"
          />
        ) : (
          <FaUserMd className="h-5 w-5 text-teal-500" />
        )}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">
          Dr. {doctor.name || 'Unknown Doctor'}
        </div>
        <div className="text-sm text-gray-500">{doctor.speciality}</div>
      </div>
    </div>
  );
};

const DeshBoard = () => {
  const { dashboardStats, getDashboardStats, loading } = useContext(AdminContext);

  useEffect(() => {
    // Initial fetch
    getDashboardStats();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      getDashboardStats();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString?.toLowerCase() || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Doctors"
          value={dashboardStats.totalDoctors}
          icon={FaUserMd}
          color="text-teal-600"
        />
        <StatCard
          title="Total Patients"
          value={dashboardStats.totalPatients}
          icon={FaUsers}
          color="text-green-600"
        />
        <StatCard
          title="Total Appointments"
          value={dashboardStats.totalAppointments}
          icon={FaCalendarCheck}
          color="text-purple-600"
        />
        <StatCard
          title="Cancelled Appointments"
          value={dashboardStats.cancelledAppointments}
          icon={FaCalendarTimes}
          color="text-red-600"
        />
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Appointments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(dashboardStats.recentAppointments || []).map((appointment, index) => (
                <tr key={appointment._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserAvatar user={appointment.userData} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DoctorAvatar doctor={appointment.docData} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(appointment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(appointment.slotTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${appointment.cancelled 
                        ? 'bg-red-100 text-red-800' 
                        : appointment.isCompleted
                        ? 'bg-green-100 text-green-800'
                        : appointment.payment
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {appointment.cancelled 
                        ? 'Cancelled'
                        : appointment.isCompleted
                        ? 'Completed'
                        : appointment.payment
                        ? 'Confirmed'
                        : 'Pending'
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeshBoard;