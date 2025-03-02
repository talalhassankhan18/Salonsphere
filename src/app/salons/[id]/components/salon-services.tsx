'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import User from "@/mongoose-models/SalonService";

const SalonServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]); // State to store fetched services
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [newService, setNewService] = useState({
    serviceName: '',
    duration: '',
    price: 0,
    gender: 'Female',
  }); // Form state for new service

  // Fetch services from the backend
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/Services/get');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          setError('Failed to fetch services');
        }
      } catch (err) {
        setError('An error occurred while fetching services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Handle adding a new service
  const handleAddService = async () => {
    setError(null);

    try {
      const response = await fetch('/api/Services/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });

      if (response.ok) {
        const createdService = await response.json();
        setServices((prevServices) => [...prevServices, createdService]);
        setNewService({ serviceName: '', duration: '', price: 0, gender: 'Female' }); // Reset form
      } else {
        setError('Failed to create service');
      }
    } catch (err) {
      setError('An error occurred while adding the service');
    }
  };

  // Handle deleting a service
  const handleDeleteService = async (id: string) => {
    setError(null);

    try {
      const response = await fetch('/api/Services/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setServices((prevServices) => prevServices.filter((service) => service._id !== id));
      } else {
        setError('Failed to delete service');
      }
    } catch (err) {
      setError('An error occurred while deleting the service');
    }
  };

  if (loading) return <div>Loading services...</div>; // Show loading message
  if (error) return <div className="text-red-500">{error}</div>; // Show error message

  return (
    <div className="mb-6 w-full md:mb-8 bg-primary p-4">
      <h2 className="text-2xl font-bold mb-4 text-purple-600">Salon Services</h2>

      {/* Display services */}
      <div className="relative">
        <Swiper
          spaceBetween={30}
          slidesPerView="auto"
          loop={false}
          breakpoints={{
            280: { slidesPerView: 1 },
            768: { slidesPerView: 3 },
          }}
        >
          {services.map((service) => (
            <SwiperSlide key={service._id}>
              <div className="service-item border p-4 rounded shadow-sm">
                <img
                  src={service.image || '/default-image.jpg'}
                  alt={service.serviceName}
                  className="w-full h-48 object-cover mb-2 rounded"
                />
                <h3 className="text-lg font-semibold mb-2">{service.serviceName}</h3>
                <p className="text-gray-700 mb-1">Duration: {service.duration} minutes</p>
                <p className="text-gray-700 mb-3">Price: ${service.price}</p>
                <button
                  onClick={() => handleDeleteService(service._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Add new service form */}
      <div className="mt-6 bg-white p-6 rounded shadow-md">
        <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddService();
          }}
        >
          <div className="mb-4">
            <label className="block mb-1">Service Name</label>
            <input
              type="text"
              value={newService.serviceName}
              onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="E.g., Haircut"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Duration (in minutes)</label>
            <input
              type="number"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="E.g., 30"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Price (in $)</label>
            <input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: +e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="E.g., 50"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Gender</label>
            <select
              value={newService.gender}
              onChange={(e) => setNewService({ ...newService, gender: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
              required
            >
              <option value="Unisex">Unisex</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Add Service
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalonServices;
