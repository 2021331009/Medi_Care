import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Banner = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
    window.scrollTo(0, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full bg-gradient-to-br from-teal-100 via-white to-indigo-50 overflow-hidden px-6 md:px-16 py-16 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-6 font-sans"
    >
      {/* Decorative SVG Background */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 800 600"
      >
        <circle cx="400" cy="300" r="200" fill="#14B8A6" />
      </svg>

      {/* Content */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="z-10 text-4xl md:text-5xl font-extrabold text-teal-900 leading-tight"
      >
        Book Your Appointment
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="z-10 text-lg md:text-xl text-teal-700 font-medium max-w-xl"
      >
        Connect with 100+ certified and trusted doctors instantly.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="z-10 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full shadow-lg font-semibold transition-all duration-300 cursor-pointer"
      >
        Create Account
      </motion.button>
    </motion.div>
  );
};

export default Banner;
