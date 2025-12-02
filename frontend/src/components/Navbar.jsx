import React, { useState, useRef, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, userData, setToken } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    setToken(false);
    setDropdownOpen(false);
    navigate("/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 px-4 sm:px-6 transition-all duration-300 ${scrolled ? "bg-white/80 shadow-md py-2 backdrop-blur-md" : "bg-white py-4"
        }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <motion.div
          onClick={() => {
            navigate("/");
            scrollToTop();
          }}
          className="cursor-pointer select-none"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
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

        {/* Desktop Menu */}
        <ul className="hidden lg:flex space-x-6 items-center">
          {["/", "/doctors", "/about", "/contact"].map((path, idx) => (
            <NavLink
              key={idx}
              to={path}
              onClick={scrollToTop}
              className={({ isActive }) =>
                `relative text-md font-medium transition duration-300 hover:text-teal-600 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:bg-teal-600 before:w-0 hover:before:w-full before:transition-all ${isActive ? "text-teal-600 before:w-full" : "text-gray-700"
                }`
              }
            >
              {path === "/" ? "Home" : path === "/doctors" ? "All Doctors" : path === "/about" ? "About" : "Contact"}
            </NavLink>
          ))}
        </ul>

        {/* Desktop Profile/Login */}
        <div className="hidden lg:block relative" ref={dropdownRef}>
          {!token ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                navigate("/login");
                scrollToTop();
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition duration-300 cursor-pointer"
            >
              Create Account
            </motion.button>
          ) : (
            <div>
              <img
                src={userData?.image || "https://i.pravatar.cc/32"}
                alt="Profile"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full cursor-pointer border border-gray-300"
              />
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20"
                >
                  <button onClick={() => { navigate("/my-profile"); setDropdownOpen(false); scrollToTop(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">My Profile</button>
                  <button onClick={() => { navigate("/my-appointment"); setDropdownOpen(false); scrollToTop(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">My Appointment</button>
                  <button onClick={() => { navigate("/appointment-history"); setDropdownOpen(false); scrollToTop(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">Appointment History</button>
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer">Logout</button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden focus:outline-none cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showMenu ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>





    </motion.nav>
  );
};

export default Navbar;
