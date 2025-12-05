import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
  const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: [],
    recentAppointments: []
  })

  const getDashboardStats = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/dashboard-stats`,
        { headers: { dtoken: dToken } }
      )
      if (data.success) {
        setDashboardStats(data.stats)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    if (dToken) {
      getDashboardStats()
    }
  }, [dToken])

  const value = {
    dToken,
    setDToken,
    backendUrl,
    loading,
    dashboardStats,
    getDashboardStats
  }

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  )
}

export default DoctorContextProvider
