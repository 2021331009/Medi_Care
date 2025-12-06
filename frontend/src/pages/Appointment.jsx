import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import axios from "axios";
import { toast } from "react-toastify";

const Appointment = () => {
  
  const { docId } = useParams();
  const { doctors, currencySymbol, token, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  
  const fetchDocInfo = async () => {
    try {
      const cachedDoc = doctors.find((doc) => doc._id === docId);
      setDocInfo(cachedDoc);
      
      const { data } = await axios.get(`${backendUrl}/api/user/doctor/${docId}`);
      if (data.success && data.doctor) {
        setDocInfo(data.doctor);
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  
  const getAvailableSlots = async () => {
    const today = new Date();
    const allSlots = [];
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      let endTime = new Date(today);
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);
      if (i === 0) {
        const now = new Date();
        currentDate.setHours(Math.max(now.getHours() + 1, 10));
        currentDate.setMinutes(now.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }
      const timeSlots = [];
      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        const slotDate = `${day}_${month}_${year}`;
        const slotTimeStr = formattedTime;

        const isSlotBooked =
          docInfo?.slots_booked?.[slotDate]?.includes(slotTimeStr) || false;

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
          isBooked: isSlotBooked,
          date: slotDate
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      allSlots.push(timeSlots);
    }
    setDocSlots(allSlots);
  };

  const handleBookAppointment = async () => {
    if (!token) {
      toast.error("Please login to book an appointment");
      return navigate("/login");
    }
    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      const selectedSlot = docSlots[slotIndex].find((slot) => slot.time === slotTime);
      if (!selectedSlot) {
        toast.error("Selected slot is invalid");
        return;
      }

      if (selectedSlot.isBooked) {
        toast.error("This slot is already booked. Please select another time slot.");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { 
          docId, 
          slotDate: selectedSlot.date, 
          slotTime: slotTime.toLowerCase() 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setSlotTime("");
        
        await fetchDocInfo();
        
        setTimeout(() => {
          navigate("/my-appointment");
        }, 500);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (docInfo) {
        getAvailableSlots();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [docInfo]);

  return (
    docInfo && (
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow duration-300">
          <div className="md:w-1/3 bg-gradient-to-br from-teal-50 to-indigo-100 p-5 flex items-center justify-center">
            <img
              src={docInfo.image}
              alt={docInfo.name}
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
          </div>
          <div className="md:w-2/3 p-5 flex flex-col justify-between space-y-4 text-gray-800">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{docInfo.name}</h2>
              <img
                src={assets.verified_icon}
                alt="Verified"
                className="w-4 h-4"
                title="Verified Doctor"
              />
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-semibold">
                {docInfo.degree} • {docInfo.speciality}
              </p>
              <p className="inline-block bg-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mt-1">
                {docInfo.experience} experience
              </p>
            </div>
            <section>
              <div className="flex items-center gap-1 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">About</h3>
                <img
                  src={assets.info_icon}
                  alt="Info"
                  className="w-4 h-4 opacity-80"
                  title="More Information"
                />
              </div>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                {docInfo.about}
              </p>
            </section>
            <section>
              <div className="flex items-center gap-1 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                <img
                  src={assets.location_icon}
                  alt="Location"
                  className="w-4 h-4 opacity-80"
                  title="Doctor's Location"
                />
              </div>
              <div className="text-gray-700 leading-relaxed text-sm">
                <p className="font-bold">{docInfo.address?.line1}</p>
                <p className="font-bold">{docInfo.address?.line2}</p>
                <p className="font-bold">{docInfo.address?.city}, {docInfo.address?.state} {docInfo.address?.pinCode}</p>
              </div>
            </section>
            <div className="mt-3 text-sm font-semibold text-gray-900">
              Appointment fee:{" "}
              <span className="text-teal-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 font-semibold text-gray-800 max-w-xl mx-auto">
          <p className="text-2xl font-bold mb-6 text-center tracking-wide">
            Booking slots
          </p>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar px-4 py-2">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSlotIndex(index)}
                  className={`
                    flex flex-col items-center justify-center min-w-[72px] cursor-pointer rounded-xl 
                    border transition-all duration-300 select-none
                    ${
                      slotIndex === index
                        ? "bg-teal-600 text-white shadow-lg scale-110"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-teal-100 hover:text-teal-600"
                    }
                  `}
                  style={{ padding: "12px 16px" }}
                >
                  <p className="text-sm font-semibold tracking-wide">
                    {item[0] && daysOfWeek[item[0].datetime.getDay()]}
                  </p>
                  <p className="text-xl font-bold mt-1">
                    {item[0] && item[0].datetime.getDate()}
                  </p>
                </div>
              ))}
          </div>
          <div className="mt-10 max-w-xl mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {docSlots.length > 0 &&
                docSlots[slotIndex].map((item, index) => (
                  <label
                    key={index}
                    htmlFor={`timeslot-${index}`}
                    className={`cursor-pointer min-w-[80px] text-sm font-semibold shadow-sm whitespace-nowrap
                      border rounded-xl
                      flex justify-center items-center
                      transition duration-300 ease-in-out
                      ${item.isBooked 
                        ? 'border-red-300 bg-red-50 cursor-not-allowed' 
                        : 'border-teal-300 hover:bg-teal-100 hover:text-teal-900'
                      }`}
                  >
                    <input
                      type="radio"
                      id={`timeslot-${index}`}
                      name="timeslot"
                      className="hidden peer"
                      onChange={() => !item.isBooked && setSlotTime(item.time)}
                      disabled={item.isBooked}
                    />
                    <span
                      className={`
                        block w-full px-4 py-2 rounded-xl
                        ${item.isBooked 
                          ? 'text-red-500' 
                          : slotTime === item.time
                            ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-300'
                            : 'text-teal-700'
                        }
                        transition-colors duration-300
                      `}
                    >
                      <div>{item.time.toLowerCase()}</div>
                      {item.isBooked && (
                        <div className="text-xs font-medium text-red-600 mt-1">Booked</div>
                      )}
                    </span>
                  </label>
                ))}
            </div>
            <div className="text-center mt-6">
              <button
                onClick={handleBookAppointment}
                disabled={!slotTime}
                className={`px-6 py-3 rounded-xl text-base font-bold
                  shadow-md transition duration-300 ease-in-out 
                  focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer
                  ${!slotTime 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'
                  } text-white`}
              >
                Book an Appointment
              </button>
            </div>
          </div>
          <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
      </div>
    )
  );
};

export default Appointment;