import React, { useContext, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios'
import { toast } from 'react-toastify';
import { DoctorContext } from '../context/DoctorContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  // Optional: Add handleSubmit logic here
  const onSubmitHandler=async (event)=>{
      event.preventDefault()
      setLoading(true);

      try{
        if(state==='Admin'){
          const {data}=await axios.post(backendUrl+'/api/admin/login',{email,password})
          if(data.success){
            localStorage.setItem('aToken',data.token )
            setAToken(data.token)
            navigate('/admin-dashboard');
            toast.success('Welcome back, Admin!');
          }else{
            toast.error(data.message)
          }
        }else{
        const {data}=await axios.post(backendUrl+'/api/doctor/login',{email,password })
          if(data.success){
            localStorage.setItem('dToken',data.token )
            setDToken(data.token)
            navigate('/doctor-dashboard');
            toast.success('Welcome back, Doctor!');
          }else{
            toast.error(data.message)
          }
        }
      }catch(error){
        console.log(error)
        toast.error(error.response?.data?.message || error.message)
      }finally{
        setLoading(false);
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={onSubmitHandler}
        className="max-w-md w-full mx-auto p-8 border border-gray-300 rounded-lg shadow-md bg-white"
      >
        <p className="text-3xl font-semibold mb-8 text-center text-gray-800">
          <span className="text-teal-600">{state}</span> Login
        </p>

        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 ${
            loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 cursor-pointer'
          } text-white rounded-md font-semibold transition-colors duration-300 flex items-center justify-center`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        <p className="mt-6 text-center text-gray-600">
          {state === 'Admin' ? (
            <>
              Doctor Login?{' '}
              <span
                onClick={() => !loading && setState('Doctor')}
                className={`text-teal-600 ${
                  loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:underline'
                }`}
                role="button"
                tabIndex={loading ? -1 : 0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) setState('Doctor');
                }}
              >
                Click here
              </span>
            </>
          ) : (
            <>
              Admin Login?{' '}
              <span
                onClick={() => !loading && setState('Admin')}
                className={`text-teal-600 ${
                  loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:underline'
                }`}
                role="button"
                tabIndex={loading ? -1 : 0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) setState('Admin');
                }}
              >
                Click here
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login;
