"use client";

import React, { useState } from "react";
import { FaStar, FaFilter } from "react-icons/fa";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]); // Empty state for now

  return (
    <div className="p-6 min-h-screen bg-base-200 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-base-100 shadow-lg rounded-lg p-6">
        {/* Reviews Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-base-content">Reviews</h2>
          <button className="border p-2 rounded-lg flex items-center gap-2 text-primary hover:bg-primary hover:text-white transition">
            <FaFilter />
            Filters
          </button>
        </div>
        <p className="text-base-content/70 mt-2">
          See star ratings and reviews left by clients after their visit.
        </p>

        {/* No Reviews UI */}
        {reviews.length === 0 ? (
          <div className="mt-6 border rounded-lg p-6 flex flex-col items-center text-center">
            <FaStar className="text-purple-500 text-4xl" />
            <h3 className="text-lg font-semibold mt-2">No reviews yet</h3>
            <p className="text-sm text-gray-500">
              Clients have not provided feedback for their appointments yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold">{review.name}</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} className={i < review.rating ? "" : "opacity-30"} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
