import React from "react";
import { Salon } from "@/app/Booking/types/booking";
import { Card, CardContent } from "@/app/Booking/components/ui/card";
import { cn } from "@/lib/utils";
import { BadgeCheck, Users } from "lucide-react";

interface SalonCardProps {
  salon: Salon;
  isSelected: boolean;
  onClick: (salonId: string) => void;
}

const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  isSelected,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden",
        isSelected ? "ring-2 ring-primary" : "hover:scale-105"
      )}
      onClick={() => onClick(salon.id)}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {salon.image && (
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex justify-between items-end">
            <h3 className="font-semibold text-white text-lg">{salon.name}</h3>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                salon.type === "men"
                  ? "bg-blue-500 text-white"
                  : salon.type === "women"
                  ? "bg-pink-500 text-white"
                  : "bg-purple-500 text-white"
              )}
            >
              {salon.type === "men"
                ? "Men's Salon"
                : salon.type === "women"
                ? "Women's Salon"
                : "Unisex Salon"}
            </span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600 mb-2">{salon.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{salon.address}</span>
          {salon.capacity && (
            <span className="text-xs flex items-center text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              Capacity: {salon.capacity}
            </span>
          )}
          {isSelected && <BadgeCheck className="h-5 w-5 text-primary" />}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalonCard;
