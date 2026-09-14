import AboutSalon from "./components/about-salon";
import RecommendedProducts from "./components/recommended-products";
import SalonsNearby from "./components/salons-nearby";
import Hero from "./components/hero";
import SalonServices from "./components/salon-services";
import Portfolio from "./components/Portfolio";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

interface Params {
  id: string; // Represents salonName, not _id
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

interface SalonDetails {
  _id: string;
  salonName: string;
  address: string;
  salonType: "female" | "male" | "unisex";
  avatar: string;
  email: string;
  name: string;
  phone: string;
  ratings?: number;
  scheduling: Scheduling;
}

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;
  const decodedSalonName = decodeURIComponent(id); // Decode URL-encoded salonName
  console.log("[salons] decoded salonName: ", decodedSalonName);

  let salon: SalonDetails | null = null;
  let connectionError: string | null = null;

  try {
    await dbConnect();

    const salonDoc = await Salon.findOne({
      salonName: decodedSalonName,
      // Removed isVerified and paymentStatus for broader matching
    })
      .select(
        "salonName address salonType avatar email name phone _id ratings scheduling"
      )
      .lean();

    if (salonDoc) {
      salon = {
        _id: salonDoc._id.toString(),
        salonName: salonDoc.salonName || "Unknown Salon",
        address: salonDoc.address || "No address provided",
        salonType: salonDoc.salonType || "unisex",
        avatar: salonDoc.avatar || "/default-salon-image.jpg",
        email: salonDoc.email || "No email provided",
        name: salonDoc.name || "Unknown Owner",
        phone: salonDoc.phone || "No phone provided",
        ratings: salonDoc.ratings ?? 0,
        scheduling: salonDoc.scheduling
          ? JSON.parse(JSON.stringify(salonDoc.scheduling))
          : {
              businessHours: [
                {
                  day: "Monday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
                {
                  day: "Tuesday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
                {
                  day: "Wednesday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
                {
                  day: "Thursday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
                {
                  day: "Friday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
                {
                  day: "Saturday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
                {
                  day: "Sunday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
              ],
              appointmentBuffer: 15,
              allowOnlineBooking: true,
              requireConfirmation: false,
            },
      };
      console.log("Salon data size:", JSON.stringify(salon).length);
      console.log("Salon scheduling data:", salon.scheduling);
    } else {
      console.warn(`Salon with salonName "${decodedSalonName}" not found`);
    }
  } catch (error: any) {
    console.error(
      `Error fetching salon with salonName "${decodedSalonName}":`,
      error.message,
      error.stack
    );
    connectionError =
      "Failed to connect to the database or invalid salon name. Please try again later.";
  }

  if (connectionError) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Server Error</h1>
        <p className="text-gray-600">{connectionError}</p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Salon Not Found</h1>
        <p className="text-gray-600">
          The salon with name "{decodedSalonName}" could not be found.
        </p>
      </div>
    );
  }

  return (
    <>
      <Hero
        salonId={salon._id}
        SalonName={salon.salonName}
        ratings={salon.ratings ?? 0}
        address={salon.address}
        scheduling={salon.scheduling}
      />
      <SalonServices salonId={salon._id} />
      <Portfolio salonId={salon._id} />
      <AboutSalon salon={salon} />
      <RecommendedProducts salonId={salon._id} />
      <SalonsNearby currentSalonAddress={salon.address} />
    </>
  );
};

export default Page;
