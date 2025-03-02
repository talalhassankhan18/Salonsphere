"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getUserIdByEmail, saveService, updateBusinessStatus } from "./actions";
import { useRouter } from "next/navigation";

const maleServices = ["Haircut", "Shaving", "Beard Trim", "Facial", "Head Massage", "Hair Wash",
  "Hair Styling", "Hair Coloring", "Keratin Treatment", "Scalp Treatment"];
const femaleServices = ["Haircut", "Hair Coloring", "Manicure", "Pedicure", "Facial", "Waxing",
  "Threading", "Bridal Makeup", "Party Makeup", "Keratin Treatment",
  "Scalp Treatment", "Nail Art", "Eyelash Extensions"];

const Page = () => {
  const { email } = useAuth();  // Get email from AuthContext
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState(false);
  const [registrationDate, setRegistrationDate] = useState("N/A");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");
  const [salonType, setSalonType] = useState("Male");
  const router = useRouter();

  // Fetch user ID when email is available
  useEffect(() => {
    if (email) {
      getUserIdByEmail(email).then((id) => {
        if (id) setUserId(id);
      });
    }
  }, [email]);

  // Toggle Business Status and Update DB
  const toggleStatus = async () => {
    if (!userId) return alert("User not found");

    const newStatus = !status;
    setStatus(newStatus);

    const response = await updateBusinessStatus(userId, newStatus ? "active" : "inactive");
    if (!response.success) {
      alert(response.message);
    }

    if (newStatus && registrationDate === "N/A") {
      setRegistrationDate(new Date().toLocaleDateString());
    }
  };

  // Toggle Service Selection and Save to DB
  const toggleService = async (service: string) => {
    if (!userId) return alert("User not found");

    setSelectedServices((prev) => {
      const updatedServices = prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service];

      saveService(userId, service).then((res) => {
        if (!res.success) alert(res.message);
      });

      return updatedServices;
    });
  };

  // Add Custom Service
  const addCustomService = async () => {
    if (!userId) return alert("User not found");

    if (customService && !selectedServices.includes(customService)) {
      setSelectedServices([...selectedServices, customService]);

      const response = await saveService(userId, customService);
      if (!response.success) alert(response.message);

      setCustomService("");
    }
  };

  // Remove Service
  const removeService = (service: string) => {
    setSelectedServices((prev) => prev.filter((s) => s !== service));
  };

  const handleSaveAndContinue = () => {
    router.push("/Salondashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-yellow-500 to-orange-400 py-12 px-6 text-center w-full">
        <h1 className="text-4xl font-extrabold text-black md:text-5xl">
          Select Salon Services
        </h1>

        {/* Business Status Box */}
        <div className="mt-6 bg-white rounded-[50px] p-6 flex justify-between items-center mx-auto w-1/2 border-2 border-gray-300 shadow-xl">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-gray-800">Business Status:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={status}
                onChange={toggleStatus}
              />
              <div className="w-16 h-9 bg-gray-300 rounded-full peer-checked:bg-green-500 transition duration-300 flex items-center px-1 relative">
                <span className={`absolute left-3 text-white text-lg font-bold transition-opacity ${status ? "opacity-100" : "opacity-0"}`}>
                  ✔
                </span>
                <span className={`absolute right-3 text-gray-500 text-lg font-bold transition-opacity ${!status ? "opacity-100" : "opacity-0"}`}>
                  ✖
                </span>
                <div className={`w-6 h-6 bg-white rounded-full transition-all ${status ? "translate-x-8" : "translate-x-0"}`} />
              </div>
            </label>
          </div>
          <div className="font-bold text-gray-800">
            Registration Date: <span className="text-pink-600">{registrationDate}</span>
          </div>
        </div>
      </div>
      <div className="bg-white/80 shadow-xl border border-gray-200 rounded-2xl w-full max-w-7xl min-h-[65vh] mx-auto backdrop-blur-lg transform transition-all duration-300 hover:shadow-2xl pt-5 mt-5">
        {/* Main Container */}
        <div className="flex flex-col w-full max-w-5xl mx-auto mt-8 gap-8 p-6">

          {/* Heading */}
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Customize Your Salon Services
          </h2>
          <p className="text-center text-gray-600">
            Add your own services or select from the available list.
          </p>

          {/* Custom Service Input + Add Button + Dropdown (Side-by-Side) */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">

            {/* Custom Service Input */}
            <input
              type="text"
              placeholder="✍ Add a custom service"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              className="border-2 border-gray-300 p-4 rounded-full w-full max-w-3xl h-16 text-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
            />

            {/* Add Button */}
            <button
              onClick={addCustomService}
              className="bg-primary text-primary-content px-6 py-3 rounded-full hover:bg-[#92003E] transition-all text-lg font-semibold shadow-lg"
            >
              Add
            </button>
          </div>


          {/* Services Section */}
          <div className="flex flex-col md:flex-row w-full gap-6">

            {/* Selected Services */}
            <div className="w-full md:w-1/2 bg-white shadow-lg border border-gray-200 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-center text-primary">Selected Services</h3>
              <p className="text-gray-500 text-center text-sm">Click on a service to remove it</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {selectedServices.length > 0 ? (
                  selectedServices.map((service, index) => (
                    <span
                      key={index}
                      onClick={() => removeService(service)}
                      className="px-5 py-3 bg-red-400 text-white rounded-full font-semibold shadow-md cursor-pointer hover:bg-red-500 transition-all"
                    >
                      {service} ✖
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-center mt-3">No services selected.</p>
                )}
              </div>
            </div>

            {/* Available Services */}
            <div className="w-full md:w-1/2 bg-white shadow-lg border border-gray-200 rounded-xl p-6">

              {/* Salon Type Dropdown */}
              <select
                value={salonType}
                onChange={(e) => setSalonType(e.target.value)}
                className="border-2 border-gray-300 p-4 rounded-full w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold shadow-md"
              >
                <option value="Male">👨 Male Salon</option>
                <option value="Female">👩 Female Salon</option>
              </select>
              <h3 className="text-2xl font-bold text-center text-primary">
                {salonType} Salon Services
              </h3>
              <p className="text-gray-500 text-center text-sm">Click to add a service</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {(salonType === "Male" ? maleServices : femaleServices).map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${selectedServices.includes(service)
                      ? "bg-primary text-primary-content border-2 border-[#92003E] shadow-md"
                      : "bg-gray-300 text-black hover:bg-gray-400"
                      }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSaveAndContinue} className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg mt-6">
            Save and Continue
          </button>

        </div>

      </div>
    </div>
  );
};

export default Page;
