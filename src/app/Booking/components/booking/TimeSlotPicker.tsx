"use client";

import React, { useState } from "react";
import { TimeSlot } from "@/app/Booking/types/booking";
import { formatTime } from "@/app/Booking/data/salonData";
import { cn } from "@/lib/utils";
import { Check, X, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/app/Booking/components/ui/alert";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlots: string[];
  onSelectSlot: (slotId: string) => void;
  requiredSlots: number;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlots,
  onSelectSlot,
  requiredSlots,
}) => {
  const [notEnoughConsecutiveSlots, setNotEnoughConsecutiveSlots] =
    useState<boolean>(false);

  // Function to handle slot selection with auto-consecutive selection
  const handleSlotSelection = (slotId: string) => {
    // Find the index of the selected slot
    const currentIndex = slots.findIndex((slot) => slot.id === slotId);

    // Clear existing selections if we're selecting a new first slot
    if (
      selectedSlots.length === 0 ||
      !areConsecutiveSlots(selectedSlots, slots)
    ) {
      // Select this slot and the required number of consecutive slots if available
      const availableConsecutiveSlots = getConsecutiveAvailableSlots(
        currentIndex,
        requiredSlots
      );

      if (availableConsecutiveSlots.length === requiredSlots) {
        // If we have enough consecutive available slots, select them all
        availableConsecutiveSlots.forEach((slotId) => onSelectSlot(slotId));
        setNotEnoughConsecutiveSlots(false);
      } else {
        // Not enough consecutive slots, show warning and select just this one
        setNotEnoughConsecutiveSlots(true);
        onSelectSlot(slotId);
      }
    } else {
      // Toggle the selection of this particular slot
      onSelectSlot(slotId);
    }
  };

  // Check if selected slots are consecutive
  const areConsecutiveSlots = (
    selectedSlotIds: string[],
    allSlots: TimeSlot[]
  ): boolean => {
    const selectedIndices = selectedSlotIds
      .map((id) => allSlots.findIndex((slot) => slot.id === id))
      .sort((a, b) => a - b);

    // Check if indices form a consecutive sequence
    for (let i = 1; i < selectedIndices.length; i++) {
      if (selectedIndices[i] !== selectedIndices[i - 1] + 1) {
        return false;
      }
    }

    return true;
  };

  // Get consecutive available slots starting from the given index
  const getConsecutiveAvailableSlots = (
    startIndex: number,
    count: number
  ): string[] => {
    const result: string[] = [];

    for (let i = startIndex; i < slots.length && result.length < count; i++) {
      const slot = slots[i];
      if (slot.isAvailable && !slot.capacityReached) {
        result.push(slot.id);
      } else {
        // Break if we encounter an unavailable slot
        break;
      }
    }

    return result;
  };

  // Group slots by hour for cleaner UI
  const groupedSlots: { [hour: string]: TimeSlot[] } = {};
  slots.forEach((slot) => {
    const [hour] = slot.time.split(":");
    if (!groupedSlots[hour]) {
      groupedSlots[hour] = [];
    }
    groupedSlots[hour].push(slot);
  });

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">
        Select {requiredSlots} Time Slot{requiredSlots > 1 ? "s" : ""}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {selectedSlots.length} of {requiredSlots} slots selected
      </p>

      {notEnoughConsecutiveSlots && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Not enough consecutive time slots available at this time. Please
            select another starting time for your service.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
          <div key={hour} className="border rounded-lg p-3 bg-white">
            <h4 className="font-medium mb-2 flex items-center text-neutral">
              <Clock className="h-4 w-4 mr-2" />
              {parseInt(hour) > 12 ? parseInt(hour) - 12 : hour}:00{" "}
              {parseInt(hour) >= 12 ? "PM" : "AM"}
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {hourSlots.map((slot) => {
                const isSelected = selectedSlots.includes(slot.id);
                const isSelectable = slot.isAvailable && !slot.capacityReached;

                const slotClass = cn(
                  "py-2 px-1 rounded-md text-xs sm:text-sm transition-all relative flex items-center justify-center",
                  isSelected && "bg-primary text-white",
                  !isSelected &&
                    isSelectable &&
                    "bg-[#F1F0FB] hover:bg-accent hover:text-accent-foreground border border-primary/20",
                  !isSelectable &&
                    "bg-[#F1F1F1] text-[#999] cursor-not-allowed border border-[#eee]"
                );

                return (
                  <button
                    key={slot.id}
                    onClick={() => isSelectable && handleSlotSelection(slot.id)}
                    disabled={!isSelectable}
                    className={slotClass}
                    title={
                      !slot.isAvailable
                        ? "Booked"
                        : slot.capacityReached
                        ? "No capacity left"
                        : "Available"
                    }
                  >
                    {formatTime(slot.time)}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    {!slot.isAvailable && (
                      <span className="absolute inset-0 flex items-center justify-center bg-[#aaadb0]/20 rounded-md">
                        <X className="h-3 w-3 text-[#999]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!slots.some((slot) => slot.isAvailable) && (
        <p className="text-error mt-2 text-sm">
          No available slots for this day.
        </p>
      )}
    </div>
  );
};

export default TimeSlotPicker;
