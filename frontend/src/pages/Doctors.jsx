import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const applyFilter = () => {
    let filtered = doctors;
    
    if (speciality) {
      filtered = filtered.filter((doc) => doc.speciality === speciality);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((doc) => 
        doc.name.toLowerCase().includes(query) || 
        doc.speciality.toLowerCase().includes(query)
      );
    }
    
    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchQuery]);

  const handleSpecialityClick = (item) => {
    navigate(`/doctors/${item}`);
    if (window.innerWidth < 768) {
      setIsFilterOpen(false);
    }
  };

  const handleDoctorClick = (doctor) => {
    if (!doctor.available) return;
    navigate(`/appointment/${doctor._id}`);
  };

  const specialities = [
    'General Physician', 'Pediatrician', 'Gynecologist', 'Dermatologist',
    'ENT Specialist', 'Ophthalmologist', 'Dentist', 'Cardiologist',
    'Neurologist', 'Gastroenterologist', 'Nephrologist', 'Endocrinologist',
    'Pulmonologist', 'General Surgeon', 'Orthopedic Surgeon', 'Urologist',
    'Psychiatrist', 'Oncologist', 'Rheumatologist', 'Infectious Disease Specialist',
  ];

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50">
      {/* Filter Toggle Button */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-teal-900">Doctors</h2>
        <button
          className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md shadow cursor-pointer"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          {isFilterOpen ? 'Hide Filter' : 'Show Filter'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        {isFilterOpen && (
          <div className="md:w-1/4 w-full bg-white shadow rounded-lg p-4 md:sticky top-4 z-10">
            <h2 className="text-lg font-semibold mb-4 text-teal-800">Filter by Speciality</h2>
            <ul className="space-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent">
              {specialities.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleSpecialityClick(item)}
                  className={`cursor-pointer px-3 py-2 rounded-md text-sm transition-colors ${
                    item === speciality
                      ? 'bg-teal-100 text-teal-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content */}
        <div className={`${isFilterOpen ? 'md:w-3/4' : 'w-full'} w-full`}>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                className="w-full px-4 py-3 pl-10 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Results Info */}
          <p className="mb-3 text-gray-600 text-sm">
            Found <strong>{filterDoc.length}</strong> doctor{filterDoc.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {speciality && ` in ${speciality}`}
          </p>

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filterDoc.map((item) => (
                <motion.div
                  key={item._id}
                  onClick={() => handleDoctorClick(item)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className={`bg-white rounded-xl shadow p-5 flex flex-col items-center ${
                    item.available ? 'cursor-pointer hover:shadow-lg hover:scale-[1.03]' : 'opacity-60'
                  } transition-transform duration-300 ease-in-out`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 object-cover rounded-full mb-4 border-4 border-teal-100"
                  />
                  <div className="text-center">
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 ${
                        item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.available ? 'Available' : 'Not Available'}
                    </span>
                    <p className="text-lg font-semibold text-teal-900">{item.name}</p>
                    <p className="text-sm text-teal-600">{item.speciality}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filterDoc.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                No doctors found {searchQuery && `matching "${searchQuery}"`}
                {speciality && ` in ${speciality}`}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
