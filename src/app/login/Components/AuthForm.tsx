"use client";

import { useState } from "react";

export default function AuthForm({ onSubmit }: { onSubmit: (formData: { email: string; password: string }) => void }) {
  const [formData, setFormData] = useState({ email: "", password: "" });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // Prevent default form submission
    onSubmit(formData); // Pass formData to the parent component
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-md">
      <input
        type="email"
        placeholder="Email"
        className="block w-full border p-2 my-2"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="block w-full border p-2 my-2"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Submit</button>
    </form>
  );
}
