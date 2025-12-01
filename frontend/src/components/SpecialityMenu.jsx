import React from 'react';
import { specialityData } from '../assets/assets';
import { Link } from 'react-router-dom';

const SpecialityMenu = () => {
  return (
    <section
      id="speciality"
      className="px-6 py-16 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">
          Find by Speciality
        </h1>
        <p className="text-blue-700 text-md md:text-lg max-w-2xl mx-auto">
          Browse our trusted list of specialists and book your appointment with ease.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-10">
        {specialityData.map((item, index) => (
          <Link
            key={index}
            to={`/doctors/${item.speciality}`}
            onClick={() => window.scrollTo(0, 0)}
            className="group flex flex-col items-center bg-white rounded-2xl shadow-md p-6 w-[200px] md:w-[220px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`View doctors for ${item.speciality}`}
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 overflow-hidden">
              <img
                src={item.image}
                alt={item.speciality}
                className="object-contain w-16 h-16 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="text-blue-700 font-medium text-center text-lg tracking-wide capitalize">
              {item.speciality}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SpecialityMenu;
