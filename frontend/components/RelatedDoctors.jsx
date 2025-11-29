//
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()

  const [relDoc, setRelDocs] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      )
      setRelDocs(doctorsData)
    }
  }, [doctors, speciality, docId])

  return (
    <div className="px-6 py-10 bg-gray-50 min-h-screen shadow-inner">
      <h1 className="text-4xl font-bold text-teal-800 mb-2 text-center">
        Top Doctors to Book
      </h1>
      <p className="text-center text-teal-700 max-w-3xl mx-auto mb-8 text-lg">
        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {relDoc.slice(0, 5).map((item, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/appointment/${item._id}`)
              window.scrollTo(0, 0)
            }}
            className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center cursor-pointer 
                       hover:shadow-xl hover:scale-[1.03] transition-transform duration-300 ease-in-out"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-28 w-28 object-cover rounded-full mb-4 border-4 border-teal-100"
            />
            <div className="w-full text-center">
              <div className="mb-2">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Available
                </span>
              </div>
              <p className="text-xl font-semibold text-teal-900">{item.name}</p>
              <p className="text-teal-600 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={() => {
            navigate('/doctors')
            window.scrollTo(0, 0)
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold 
                     transition duration-300 shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
        >
          More
        </button>
      </div>
    </div>
  )
}

export default RelatedDoctors
