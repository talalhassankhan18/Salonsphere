'use client';

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface SalonData {
  salonName: string;
  salonAddress: string;
  salonCity: string;
  salonProvince: string;
  salonZip: string;
  salonPhone: string;
}

interface SalonStepProps {
  onComplete: (data: SalonData) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

const SalonStep: React.FC<SalonStepProps> = ({ onComplete, onBack, isLoading }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<SalonData>({
    salonName: "",
    salonAddress: "",
    salonCity: "",
    salonProvince: "",
    salonZip: "",
    salonPhone: "",
  });
  const [errors, setErrors] = useState<Partial<SalonData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Partial<SalonData> = {};
    const requiredFields: (keyof SalonData)[] = [
      'salonName',
      'salonAddress',
      'salonCity',
      'salonProvince',
      'salonZip',
      'salonPhone',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace('salon', '')} is required`;
      }
    });

    const phoneRegex = /^[0-9]{10,15}$/;
    if (formData.salonPhone && !phoneRegex.test(formData.salonPhone)) {
      newErrors.salonPhone = "Please enter a valid phone number (10-15 digits)";
    }

    const zipRegex = /^[A-Za-z0-9]{5,10}$/;
    if (formData.salonZip && !zipRegex.test(formData.salonZip)) {
      newErrors.salonZip = "Please enter a valid ZIP code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await onComplete(formData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to save salon information. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 mb-1">
          Salon Name *
        </label>
        <input
          id="salonName"
          name="salonName"
          type="text"
          value={formData.salonName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.salonName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your salon name"
          disabled={isLoading}
          required
        />
        {errors.salonName && <p className="mt-1 text-sm text-red-600">{errors.salonName}</p>}
      </div>

      <div>
        <label htmlFor="salonAddress" className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <input
          id="salonAddress"
          name="salonAddress"
          type="text"
          value={formData.salonAddress}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.salonAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your salon address"
          disabled={isLoading}
          required
        />
        {errors.salonAddress && <p className="mt-1 text-sm text-red-600">{errors.salonAddress}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="salonCity" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            id="salonCity"
            name="salonCity"
            type="text"
            value={formData.salonCity}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salonCity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your city"
            disabled={isLoading}
            required
          />
          {errors.salonCity && <p className="mt-1 text-sm text-red-600">{errors.salonCity}</p>}
        </div>

        <div>
          <label htmlFor="salonProvince" className="block text-sm font-medium text-gray-700 mb-1">
            Province *
          </label>
          <input
            id="salonProvince"
            name="salonProvince"
            type="text"
            value={formData.salonProvince}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salonProvince ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your province"
            disabled={isLoading}
            required
          />
          {errors.salonProvince && (
            <p className="mt-1 text-sm text-red-600">{errors.salonProvince}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="salonZip" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code *
          </label>
          <input
            id="salonZip"
            name="salonZip"
            type="text"
            value={formData.salonZip}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salonZip ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your ZIP code"
            disabled={isLoading}
            required
          />
          {errors.salonZip && <p className="mt-1 text-sm text-red-600">{errors.salonZip}</p>}
        </div>

        <div>
          <label htmlFor="salonPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            id="salonPhone"
            name="salonPhone"
            type="tel"
            value={formData.salonPhone}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salonPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
            disabled={isLoading}
            required
          />
          {errors.salonPhone && <p className="mt-1 text-sm text-red-600">{errors.salonPhone}</p>}
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className={`flex-1 py-2 px-4 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center ${
            isLoading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          <ArrowLeft className="mr-2" size={16} />
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 py-2 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Saving..." : "Complete Registration"}
        </button>
      </div>
    </form>
  );
};

export default SalonStep;