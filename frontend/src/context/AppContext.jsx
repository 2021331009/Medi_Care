import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "৳";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Load token initially from localStorage (null if none)
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [doctors, setDoctors] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [userData, setUserData] = useState(null);

  // Sync token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Axios instance with token header
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {}, // only add header if token exists
  });

  // Axios interceptor for 401
  axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        setToken(null);
        setUserData(null);
      }
      return Promise.reject(err);
    }
  );

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) setDoctors(data.doctors);
      else toast.error(data.message);

      const topData = await axios.get(backendUrl + "/api/doctor/top-doctors");
      if (topData.data.success) setTopDoctors(topData.data.doctors);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    if (!token) return;
    try {
      const { data } = await axiosInstance.get("/api/user/get-profile");
      if (data.success) setUserData(data.userData);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Initial fetch
    getDoctorsData();
    const interval = setInterval(() => getDoctorsData(), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token) loadUserProfileData();
    else setUserData(null);
  }, [token]);

  const value = {
    doctors,
    topDoctors,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
