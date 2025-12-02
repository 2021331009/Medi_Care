import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assets } from '../assets/assets';

const AnimatedText = ({ text, className }) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap justify-center md:justify-start gap-2 ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, type: "spring", stiffness: 150 }}
            whileHover={{
              scale: 1.1,
              color: "#14b8a6",
              textShadow: "0 0 8px rgba(20, 184, 166, 0.7)"
            }}
          className="inline-block font-extrabold"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const sliderImages = [
  "https://i.postimg.cc/h4kVkkT2/male-working-as-paediatrician.jpg",
  "https://i.postimg.cc/mr5XxdbB/man-working-as-paediatrician.jpg",
  "https://i.postimg.cc/hjFDrRXd/expressive-young-woman-posing-studio.jpg"
];

const Header = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [manualSlide, setManualSlide] = useState(false);

  useEffect(() => {
    if (manualSlide) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [manualSlide]);

  const goToPrev = () => {
    setManualSlide(true);
    setCurrentIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToNext = () => {
    setManualSlide(true);
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
  };

  const handleScroll = (e) => {
    e.preventDefault();
    const specialitySection = document.getElementById('speciality');
    if (specialitySection) {
      specialitySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen w-full bg-gradient-to-br from-teal-50 via-white to-indigo-100 px-4 sm:px-8 md:px-16 lg:px-24 flex flex-col-reverse md:flex-row items-center justify-center gap-10 md:gap-16"
    >
      {/* Left Side */}
      <div className="md:w-1/2 w-full text-center md:text-left space-y-6">
        <h1 className="leading-tight">
          <AnimatedText text="Book Appointment of Our" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-800" />
          <motion.span
            className="block mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 140 }}
            whileHover={{
              scale: 1.1,
              textShadow: "0 0 12px rgba(20, 184, 166, 0.7)",
              transition: { duration: 0.4, ease: "easeOut" }
            }}
          >
            Trusted Doctors
          </motion.span>
        </h1>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-4 sm:gap-6">
          <img
            src={assets.group_profiles}
            alt="Group Profiles"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md ring-2 ring-teal-400"
          />
          <p className="text-gray-700 text-base sm:text-lg md:text-xl max-w-md leading-relaxed font-medium">
            Explore our list of verified doctors and schedule your appointments with ease.
          </p>
        </div>

        <motion.button
          onClick={handleScroll}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-4 bg-teal-600 text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-lg font-semibold text-base sm:text-lg tracking-wide hover:bg-teal-700 transition-all duration-300 ease-in-out mx-auto md:mx-0 focus:outline-none focus:ring-4 focus:ring-teal-300 cursor-pointer"
        >
          Book Appointment 
          <img src={assets.arrow_icon} alt="Arrow" className="w-4 sm:w-5 h-4 sm:h-5" />
        </motion.button>
      </div>

      {/* Right Side - Image Slider */}
      <div className="md:w-1/2 w-full flex justify-center">
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-[360px] sm:h-[400px] md:h-[420px] rounded-xl overflow-hidden group shadow-xl border border-teal-300 bg-white">
          {/* Navigation Zones */}
          <div className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer" onClick={goToPrev} />
          <div className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer" onClick={goToNext} />

          {/* <AnimatePresence initial={false}>
            <motion.img
              key={currentIndex}
              src={sliderImages[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className="absolute w-full h-full object-cover rounded-2xl border-4 border-transparent group-hover:border-teal-500"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              draggable={false}
              loading="lazy"
              whileHover={{
                scale: 1.05,
                rotate: 1,
                boxShadow: "0 10px 25px rgba(20, 184, 166, 0.5)",
                borderColor: "#14b8a6",
                transition: { type: "spring", stiffness: 200 },
              }}
            />
          </AnimatePresence> */}
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
