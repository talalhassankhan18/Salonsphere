import React from "react";
import { Service } from "@/app/Booking/types/booking";
import { Card, CardContent } from "@/app/Booking/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onClick: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden",
        isSelected ? "ring-2 ring-primary" : "hover:scale-105"
      )}
      onClick={() => onClick(service.id)}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {service.image && (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex justify-between items-end">
            <h3 className="font-semibold text-white text-lg">{service.name}</h3>
            <span className="text-white font-medium">${service.price}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
            {service.duration} minutes
          </span>
          {isSelected && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              Selected
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
