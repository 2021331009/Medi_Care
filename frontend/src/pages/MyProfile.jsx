import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyProfile = () => {
  const {
    userData,
    setUserData,
    backendUrl,
    token,
    loadUserProfileData
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setUserData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('userId', userData._id);
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      formData.append('dob', userData.dob);
      formData.append('gender', userData.gender);
      formData.append('address', JSON.stringify(userData.address));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await axios.post(`${backendUrl}/api/user/update-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast.success('Profile updated!');
        loadUserProfileData();
        setIsEdit(false);
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating profile');
    }
  };

  return userData && (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-teal-50 to-indigo-100 shadow-xl rounded-2xl mt-12 space-y-8">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="relative">
          <img
            src={imageFile ? URL.createObjectURL(imageFile) : userData.image}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover cursor-pointer"
          />
          {isEdit && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 cursor-pointer"
            />
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          {isEdit ? (            
            <input
              type="text"
              name="name"
              className="w-full text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-teal-400 focus:outline-none focus:border-teal-600 transition-colors duration-200"
              value={userData.name}
              onChange={handleChange}
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
          )}
          <p className="text-lg text-gray-600 mt-1">{userData.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8 border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              {isEdit ? (
                <input
                  type="text"
                  name="phone"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={userData.phone}
                  onChange={handleChange}
                />
              ) : (
                <p className="font-medium text-gray-800">{userData.phone}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500 text-sm">Address</p>
              {isEdit ? (
                <div className="space-y-2 mt-1">
                  <input
                    type="text"
                    name="address.line1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={userData.address?.line1 || ''}
                    onChange={handleChange}
                    placeholder="Address Line 1"
                  />

                  <input
                    type="text"
                    name="address.line2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={userData.address?.line2 || ''}
                    onChange={handleChange}
                    placeholder="Address Line 2"
                  />
                </div>
              ) : (
                <p className="font-medium text-gray-800">
                  {userData.address?.line1}
                  <br />
                  {userData.address?.line2}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">Gender</p>
              {isEdit ? (
                <select
                  name="gender"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  value={userData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="font-medium text-gray-800">{userData.gender}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500 text-sm">Birthday</p>
              {isEdit ? (
                <input
                  type="date"
                  name="dob"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={userData.dob}
                  onChange={handleChange}
                />
              ) : (
                <p className="font-medium text-gray-800">{userData.dob}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        {isEdit ? (
          <div className="space-x-4 inline-flex">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-lg hover:bg-teal-700 transition-all cursor-pointer"
            >
              Save Information
            </button>
            <button
              onClick={() => setIsEdit(false)}
              className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-full shadow hover:bg-gray-400 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-full shadow-lg hover:bg-gray-900 transition-all cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
