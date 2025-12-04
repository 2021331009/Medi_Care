import React, { useContext, useState, useEffect } from 'react';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import DeshBoard from './pages/Admin/Deshboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import { DoctorContext } from './context/DoctorContext';

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle automatic redirection to dashboard
  useEffect(() => {
    if (location.pathname === '/') {
      if (aToken) {
        navigate('/admin-dashboard');
      } else if (dToken) {
        navigate('/doctor-dashboard');
      }
    }
  }, [aToken, dToken, location.pathname, navigate]);

  return aToken || dToken ? (
    <div className="min-h-screen bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar - Fixed on mobile, static on desktop */}
        <div className={`lg:static fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:min-h-[calc(100vh-64px)]`}>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="p-4 lg:p-6">
            <Routes>
              <Route path="/" element={aToken ? <DeshBoard /> : <DoctorDashboard />} />
              <Route path="/admin-dashboard" element={<DeshBoard />} />
              <Route path="/all-appointments" element={<AllAppointments />} />
              <Route path="/add-doctor" element={<AddDoctor />} />
              <Route path="/doctor-list" element={<DoctorsList />} />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-appointments" element={<DoctorAppointment />} />
            </Routes>
          </div>
        </main>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
