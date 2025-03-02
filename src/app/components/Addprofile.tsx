import React from 'react';

const AddProfile: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 bg-purple-700 text-white p-6">
        <ul className="space-y-4">
          {['Add Profile', 'Add Services', 'Add Salon About', 'Add Products', 'View Service Orders', 'View Product Orders', 'View Reviews'].map(
            (item, index) => (
              <li
                key={index}
                className={`cursor-pointer p-2 rounded ${
                  item === 'Add Profile' ? 'bg-white text-purple-700' : 'hover:bg-purple-500/20'
                } transition duration-300`}
              >
                {item}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <h2 className="text-2xl font-semibold mb-6">Add Profile</h2>
        <form className="bg-white p-6 rounded-lg shadow-md max-w-lg">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter full name"
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="contact">
              Contact Number
            </label>
            <input
              type="tel"
              id="contact"
              placeholder="Enter contact number"
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              placeholder="Enter address"
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-600 transition duration-300"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProfile;
