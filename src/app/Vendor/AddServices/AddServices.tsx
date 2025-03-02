'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Components/Sidebar';
import ISalonService from "@/mongoose-models/SalonService";

const AddServices: React.FC = () => {
  const router = useRouter();

  // State to track active menu
  const [activeMenu, setActiveMenu] = useState<string>('Add Services');
  
  // Form state management
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    price: 0,
    duration: 0,
    serviceImage: null as File | null,
  });

  const [errors, setErrors] = useState({
    serviceName: '',
    description: '',
    price: '',
    duration: '',
  });

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({
      ...prev,
      serviceImage: file,
    }));
  };

  // Form validation
  const validateForm = () => {
    let formValid = true;
    const newErrors = { serviceName: '', description: '', price: '', duration: '' };

    if (!formData.serviceName) {
      formValid = false;
      newErrors.serviceName = 'Service name is required';
    }

    if (!formData.description) {
      formValid = false;
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      formValid = false;
      newErrors.price = 'Price must be greater than zero';
    }

    if (formData.duration <= 0) {
      formValid = false;
      newErrors.duration = 'Duration must be greater than zero';
    }

    setErrors(newErrors);
    return formValid;
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Assuming API call or action on successful form submission
      console.log('Form Data Submitted:', formData);
      router.push('/services'); // Redirect after submission (update path as needed)
    }
  };

  // Navigation handler
  const navigateTo = (path: string, label: string) => {
    setActiveMenu(label);
    router.push(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center p-6">
        {/* Add Services Form */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-6 text-purple-700">Add Services</h2>
          <form onSubmit={handleSubmit}>
            {/* Service Name */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="serviceName">
                Service Name
              </label>
              <input
                type="text"
                id="serviceName"
                name="serviceName"
                placeholder="E.g., Haircut, Facial"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
                value={formData.serviceName}
                onChange={handleChange}
                required
              />
              {errors.serviceName && <p className="text-red-500 text-sm">{errors.serviceName}</p>}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Provide a brief description of the service"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            {/* Price */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="price">
                Price (in $)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="E.g., 50"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
                value={formData.price}
                onChange={handleChange}
                required
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="duration">
                Duration (in minutes)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                placeholder="E.g., 60"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
                value={formData.duration}
                onChange={handleChange}
                required
              />
              {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="serviceImage">
                Upload Service Image
              </label>
              <input
                type="file"
                id="serviceImage"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
                onChange={handleFileChange}
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-600 transition duration-300"
            >
              Save Service
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddServices;
