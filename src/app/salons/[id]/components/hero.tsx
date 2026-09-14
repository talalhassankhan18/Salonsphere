"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MdOutlineIosShare } from "react-icons/md";
import { BsFillCircleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/salon/dashboard/components/ui/card";
import { Clock, Calendar, CheckCircle } from "lucide-react";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface GalleryImage {
  _id: string;
  salon: string;
  imageUrl: string;
  caption?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

interface Scheduling {
  businessHours: BusinessHour[];
  appointmentBuffer: number;
  allowOnlineBooking: boolean;
  requireConfirmation: boolean;
}

interface Props {
  salonId: string;
  SalonName?: string;
  ratings?: number;
  address: string;
  scheduling?: Scheduling;
}

const SalonProfileHero: React.FC<Props> = ({
  salonId,
  SalonName,
  ratings,
  address,
  scheduling,
}) => {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery images for the salon
  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        setLoading(true);
        console.log(`Fetching gallery images for salonId: ${salonId}`);
        const response = await fetch(`/api/gallery?salonId=${salonId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch gallery images");
        }
        const galleryData: GalleryImage[] = await response.json();
        const imageUrls = galleryData
          .filter((img) => img.isActive && typeof img.imageUrl === "string")
          .map((img) => img.imageUrl);
        setGalleryImages(imageUrls);
      } catch (err: any) {
        console.error("Error fetching gallery images:", err);
        setError(err.message || "Failed to load gallery images");
      } finally {
        setLoading(false);
      }
    }

    if (salonId) {
      fetchGalleryImages();
    } else {
      setError("Salon ID is required");
      setLoading(false);
    }
  }, [salonId]);

  // Placeholder image
  const placeholderImage =
    "https://via.placeholder.com/800x400?text=No+Image+Available";
  const _srcs = galleryImages.length > 0 ? galleryImages : [placeholderImage];

  // Safe address handling
  const safeAddress =
    address && typeof address === "string" ? address : "Not provided";

  // Generate Google Maps URL
  const locationUrl =
    safeAddress !== "Not provided"
      ? `https://www.google.com/maps/search/${encodeURIComponent(safeAddress)}`
      : "https://www.google.com/maps/search/Karachi,+Pakistan";
  console.log("Address data:", safeAddress);

  // Default star count for ratings
  const starCount = ratings ?? 5;

  // Group business hours for display
  const groupedHours = scheduling?.businessHours?.length
    ? (() => {
        if (scheduling.businessHours.length > 100) {
          console.warn("Excessive businessHours entries, truncating");
          return [{ days: "Mon-Sun", hours: "Data too large, contact salon" }];
        }
        const groups: {
          days: string[];
          openTime: string | null;
          closeTime: string | null;
          isOpen: boolean;
        }[] = [];
        let currentGroup: {
          days: string[];
          openTime: string | null;
          closeTime: string | null;
          isOpen: boolean;
        } | null = null;

        scheduling.businessHours.forEach((hour, index) => {
          if (!hour || typeof hour.isOpen !== "boolean") {
            console.warn("Invalid business hour:", hour);
            return;
          }
          if (
            !currentGroup ||
            currentGroup.isOpen !== hour.isOpen ||
            (hour.isOpen &&
              (currentGroup.openTime !== hour.openTime ||
                currentGroup.closeTime !== hour.closeTime))
          ) {
            if (currentGroup) {
              groups.push(currentGroup);
            }
            currentGroup = {
              days: [hour.day || "Unknown"],
              isOpen: hour.isOpen,
              openTime: hour.openTime,
              closeTime: hour.closeTime,
            };
          } else {
            currentGroup.days.push(hour.day || "Unknown");
          }

          if (index === scheduling.businessHours.length - 1 && currentGroup) {
            groups.push(currentGroup);
          }
        });

        return groups.map((group) => ({
          days:
            group.days.length > 1
              ? `${group.days[0]}-${group.days[group.days.length - 1]}`
              : group.days[0],
          hours: group.isOpen
            ? `${group.openTime || "N/A"} - ${group.closeTime || "N/A"}`
            : "Closed",
        }));
      })()
    : [
        {
          days: "N/A",
          hours: "Business hours not configured",
        },
      ];

  // Set error if business hours are missing or invalid
  useEffect(() => {
    if (!scheduling?.businessHours?.length) {
      console.warn(`No business hours found for salon ${salonId}`);
      setError(
        (prev) => prev || "Business hours not configured for this salon"
      );
    }
  }, [scheduling, salonId]);

  return (
    <div className="mb-6 w-full md:mb-8">
      <div className="flex flex-col mt-4">
        <div className="flex justify-between items-center">
          <div className="prose lg:prose-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {SalonName || "Glimmer's Saloon"}
            </h2>
          </div>
          <div>
            <MdOutlineIosShare
              size={30}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-row items-center mb-3 flex-wrap gap-2 text-sm md:text-base">
          <p className="mr-1 font-semibold">{ratings?.toFixed(1) || "5.0"}</p>
          <div className="flex flex-row mr-1">
            {Array.from({ length: starCount }, (_, index) => (
              <FaStar key={index} className="p-0 m-0 text-yellow-400" />
            ))}
          </div>
          <BsFillCircleFill className="mx-3 text-gray-400" size={10} />
          <Link
            href={locationUrl}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {safeAddress !== "Not provided"
              ? safeAddress
              : "Location not available"}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 font-medium">Loading gallery images...</p>
          <div className="mt-4 h-64 w-full bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : (
        <>
          {_srcs.length === 1 && _srcs[0] === placeholderImage ? (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <p className="text-gray-600 font-medium">
                No gallery images available
              </p>
              <img
                src={placeholderImage}
                className="w-full h-64 object-cover rounded-lg mx-auto max-w-[800px] mt-4"
                alt="No gallery images"
              />
            </div>
          ) : (
            <>
              <div className="md:hidden">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={20}
                  loop={_srcs.length > 1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  className="rounded-lg"
                >
                  {_srcs.map((src, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative">
                        <img
                          src={src}
                          className="w-full h-64 object-cover rounded-lg"
                          alt={`Gallery image ${index + 1}`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300"></div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <div className="relative group">
                    <img
                      src={_srcs[0]}
                      className="w-full h-96 object-cover rounded-lg shadow-md"
                      alt="Main gallery image"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                </div>
                <div className="col-span-4 grid grid-rows-2 gap-4">
                  {_srcs.slice(1, 3).map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        className="w-full h-44 object-cover rounded-lg shadow-md"
                        alt={`Small gallery image ${index + 1}`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"></div>
                    </div>
                  ))}
                  {_srcs.length < 3 &&
                    Array.from({ length: 3 - _srcs.length }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="relative group"
                      >
                        <img
                          src={placeholderImage}
                          className="w-full h-44 object-cover rounded-lg shadow-md opacity-50"
                          alt="Placeholder image"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"></div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-6">
            <Card className="shadow-lg rounded-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {groupedHours.map((group, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <span className="text-sm text-gray-700">
                          {group.days}
                        </span>
                        <span
                          className={`text-sm ${
                            group.hours === "Closed"
                              ? "text-red-500 font-medium"
                              : "text-green-600 font-medium"
                          }`}
                        >
                          {group.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {scheduling && (
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                    <p className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Online Booking Available
                    </p>
                    <p className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Walkin Bookings Available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default SalonProfileHero;
