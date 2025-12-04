import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (aToken) {
      localStorage.removeItem('aToken');
      setAToken(null);
    } else if (dToken) {
      localStorage.removeItem('dToken');
      setDToken(null);
    }
    navigate('/');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-white border-b border-gray-300 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Menu Button and Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 cursor-pointer"
          >
            <img src={assets.list_icon} alt="Menu" className="w-6 h-6" />
          </button>

          {/* Logo with animation */}
          <motion.div
            onClick={() => {
              navigate('/');
              scrollToTop();
            }}
            className="cursor-pointer select-none"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500 bg-clip-text text-transparent"
            >
              Medi<span className="tracking-wide">Care</span>
            </motion.span>
          </motion.div>

          {/* Role badge */}
          <span className="hidden sm:inline px-3 py-1 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full">
            {aToken ? 'Admin' : 'Doctor'}
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md font-medium hover:bg-red-700 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
