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

}

