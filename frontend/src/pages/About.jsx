import React from 'react'
import { motion } from 'framer-motion'

const About = () => {
  return (
    <section className="relative overflow-hidden bg-gray-50 text-gray-800 py-16 px-6 lg:px-20">

      {/* 🔵 Floating Blob */}
      <div className="absolute top-[-150px] left-[-200px] -z-10 blur-3xl opacity-20">
        <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path
              d="M120,-150C160,-100,200,-50,190,0C180,50,120,100,60,120C0,140,-60,130,-100,100C-140,70,-160,20,-160,-40C-160,-100,-120,-170,-70,-200C-20,-230,60,-200,120,-150Z"
              fill="#93c5fd"
            />
          </g>
        </svg>
      </div>

      {/* 🔥 Header */}
      <motion.div 
        className="text-center mb-14"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-4xl font-bold">
          About <span className="text-blue-600">Us</span>
        </h2>
        <p className="mt-2 text-gray-600">
          Learn more about our mission and what makes us different.
        </p>
      </motion.div>

      {/* 📄 About Content */}
      <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
        
        {/* 📷 Image */}
        <motion.div
          className="w-full lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="https://i.postimg.cc/h4kVkkT2/male-working-as-paediatrician.jpg"
            alt="About Prescripto"
            className="w-full rounded-xl shadow-xl"
          />
        </motion.div>

        {/* 📝 Text */}
        <motion.div
          className="w-full lg:w-1/2 space-y-6 text-lg"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
