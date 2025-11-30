import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0 });
  };

  return (
    <footer className="bg-gray-100 text-gray-700 px-6 md:px-20 py-12 font-sans mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/3 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-blue-700 via-purple-600 to-green-500 text-transparent bg-clip-text">
            Medicare
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed">
            <strong>Medicare</strong> is a Bangladesh-based digital healthcare platform that connects patients with licensed doctors.
          </p>
        </motion.div>

        {/* Middle Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:w-1/3 space-y-4"
        >
          <h3 className="text-lg font-semibold text-blue-700">Company</h3>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Home', path: '/' },
              { label: 'my-appoinement', path: 'my-appointment' },
              { label: 'About us', path: '/about' },
              { label: 'Contact us', path: '/contact' },

            ].map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  onClick={scrollToTop}
                  className="hover:text-blue-600 transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

      
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-10 border-t border-gray-300 pt-4 text-center text-gray-500 text-xs select-none"
      >
        © 2025 <span className="font-medium text-blue-600">Medicare</span> — All Rights Reserved.
      </motion.div>
    </footer>
  );
};

export default Footer;
