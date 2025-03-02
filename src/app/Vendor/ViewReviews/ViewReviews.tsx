import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Components/Sidebar';
const ViewReviews: React.FC = () => {
  const router = useRouter();

  // State to track active menu
  const [activeMenu, setActiveMenu] = useState<string>('View Reviews');

  // Navigation handler
  const navigateTo = (path: string, label: string) => {
    setActiveMenu(label);
    router.push(path);
  };

  interface Review {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    reviewDate: string;
  }

  // Sample review data
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "001",
      customerName: "John Doe",
      rating: 5,
      comment: "Amazing service! Highly recommend this salon.",
      reviewDate: "2024-12-01",
    },
    {
      id: "002",
      customerName: "Jane Smith",
      rating: 4,
      comment: "Good service but the wait was a bit long.",
      reviewDate: "2024-12-02",
    },
    {
      id: "003",
      customerName: "Sam Wilson",
      rating: 3,
      comment: "Average experience. Could be improved.",
      reviewDate: "2024-12-03",
    },
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
     {/* Sidebar */}
     <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-6 text-purple-700">
          View Reviews
        </h1>

        {/* Reviews Table */}
        <div className="overflow-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto border-collapse text-left">
            <thead className="bg-purple-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Customer Name</th>
                <th className="border border-gray-300 px-4 py-2">Rating</th>
                <th className="border border-gray-300 px-4 py-2">Review</th>
                <th className="border border-gray-300 px-4 py-2">Review Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-purple-50">
                  <td className="border border-gray-300 px-4 py-2">{review.customerName}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`inline-block ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{review.comment}</td>
                  <td className="border border-gray-300 px-4 py-2">{review.reviewDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewReviews;
