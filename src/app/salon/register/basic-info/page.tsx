"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationStepper from "../../components/RegistrationStepper";
import LoadingSpinner from "@/common/LoadingSpinner";
import toast from "react-hot-toast";
import { setSession } from "@/lib/session";
import axios from "axios";

interface FormData {
  name: string;
  salonName: string;
  phone: string;
  username: string;
  address: string;
  password: string;
  confirmPassword: string;
  salonType: string;
  latitude?: string; // Added for geocoding
  longitude?: string; // Added for geocoding
}

interface FormErrors {
  email?: string;
  name?: string;
  salonName?: string;
  phone?: string;
  username?: string;
  address?: string;
  salonType?: string;
  password?: string;
  confirmPassword?: string;
  avatar?: string;
}

export default function BasicInfoPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    salonName: "",
    phone: "",
    username: "",
    address: "",
    password: "",
    confirmPassword: "",
    salonType: "",
    latitude: "", // Initialize
    longitude: "", // Initialize
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const address = e.target.value;
    setFormData((prev) => ({ ...prev, address, latitude: "", longitude: "" }));
    setErrors((prev) => ({ ...prev, address: "" }));

    if (address.trim()) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`
        );
        const data = response.data;
        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            latitude: data[0].lat,
            longitude: data[0].lon,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            address: "Could not find coordinates for this address",
          }));
        }
        // Respect Nominatim rate limit (1 request per second)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Geocoding error:", error);
        setErrors((prev) => ({
          ...prev,
          address: "Failed to geocode address",
        }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Only JPEG or PNG images are allowed",
        }));
        setAvatar(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Image size must be less than 5MB",
        }));
        setAvatar(null);
        return;
      }
      setAvatar(file);
      setErrors((prev) => ({ ...prev, avatar: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        avatar: "Profile image is required",
      }));
      setAvatar(null);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.name) newErrors.name = "Owner name is required";
    if (!formData.salonName) newErrors.salonName = "Salon name is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.salonType) newErrors.salonType = "Salon type is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!avatar) newErrors.avatar = "Profile image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      toast.error("Please wait, submission in progress...");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Saving your information...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", email);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("salonName", formData.salonName);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("salonType", formData.salonType);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("authMethod", "email");
      formDataToSend.append("avatar", avatar!);
      if (formData.latitude && formData.longitude) {
        formDataToSend.append("latitude", formData.latitude);
        formDataToSend.append("longitude", formData.longitude);
      }

      const response = await fetch("/api/register/basic", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      console.log("Basic Info API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to save basic information");
      }

      setSession("salon_registration_email", email);
      toast.success("Basic information saved successfully!", {
        id: toastId,
        duration: 5000,
      });
      router.push(
        `/salon/register/verification?email=${encodeURIComponent(email)}`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to save basic information", {
        id: toastId,
      });
      setErrors((prev) => ({
        ...prev,
        email: err.message || "Failed to save basic information",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#B4004E] mb-3">
            Basic Information
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Let’s get to know you and your salon.
          </p>
        </div>

        <RegistrationStepper currentStep="Basic Info" />

        <div className="bg-white shadow-lg rounded-xl p-8 transform transition-all duration-300 hover:shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="salonName"
                className="block text-sm font-medium text-gray-700"
              >
                Salon Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="salonName"
                value={formData.salonName}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.salonName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your salon name"
                required
              />
              {errors.salonName && (
                <p className="mt-1 text-xs text-red-500">{errors.salonName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.avatar ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.avatar && (
                <p className="mt-1 text-xs text-red-500">{errors.avatar}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="salonType"
                className="block text-sm font-medium text-gray-700"
              >
                Salon Type <span className="text-red-500">*</span>
              </label>
              <select
                name="salonType"
                value={formData.salonType}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.salonType ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="" disabled>
                  Select Salon Type
                </option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="unisex">Unisex</option>
              </select>
              {errors.salonType && (
                <p className="mt-1 text-xs text-red-500">{errors.salonType}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData((prev) => ({ ...prev, phone: value }));
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your phone number"
                required
                maxLength={10}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Choose a username"
                required
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleAddressChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your salon address"
                required
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Create a password"
                required
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#B4004E] text-white py-3 rounded-lg font-medium hover:bg-[#9a0042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E] disabled:opacity-50 transition-all transform hover:scale-[1.01]"
            >
              {isLoading ? "Submitting..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
