"use client";

import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

export default function ImageUpload({ 
  onUpload, 
  multiple = false,
  required = false 
}: {
  onUpload: (url: string, type?: string) => void;
  multiple?: boolean;
  required?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setIsUploading(true);
    
    try {
      const files = Array.from(e.target.files);
      for (const file of files) {
        // In a real app, you would upload to Cloudinary/S3/etc.
        // Here's a mock implementation:
        const mockUpload = () => {
          return new Promise<string>((resolve) => {
            setTimeout(() => {
              const url = URL.createObjectURL(file);
              resolve(url);
            }, 1000);
          });
        };
        
        const url = await mockUpload();
        onUpload(url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
      <label className="cursor-pointer flex flex-col items-center">
        <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-600">
          {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
        </span>
        <span className="text-xs text-gray-500 mt-1">
          {multiple ? 'PNG, JPG up to 5MB' : 'PNG, JPG up to 2MB'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          multiple={multiple}
          required={required}
        />
      </label>
    </div>
  );
}