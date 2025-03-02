"use client";

import React, { useState } from "react";

interface Appointment {
  id: number;
  client: string;
  service: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

const appointmentsData: Appointment[] = [
  { id: 1, client: "John Doe", service: "Haircut", date: "2025-02-15", time: "10:30 AM", status: "Upcoming" },
  { id: 2, client: "Emma Smith", service: "Nail Art", date: "2025-02-12", time: "12:00 PM", status: "Completed" },
  { id: 3, client: "Liam Johnson", service: "Tattoo", date: "2025-02-10", time: "02:00 PM", status: "Cancelled" },
  { id: 4, client: "Sophia Brown", service: "Facial", date: "2025-02-18", time: "03:30 PM", status: "Upcoming" },
];

export default function Appointments() {
  const [filter, setFilter] = useState<"All" | "Upcoming" | "Completed" | "Cancelled">("All");

  const filteredAppointments =
    filter === "All" ? appointmentsData : appointmentsData.filter((apt) => apt.status === filter);

  return (
    <div className="p-6 min-h-screen bg-base-200 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-base-100 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-base-content">Appointments</h2>
        <p className="text-base-content/70">Manage your upcoming and past appointments.</p>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          {["All", "Upcoming", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === status ? "bg-primary text-white" : "border text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="mt-4">
          {filteredAppointments.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No appointments found.</p>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 mt-2 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-base-content">{appointment.client}</h3>
                  <p className="text-gray-600">{appointment.service}</p>
                  <p className="text-gray-500">{appointment.date} at {appointment.time}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-sm ${
                    appointment.status === "Upcoming"
                      ? "bg-yellow-100 text-yellow-600"
                      : appointment.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
