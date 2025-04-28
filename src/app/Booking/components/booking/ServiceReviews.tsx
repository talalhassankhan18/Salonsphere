import React from "react";
import { Review } from "@/app/Booking/types/booking";
import { Card, CardContent } from "@/app/Booking/components/ui/card";
import { StarIcon } from "lucide-react";

interface ServiceReviewsProps {
  reviews: Review[];
  serviceName: string;
}

const ServiceReviews: React.FC<ServiceReviewsProps> = ({
  reviews,
  serviceName,
}) => {
  if (reviews.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">
          Reviews for {serviceName}
        </h3>
        <p className="text-muted-foreground">
          No reviews yet for this service.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Reviews for {serviceName}</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{review.customerName}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "text-accent fill-accent"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceReviews;
