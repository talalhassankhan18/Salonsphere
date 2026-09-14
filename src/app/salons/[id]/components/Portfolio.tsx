"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

interface PortfolioItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  image: string;
  createdAt: string;
}

interface PortfolioProps {
  salonId: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ salonId }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        console.log("Fetching portfolios for salonId:", salonId);
        const response = await fetch(`/api/salon/portfolio?salonId=${salonId}`);
        const data = await response.json();
        console.log("Fetch portfolios response:", data);

        if (response.ok) {
          setPortfolioItems(data);
        } else {
          setError(data.message || "Failed to fetch portfolios");
        }
      } catch (err) {
        console.error("Error fetching portfolios:", err);
        setError("An error occurred while fetching portfolios");
      } finally {
        setLoading(false);
      }
    };

    if (salonId) {
      fetchPortfolios();
    } else {
      setLoading(false);
      setError("No salon ID provided");
    }
  }, [salonId]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Loading portfolios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (portfolioItems.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">
          No portfolio items available for this salon.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Our Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-64 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={() =>
                  console.error(`Failed to load image: ${item.image}`)
                }
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                  {item.category}
                </span>
              </div>
              {item.description && (
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              )}
              <p className="mt-3 text-xs text-gray-500">
                Added on {format(new Date(item.createdAt), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;