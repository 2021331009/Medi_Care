import { useState, useEffect } from "react";
import { createContext } from "react";
import axios from 'axios'
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(false)
    const [dashboardStats, setDashboardStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        cancelledAppointments: 0,
        recentAppointments: []
    })

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppointments = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(
                `${backendUrl}/api/admin/appointments`,
                { headers: { aToken } }
            )
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error details:', error.response?.data || error.message)
            toast.error(error.response?.data?.message || 'Failed to fetch appointments')
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/cancel-appointment`,
                { appointmentId },
                { headers: { aToken } }
            )
            if (data.success) {
                // Update the appointment in the local state
                setAppointments(prev => prev.map(app => 
                    app._id === appointmentId 
                        ? { ...app, cancelled: true, showToUser: false }
                        : app
                ));

                // Get the cancelled appointment's doctor ID
                const cancelledApp = appointments.find(app => app._id === appointmentId);
                if (cancelledApp) {
                    // Update the specific doctor's data
                    const { data: doctorData } = await axios.post(
                        backendUrl + '/api/admin/all-doctors',
                        {},
                        { headers: { aToken } }
                    );
                    
                    if (doctorData.success) {
                        setDoctors(doctorData.doctors);
                    }
                }
                
                toast.success('Appointment cancelled successfully');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel appointment');
            return false;
        }
    }

    const deleteAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/admin/delete-appointment`,
                { 
                    headers: { aToken },
                    data: { appointmentId }
                }
            )
            if (data.success) {
                // Remove the appointment from local state
                setAppointments(prev => prev.filter(app => app._id !== appointmentId));
                
                // Refresh doctors list to ensure slot availability is up to date
                await getAllDoctors();
                
                toast.success('Appointment deleted successfully');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete appointment');
            return false;
        }
    }

    const getDashboardStats = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `${backendUrl}/api/admin/dashboard-stats`,
                { headers: { aToken } }
            );
            if (data.success) {
                setDashboardStats(data.stats);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

const deleteDoctor = async (doctorId) => {
  try {
    const response = await fetch(`${backendUrl}/api/admin/doctors/${doctorId}`, { 
      method: 'DELETE',
      headers: {
        aToken,  // your backend expects 'aToken' header based on your other requests
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.success) {
      await getAllDoctors();
      return true;
    } else {
      throw new Error(data.message || 'Failed to delete doctor');
    }
  } catch (error) {
    console.error("Delete doctor error:", error);
    return false;
  }
};


    // Initial data load
    useEffect(() => {
        if (aToken) {
            getAllDoctors();
            getAllAppointments();
            getDashboardStats();
        }
    }, [aToken]);

    const value = {
        aToken,
        setAToken,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        cancelAppointment,
        deleteAppointment,
        loading,
        dashboardStats,
        getDashboardStats,
        deleteDoctor
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
