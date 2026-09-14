"use client";

import React, { useState, useEffect } from "react";

interface Country {
  name: string;
  code: string;
  dialCode: string;
}

const BillingAddressForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    countryCode: "+1",
    country: "Afghanistan",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch country list & dial codes
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();

        const countryList = data
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            dialCode:
              country.idd?.root + (country.idd?.suffixes ? country.idd.suffixes[0] : ""),
          }))
          .filter((c: Country) => c.dialCode)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(countryList);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "country") {
      const selectedCountry = countries.find((c) => c.name === value);
      setFormData((prev) => ({
        ...prev,
        country: value,
        countryCode: selectedCountry ? selectedCountry.dialCode : prev.countryCode,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!/^\d+$/.test(formData.phoneNumber)) errors.phoneNumber = "Enter a valid phone number.";
    if (!formData.address1.trim()) errors.address1 = "Street address is required.";
    if (!formData.city.trim()) errors.city = "City is required.";
    if (!formData.state.trim()) errors.state = "State/Province is required.";
    if (!formData.postalCode.trim()) errors.postalCode = "Postal code is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Billing Address Saved!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      {/* <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
        <span className="border border-pink-300 text-pink-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
          1
        </span>
        Billing Address
      </h2> */}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full border rounded-md px-4 py-2 focus:outline-pink-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full border rounded-md px-4 py-2 focus:outline-pink-600"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <div className="flex">
            <div className="relative">
            <select 
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 appearance-none focus:outline-pink-600"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.dialCode}>
                  {country.dialCode} ({country.name})
                </option>
              ))}
            </select>
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="flex-1 border rounded-md px-4 py-2 focus:outline-pink-600"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Country of Residence *</label>
          <div className="relative">
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2 appearance-none focus:outline-pink-600"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
          <input
            type="text"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            placeholder="Street address"
            className="w-full border rounded-md px-4 py-2 focus:outline-pink-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
          <input
            type="text"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            placeholder="Apartment, suite, etc. (optional)"
            className="w-full border rounded-md px-4 py-2 focus:outline-pink-600"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="city" placeholder="City" onChange={handleChange} className="border rounded-md px-4 py-2 focus:outline-pink-600" />
          <input type="text" name="state" placeholder="State" onChange={handleChange} className="border rounded-md px-4 py-2 focus:outline-pink-600" />
          <input type="text" name="postalCode" placeholder="Postal Code" onChange={handleChange} className="border rounded-md px-4 py-2 focus:outline-pink-600" />
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-medium py-2 rounded-md">
          Continue
        </button>
      </form>
    </div>
  );
};

export default BillingAddressForm;
