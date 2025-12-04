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
          <p>
            Welcome to <span className="font-semibold text-blue-600">Medicare</span>, your trusted partner in managing your healthcare needs. We understand the challenges individuals face when scheduling appointments or keeping health records organized.
          </p>
          <p>
            Our commitment is to deliver a smooth, tech-powered experience. We constantly improve our platform to bring you the best service, whether you’re booking your first visit or managing ongoing care.
          </p>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-1">Our Vision</h3>
            <p>
              We aim to bridge the gap between patients and healthcare providers, ensuring you have seamless access to care—anytime, anywhere.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ⭐ Why Choose Us */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold">
          Why <span className="text-blue-600">Choose Us</span>
        </h2>
      </motion.div>

      <motion.div
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {[
          { title: 'Efficiency', desc: 'Streamlined appointment scheduling that fits your lifestyle.' },
          { title: 'Convenience', desc: 'Access to trusted healthcare professionals in your area.' },
          { title: 'Personalization', desc: 'Health reminders and suggestions tailored just for you.' }
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
          >
            <h4 className="text-xl font-semibold text-blue-600 mb-2">{item.title}</h4>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

export default About
