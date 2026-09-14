import React from "react";
import { format } from "date-fns"; // Import format
import { Button } from "@/app/Booking/components/ui/button";
import { Clock } from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  capacityReached: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlots: string[]; // Array of selected slot startTimes
  onSelectSlot: (slotId: string) => void;
  requiredSlots: number;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlots,
  onSelectSlot,
  requiredSlots,
}) => {
  // Function to determine if a slot can be the start of a consecutive sequence
  const canStartConsecutiveSequence = (startIndex: number): boolean => {
    if (startIndex + requiredSlots > slots.length) {
      return false; // Not enough slots remaining
    }

    // Check if the next 'requiredSlots' slots are available and consecutive
    for (let i = 0; i < requiredSlots; i++) {
      const slot = slots[startIndex + i];
      if (!slot || !slot.isAvailable || slot.capacityReached) {
        return false;
      }
    }

    return true;
  };

  // Function to check if a slot is part of the selected sequence
  const isSlotInSelectedSequence = (slot: TimeSlot): boolean => {
    if (!selectedSlots.length) return false;

    const slotTime = slot.time;
    return selectedSlots.some((selectedTime) => {
      const selectedDate = new Date(selectedTime);
      return format(selectedDate, "h:mm a") === slotTime;
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {slots.map((slot, index) => {
          const isSelected = isSlotInSelectedSequence(slot);
          const canSelect =
            slot.isAvailable && canStartConsecutiveSequence(index);

          return (
            <Button
              key={slot.id}
              onClick={() => canSelect && onSelectSlot(slot.id)}
              disabled={!canSelect}
              variant={isSelected ? "default" : "outline"}
              className={`w-full justify-start text-sm py-2 px-3 rounded-lg transition-colors
                ${isSelected ? "bg-primary text-white" : ""}
                ${
                  !canSelect
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/10"
                }`}
            >
              <Clock size={14} className="mr-2" />
              {slot.time}
            </Button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {selectedSlots.length} of {requiredSlots} slots selected
      </p>
    </div>
  );
};

export default TimeSlotPicker;
