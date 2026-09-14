import mongoose from "mongoose";
import {
  startOfDay,
  endOfDay,
  addMinutes,
  parse,
  format,
} from "date-fns";
import TimeSlot from "@/mongoose-models/TimeSlot";
import Salon from "@/mongoose-models/Salon";
import Booking from "@/mongoose-models/Booking";

interface TimeSlot {
  _id: string;
  salon: string;
  startTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function generateTimeSlots(
  salonId: string,
  date: Date
): Promise<TimeSlot[]> {
  try {
    const salon = await Salon.findById(salonId).select("scheduling").lean();
    if (!salon) {
      throw new Error("Salon not found");
    }

    const slotDuration = salon.scheduling?.appointmentBuffer || 15;
    const businessHours = salon.scheduling?.businessHours || [];
    const dayOfWeek = format(date, "EEEE");

    const daySchedule = businessHours.find(
      (hour: any) => hour.day === dayOfWeek
    );
    if (
      !daySchedule ||
      !daySchedule.isOpen ||
      !daySchedule.openTime ||
      !daySchedule.closeTime
    ) {
      console.log(`Salon is closed on ${dayOfWeek}`);
      return [];
    }

    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);

    const openTime = parse(daySchedule.openTime, "h:mm a", date);
    const closeTime = parse(daySchedule.closeTime, "h:mm a", date);

    const existingSlots = await TimeSlot.find({
      salon: salonId,
      startTime: {
        $gte: startOfDayDate,
        $lte: endOfDayDate,
      },
    }).lean();

    const bookings = await Booking.find({
      salon: salonId,
      startTime: {
        $gte: startOfDayDate,
        $lte: endOfDayDate,
      },
      status: { $ne: "cancelled" },
    }).lean();

    const slots: TimeSlot[] = [];
    let currentTime = openTime;

    while (currentTime < closeTime) {
      const slotStartTime = new Date(currentTime);
      const existingSlot = existingSlots.find(
        (slot) => new Date(slot.startTime).getTime() === slotStartTime.getTime()
      );

      if (existingSlot) {
        slots.push({
          _id: existingSlot._id.toString(),
          salon: existingSlot.salon.toString(),
          startTime: existingSlot.startTime.toISOString(),
          isAvailable: existingSlot.isAvailable,
          createdAt: existingSlot.createdAt.toISOString(),
          updatedAt: existingSlot.updatedAt.toISOString(),
        });
      } else {
        const isBooked = bookings.some((booking) => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = addMinutes(bookingStart, booking.duration);
          return slotStartTime >= bookingStart && slotStartTime < bookingEnd;
        });

        const newSlot = await TimeSlot.create({
          salon: new mongoose.Types.ObjectId(salonId),
          startTime: slotStartTime,
          isAvailable: !isBooked,
        });

        slots.push({
          _id: newSlot._id.toString(),
          salon: newSlot.salon.toString(),
          startTime: newSlot.startTime.toISOString(),
          isAvailable: newSlot.isAvailable,
          createdAt: newSlot.createdAt.toISOString(),
          updatedAt: newSlot.updatedAt.toISOString(),
        });
      }

      currentTime = addMinutes(currentTime, slotDuration);
    }

    return slots;
  } catch (error: any) {
    console.error(`Error generating time slots: ${error.message}`);
    throw error;
  }
}
