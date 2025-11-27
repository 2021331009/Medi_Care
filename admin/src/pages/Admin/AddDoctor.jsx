import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [about, setAbout] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  const { backendUrl, aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!docImg) return toast.error('Image not selected');
      const formData = new FormData();
      formData.append('image', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('degree', degree);
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', about);
      formData.append('speciality', speciality);
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

      const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
        headers: { aToken },
      });

      if (data.success) {
        toast.success(data.message);
        setDocImg(false);
        setName('');
        setEmail('');
        setPassword('');
        setDegree('');
        setExperience('');
        setFees('');
        setAbout('');
        setSpeciality('');
        setAddress1('');
        setAddress2('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-8">
      <p className="text-2xl font-semibold text-gray-800 mb-6">Add Doctor</p>

      <div className="space-y-6">
        {/* Upload */}
        <div className="flex flex-col items-center cursor-pointer w-48 mx-auto">
          <label htmlFor="doc-img" className="flex flex-col items-center gap-2">
            <img
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Upload Area"
              className="w-32 h-32 object-contain cursor-pointer"
            />
            <p className="text-gray-600 text-sm">Upload Doctor Image</p>
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="mb-1 font-medium text-gray-700">Doctor Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Name"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-700">Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-700">Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-700">Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="" disabled hidden>-- Select Experience --</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={`${i + 1} Year`}>{i + 1} Year</option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-700">Fees</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                type="number"
                placeholder="Fees"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1 font-medium text-gray-700">Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="" disabled hidden>-- Select Speciality --</option>
                {[
                  "General Physician", "Pediatrician", "Gynecologist", "Dermatologist", "ENT Specialist",
                  "Ophthalmologist", "Dentist", "Cardiologist", "Neurologist", "Gastroenterologist",
                  "Nephrologist", "Endocrinologist", "Pulmonologist", "General Surgeon", "Orthopedic Surgeon",
                  "Urologist", "Psychiatrist", "Oncologist", "Rheumatologist", "Infectious Disease Specialist"
                ].map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-700">Education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                type="text"
                placeholder="Education"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-700">Address</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                type="text"
                placeholder="Address 1"
                className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                type="text"
                placeholder="Address 2"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <p className="mb-1 font-medium text-gray-700">About Doctor</p>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            placeholder="Write about the doctor..."
            rows={5}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="bg-teal-600 text-white font-semibold px-8 py-3 rounded-md hover:bg-teal-700 transition cursor-pointer"
          >
            Add Doctor
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddDoctor;
