import React from 'react'
import { Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'

const Contact = () => {
  return (
    <section className="bg-gray-50 text-gray-800 py-16 px-6 lg:px-20">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-4xl font-bold">
          CONTACT <span className="text-blue-600">US</span>
        </h2>
        <p className="mt-2 text-gray-600">
          We’d love to hear from you — here’s how you can reach us.
        </p>
      </motion.div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row items-center gap-12">
        
        {/* Contact Image */}
        <motion.div
          className="w-full lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="https://i.postimg.cc/SKs6yzqm/portrait-female-pediatrician-work.jpg"
            alt="Contact"
            className="w-full rounded-xl shadow-xl transition-transform"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          className="w-full lg:w-1/2 space-y-6 text-lg"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="transition-all"
          >
            <h3 className="text-xl font-semibold text-blue-600 mb-1">
              Our Office
            </h3>
            <p className="text-gray-700">
              House #12, Road #4,<br />
              Dhanmondi, Dhaka 1205, Bangladesh
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="transition-all">
            <p className="text-gray-700">
              <span className="font-medium">Tel:</span> +880 1823-024067
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> support@medicare.com
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="transition-all"
          >
            <h3 className="text-xl font-semibold text-blue-600 mb-1">
              Careers at <span className="text-black">Medicare</span>
            </h3>
            <p className="text-gray-700 mb-4">
              Learn more about our teams and job openings.
            </p>
            <motion.button
              whileHover={{ scale: 1.07, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition-all"
            >
              <Briefcase className="w-5 h-5 transition-transform group-hover:rotate-12" />
              Explore Jobs
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
