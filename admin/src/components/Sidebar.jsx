import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'

const Sidebar = ({ isOpen, onClose }) => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  return (
    <div className="h-full w-64 bg-white shadow-lg">
      <div className="h-full p-4">
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <span className="text-2xl">×</span>
        </button>

        {/* Admin Links */}
        {aToken && (
          <ul className="flex flex-col gap-4">
            <NavLink
              to="/admin-dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-100 text-teal-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <img src={assets.home_icon} alt="Dashboard" className="w-6 h-6" />
              <p>Dashboard</p>
            </NavLink>

            <NavLink
              to="/all-appointments"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-100 text-teal-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <img src={assets.appointment_icon} alt="Appointments" className="w-6 h-6" />
              <p>Appointments</p>
            </NavLink>

            <NavLink
              to="/add-doctor"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-100 text-teal-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <img src={assets.add_icon} alt="Add Doctor" className="w-6 h-6" />
              <p>Add Doctor</p>
            </NavLink>

            <NavLink
              to="/doctor-list"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-100 text-teal-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <img src={assets.people_icon} alt="Doctors List" className="w-6 h-6" />
              <p>Doctors List</p>
            </NavLink>
          </ul>
        )}

        {/* Doctor Links */}
        {dToken && (
          <ul className="flex flex-col gap-4">
            <NavLink
              to="/doctor-dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-100 text-teal-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <img src={assets.home_icon} alt="Dashboard" className="w-6 h-6" />
              <p>Dashboard</p>
            </NavLink>

            <NavLink
              to="/doctor-appointments"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-100 text-teal-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <img src={assets.appointment_icon} alt="Appointments" className="w-6 h-6" />
              <p>Appointments</p>
            </NavLink>

            <NavLink
              to="/doctor-profile"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-100 text-teal-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <img src={assets.people_icon} alt="Profile" className="w-6 h-6" />
              <p>Profile</p>
            </NavLink>
          </ul>
        )}
      </div>
    </div>
  )
}

export default Sidebar
