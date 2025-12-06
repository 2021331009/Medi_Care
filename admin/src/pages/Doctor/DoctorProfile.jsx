import React, { useContext, useEffect, useState, useRef } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
const DoctorProfile = () => {
  const { backendUrl, dToken } = useContext(DoctorContext);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [editForm, setEditForm] = useState({
    name: '',
    speciality: '',
    degree: '',
    experience: '',
    fees: '',
    about: '',
    address: {
      line1: '',
      line2: ''
    }
  });
  useEffect(() => {
    if (doctorInfo) {
      setEditForm({
        name: doctorInfo.name || '',
        speciality: doctorInfo.speciality || '',
        degree: doctorInfo.degree || '',
        experience: doctorInfo.experience || '',
        fees: doctorInfo.fees || '',
        about: doctorInfo.about || '',
        address: {
          line1: doctorInfo.address?.line1 || '',
          line2: doctorInfo.address?.line2 || ''
        }
      });
      setImagePreview(doctorInfo.image);
    }
  }, [doctorInfo]);




  const fetchDoctorProfile = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dtoken: dToken }
      });
      if (data.success) {
        setDoctorInfo(data.doctor);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching doctor profile');
    } finally {
      setLoading(false);
    }
  };
  const handleAvailabilityChange = async () => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/change-availability`,
        {},
        {
          headers: { dtoken: dToken }
        }
      );
      if (data.success) {
        setDoctorInfo(prev => ({
          ...prev,
          available: !prev.available
        }));
        toast.success('Availability updated successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating availability');
    }
  };
  useEffect(() => {
    fetchDoctorProfile();
  }, [backendUrl, dToken]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (key === 'address') {
          formData.append(key, JSON.stringify(editForm[key]));
        } else {
          formData.append(key, editForm[key]);
        }
      });

      if (fileInputRef.current.files[0]) {
        formData.append('image', fileInputRef.current.files[0]);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/doctor/update-profile`,
        formData,
        {
          headers: {
            dtoken: dToken,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchDoctorProfile();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  if (!doctorInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">No profile information available</p>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      {!isEditing ? (
        <div className="bg-white rounded-lg shadow-md space-y-8 p-6">
          <div className="flex justify-between items-center">
            <p className="text-2xl font-semibold text-gray-800">Doctor Profile</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-teal-600 text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-teal-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-300 cursor-pointer"
            >
              Edit Profile
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <img
                src={doctorInfo.image}
                alt={doctorInfo.name}
                className="w-32 h-32 rounded-full object-cover shadow-md"
              />
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={doctorInfo.available}
                  onChange={handleAvailabilityChange}
                  className="form-checkbox h-5 w-5 text-teal-600 transition duration-150 ease-in-out cursor-pointer"
                />
                <label htmlFor="available" className="text-gray-700 cursor-pointer">Available for Appointments</label>
              </div>
            </div>
            {/* Doctor Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="mb-1 font-medium text-gray-700">Name</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{doctorInfo.name}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Email</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{doctorInfo.email}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Experience</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{doctorInfo.experience}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Consultation Fee</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">Tk {doctorInfo.fees}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 font-medium text-gray-700">Speciality</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{doctorInfo.speciality}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Education</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{doctorInfo.degree}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Address</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 mb-2">{doctorInfo.address?.line1}</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{doctorInfo.address?.line2}</p>
                </div>
              </div>
            </div>
            {/* About Section */}
            <div>
              <p className="mb-1 font-medium text-gray-700">About</p>
              <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[100px]">{doctorInfo.about}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleEditSubmit} className="bg-white rounded-lg shadow-md space-y-8 p-6">
          <div className="flex justify-between items-center">
            <p className="text-2xl font-semibold text-gray-800">Edit Profile</p>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Upload Section */}
            <div className="flex flex-col items-center cursor-pointer w-48 mx-auto">
              <label htmlFor="doc-img" className="flex flex-col items-center gap-2">
                <img
                  src={imagePreview || assets.upload_area}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full cursor-pointer"
                />
                <p className="text-gray-600 text-sm">Change Profile Picture</p>
              </label>
              <input
                onChange={handleImageChange}
                ref={fileInputRef}
                type="file"
                id="doc-img"
                accept="image/*"
                hidden
              />
            </div>
            {/* Doctor Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="mb-1 font-medium text-gray-700">Name</p>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Email</p>
                  <input
                    type="email"
                    value={doctorInfo.email}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Experience</p>
                  <select
                    name="experience"
                    value={editForm.experience}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={`${i + 1} Year`}>
                        {i + 1} Year
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Consultation Fee</p>
                  <input
                    type="number"
                    name="fees"
                    value={editForm.fees}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 font-medium text-gray-700">Speciality</p>
                  <select
                    name="speciality"
                    value={editForm.speciality}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="Nephrologist">Nephrologist</option>
                    <option value="Endocrinologist">Endocrinologist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="General Surgeon">General Surgeon</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                    <option value="Urologist">Urologist</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Oncologist">Oncologist</option>
                    <option value="Rheumatologist">Rheumatologist</option>
                    <option value="Infectious Disease Specialist">Infectious Disease Specialist</option>
                  </select>
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Education</p>
                  <input
                    type="text"
                    name="degree"
                    value={editForm.degree}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <p className="mb-1 font-medium text-gray-700">Address</p>
                  <input
                    type="text"
                    name="address.line1"
                    value={editForm.address.line1}
                    onChange={handleInputChange}
                    placeholder="Address Line 1"
                    className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    name="address.line2"
                    value={editForm.address.line2}
                    onChange={handleInputChange}
                    placeholder="Address Line 2"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <p className="mb-1 font-medium text-gray-700">About</p>
              <textarea
                name="about"
                value={editForm.about}
                onChange={handleInputChange}
                placeholder="Write about yourself..."
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-md shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default DoctorProfile;