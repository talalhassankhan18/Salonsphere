"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Scissors,
  ShoppingBag,
  Calendar,
  Star,
  Image,
  Images,
  BarChart,
  Package,
  DollarSign,
  Settings,
  ChevronLeft,
  LogOut,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  restrictedPlans: string[];
};

interface SalonDetails {
  name: string;
  email: string;
  plan?: {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    productLimit: number;
    features: string[];
    isActive: boolean;
    upgradedAt?: string;
  };
}

interface UpgradePlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  features: Record<string, boolean | string>;
}

const SidebarNavigation = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [salonDetails, setSalonDetails] = useState<SalonDetails | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [restrictedItem, setRestrictedItem] = useState<string | null>(null);

  // Fetch salon details
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchSalonDetails = async () => {
        try {
          const response = await fetch("/api/salon/details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          const data = await response.json();

          if (!response.ok || data.error) {
            throw new Error(data.error || "Failed to load salon details");
          }
          setSalonDetails(data);
        } catch (err: any) {
          console.error(
            "SidebarNavigation: Failed to fetch salon details:",
            err
          );
          toast.error("Failed to load profile details");
        }
      };
      fetchSalonDetails();
    }
  }, [status, session]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const toastId = toast.loading("Logging out...");
      await signOut({ redirect: false });
      toast.success("Logged out successfully", { id: toastId });
      window.location.href = "/salon/login";
    } catch (err: any) {
      toast.error("Failed to log out");
    }
  };

  const handleRestrictedClick = (itemTitle: string) => {
    setRestrictedItem(itemTitle);
    setShowUpgradePopup(true);
  };

  const handleUpgrade = (planName: string) => {
    setShowUpgradePopup(false);
    console.log("Emails - Session:", session?.user?.email, "SalonDetails:", salonDetails?.email);
    if (status !== "authenticated") {
      toast.error("Please log in to upgrade your plan.");
      window.location.href = `/salon/login?redirect=/salon/register/plan-selection?email=${encodeURIComponent(
        salonDetails?.email || ""
      )}&action=upgrade&selectedPlan=${planName}`;
      return;
    }
    window.location.href = `/salon/register/plan-selection?email=${encodeURIComponent(
      salonDetails?.email || ""
    )}&action=upgrade&selectedPlan=${planName}`;
  };

  const handleClosePopup = () => {
    setShowUpgradePopup(false);
    setRestrictedItem(null);
  };

  const commonFeatures = [
    "Product Listing",
    "Product Order Tracking",
    "Commission",
    "Online Appointment",
    "Analytics",
    "Advertisement Boost",
    "Social Media Integration",
    "Profile Customization",
    "Reminders",
    "Business Listing",
    "Priority Support",
    "Product Limit",
  ];

  const upgradePlans: UpgradePlan[] = [
    {
      name: "Starter",
      monthlyPrice: 300,
      yearlyPrice: 300 * 12 * 0.9,
      productLimit: 0,
      features: {
        "Online Appointment": true,
        "Social Media Integration": true,
        "Profile Customization": true,
        Reminders: true,
        "Business Listing": true,
        "Product Listing": false,
        "Product Order Tracking": false,
        Commission: false,
        Analytics: false,
        "Advertisement Boost": false,
        "Priority Support": false,
        "Product Limit": "0 products",
      },
    },
    {
      name: "Basic",
      monthlyPrice: 4199,
      yearlyPrice: 4199 * 12 * 0.9,
      productLimit: 100,
      features: {
        "Product Listing": true,
        "Product Order Tracking": true,
        Commission: true,
        "Online Appointment": true,
        "Social Media Integration": true,
        "Profile Customization": true,
        Reminders: true,
        "Business Listing": true,
        "Priority Support": false,
        Analytics: false,
        "Advertisement Boost": false,
        "Product Limit": "100 products",
      },
    },
    {
      name: "Premium",
      monthlyPrice: 8399,
      yearlyPrice: 8399 * 12 * 0.9,
      productLimit: 0, // Unlimited
      features: {
        "Product Listing": true,
        "Product Order Tracking": true,
        Commission: true,
        "Online Appointment": true,
        Analytics: true,
        "Advertisement Boost": true,
        "Social Media Integration": true,
        "Profile Customization": true,
        Reminders: true,
        "Business Listing": true,
        "Priority Support": true,
        "Product Limit": "Unlimited products",
      },
    },
  ];

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      path: "/salon/dashboard/pages/Dashboard",
      icon: <LayoutDashboard size={20} />,
      restrictedPlans: [],
    },
    {
      title: "Services",
      path: "/salon/dashboard/pages/Services",
      icon: <Scissors size={20} />,
      restrictedPlans: [],
    },
    {
      title: "Products",
      path: "/salon/dashboard/pages/Products",
      icon: <ShoppingBag size={20} />,
      restrictedPlans: ["Starter"],
    },
    {
      title: "Appointments",
      path: "/salon/dashboard/pages/Appointments",
      icon: <Calendar size={20} />,
      restrictedPlans: [],
    },
    {
      title: "Reviews",
      path: "/salon/dashboard/pages/Reviews",
      icon: <Star size={20} />,
      restrictedPlans: [],
    },
    {
      title: "Portfolio",
      path: "/salon/dashboard/pages/Portfolio",
      icon: <Image size={20} />,
      restrictedPlans: [],
    },
    {
      title: "Gallery",
      path: "/salon/dashboard/pages/Gallery",
      icon: <Images size={20} />,
      restrictedPlans: [],
    },
    {
      title: "Analytics",
      path: "/salon/dashboard/pages/Analytics",
      icon: <BarChart size={20} />,
      restrictedPlans: ["Starter", "Basic"],
    },
    {
      title: "Orders",
      path: "/salon/dashboard/pages/Orders",
      icon: <Package size={20} />,
      restrictedPlans: ["Starter"],
    },
    {
      title: "Commission",
      path: "/salon/dashboard/pages/Commission",
      icon: <DollarSign size={20} />,
      restrictedPlans: ["Starter"],
    },
    {
      title: "Settings",
      path: "/salon/dashboard/pages/Settings",
      icon: <Settings size={20} />,
      restrictedPlans: [],
    },
  ];

  if (typeof window === "undefined" || status === "loading") {
    return null;
  }

  // Filter upgrade plans based on current plan
  const validUpgrades: Record<string, string[]> = {
    Starter: ["Basic", "Premium"],
    Basic: ["Premium"],
    Premium: [],
  };
  const currentPlanName = salonDetails?.plan?.name || "Starter";
  console.log("Current plan name:", currentPlanName);

  const availablePlans = upgradePlans.filter((plan) =>
    validUpgrades[currentPlanName]?.includes(plan.name) ?? false
  );

  // Determine restricted features for the current plan
  const currentPlanFeatures = salonDetails?.plan?.features || [];
  const isFeatureRestricted = (feature: string) => {
    if (feature === "Product Limit") return false;
    return !currentPlanFeatures.includes(feature);
  };

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0 md:w-16"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {isOpen ? (
            <Link
              href="/salon/dashboard"
              className="flex items-center space-x-2"
            >
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-pink-400">
                SalonSphere
              </span>
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <Link href="/salon/dashboard" className="text-pink-600 font-bold">
                S
              </Link>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors md:flex hidden"
          >
            <ChevronLeft
              size={18}
              className={cn(
                "text-gray-500 transition-transform",
                !isOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const isRestricted =
                salonDetails?.plan?.name &&
                item.restrictedPlans.includes(salonDetails.plan.name);

              return (
                <li key={item.path}>
                  <Link
                    href={isRestricted ? "#" : item.path}
                    onClick={
                      isRestricted
                        ? (e) => {
                            e.preventDefault();
                            handleRestrictedClick(item.title);
                          }
                        : undefined
                    }
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg transition-all group",
                      isActive
                        ? "bg-pink-50 text-pink-600"
                        : "text-gray-700 hover:bg-gray-100",
                      isRestricted && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <span className="flex items-center justify-center">
                      {item.icon}
                      {isRestricted && (
                        <Lock size={14} className="ml-1 text-gray-500" />
                      )}
                    </span>
                    {isOpen && (
                      <span className="ml-3 font-medium text-sm">
                        {item.title}
                      </span>
                    )}
                    {!isOpen && (
                      <span className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity invisible md:visible z-50">
                        {item.title}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          {isOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 font-medium">
                  {salonDetails?.name
                    ? salonDetails.name[0].toUpperCase()
                    : "SA"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {salonDetails?.name || "Salon Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {salonDetails?.email || "admin@salon.com"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 font-medium">
                  {salonDetails?.name
                    ? salonDetails.name[0].toUpperCase()
                    : "SA"}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "mt-4 flex items-center justify-center w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg py-2 transition-colors",
              isOpen ? "px-3" : "px-0"
            )}
          >
            <LogOut size={18} />
            {isOpen && <span className="ml-2 text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {showUpgradePopup && availablePlans.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-white to-gray-100 p-6 rounded-xl shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-extrabold text-[#B4004E] mb-4 text-center">
              Upgrade Your Plan
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              The "{restrictedItem}" feature is not available in your current
              plan ({salonDetails?.plan?.name || "Starter"}). Upgrade to
              access this feature.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availablePlans.map((plan) => {
                const displayPrice = plan.monthlyPrice;
                return (
                  <div
                    key={plan.name}
                    className={`relative border rounded-xl p-6 transition-all duration-300 transform bg-white shadow-md flex flex-col justify-between hover:shadow-lg hover:scale-[1.02] ${
                      plan.name === "Basic"
                        ? "border-gray-300"
                        : "border-gray-300"
                    }`}
                  >
                    {plan.name === "Basic" && (
                      <span className="absolute top-3 right-3 bg-[#B4004E] text-white px-2 py-1 rounded-md text-xs font-semibold">
                        Most Popular
                      </span>
                    )}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-800">
                        {plan.name}
                      </h3>
                      <p className="text-base font-bold text-[#B4004E] mt-1">
                        ₨{displayPrice} /month
                      </p>
                      <p className="text-xs text-gray-500">
                        Yearly: ₨{plan.yearlyPrice} (Save 10%)
                      </p>
                      <p className="text-xs text-[#B4004E] mt-1">
                        {plan.features["Priority Support"]
                          ? "Priority Support"
                          : "Email Support"}
                      </p>
                      <ul className="mt-4 space-y-2 text-xs flex-grow min-h-[200px]">
                        {commonFeatures.map((feature) => (
                          <li key={feature} className="flex items-start">
                            {feature === "Product Limit" ? (
                              <span className="font-semibold text-[#B4004E]">
                                {plan.features[feature] as string}
                              </span>
                            ) : plan.features[feature] === true ? (
                              <>
                                <CheckCircle className="text-green-500 w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="text-red-500 w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400">{feature}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => handleUpgrade(plan.name)}
                        className="w-full py-2.5 rounded-md font-semibold text-xs bg-[#B4004E] text-white hover:bg-[#9a0042] transition-all duration-300"
                      >
                        Upgrade to {plan.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleClosePopup}
              className="mt-6 w-full bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarNavigation;