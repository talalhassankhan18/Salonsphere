"use client";

import React, { useState } from "react";
import { Service } from "../../../../../../types";
import { X, Upload, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditServiceFormProps {
  service: Service;
  onSubmit: (service: Partial<Service>) => void;
  onCancel: () => void;
}

const EditServiceForm: React.FC<EditServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState(service.price.toString());
  const [duration, setDuration] = useState(service.duration.toString());
  const [category, setCategory] = useState(service.category);
  const [image, setImage] = useState<string | null>(service.image || null);
  const [gender, setGender] = useState<"Unisex" | "Female" | "Male">(
    service.gender
  );
  const [isActive, setIsActive] = useState(service.isActive);

  const categories = ["Hair", "Nails", "Skin", "Makeup", "Massage", "Other"];
  const genders = ["Unisex", "Female", "Male"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedService: Partial<Service> = {
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      category,
      image: image || undefined,
      gender,
      isActive,
      updatedAt: new Date(),
    };

    onSubmit(updatedService);
  };

  const incrementDuration = () => {
    setDuration((prev) => (parseInt(prev) + 15).toString());
  };

  const decrementDuration = () => {
    setDuration((prev) => Math.max(15, parseInt(prev) - 15).toString());
  };

  const isFormValid =
    name && description && price && duration && category && gender;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit Service</h2>
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Service Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Classic Haircut"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Describe your service..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (PKR)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Duration (minutes)
              </label>
              <div className="flex">
                <button
                  type="button"
                  onClick={decrementDuration}
                  className="px-3 py-2 border border-gray-200 rounded-l-lg hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border-y border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  min="15"
                  step="15"
                  required
                />
                <button
                  type="button"
                  onClick={incrementDuration}
                  className="px-3 py-2 border border-gray-200 rounded-r-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as "Unisex" | "Female" | "Male")
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              {["Unisex", "Female", "Male"].map((gen) => (
                <option key={gen} value={gen}>
                  {gen}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="isActive"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Active
            </label>
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Image
            </label>
            {image ? (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="Service preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-700" />
                </button>
              </div>
            ) : (
              <label className="block h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
              isFormValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            )}
          >
            Update Service
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditServiceForm;
