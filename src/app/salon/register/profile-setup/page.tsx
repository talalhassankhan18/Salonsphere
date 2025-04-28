"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RegistrationStepper from "../../components/RegistrationStepper";
import LoadingSpinner from "@/common/LoadingSpinner";
import toast from "react-hot-toast";

interface FormData {
  description: string;
  logo: string;
  images: string[];
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<FormData>({
    description: "",
    logo: "",
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.email) {
      toast.error("Please sign in to continue.");
      router.push(`/Login?callbackUrl=${encodeURIComponent("./profile-setup")}`);
    } else {
      loadDraft(session.user.email);
    }
  }, [session, status, router]);

  const loadDraft = async (email: string) => {
    try {
      setIsDraftLoading(true);
      const response = await fetch("/api/draft/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "profile" }),
      });
      const data = await response.json();
      if (response.ok && data.draft) {
        setFormData((prev) => ({ ...prev, ...data.draft.data }));
        toast.success("Profile draft loaded successfully!");
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    } finally {
      setIsDraftLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!session?.user?.email) {
      toast.error("Please sign in to save draft");
      return;
    }
    try {
      setIsDraftLoading(true);
      const draftData = {
        description: formData.description,
        logo: formData.logo,
        images: formData.images, // Include images if already uploaded
      };
      const response = await fetch("/api/draft/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, type: "profile", data: draftData }),
      });
      if (response.ok) {
        toast.success("Profile draft saved successfully!");
      } else {
        throw new Error("Failed to save draft");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsLoading(true);
    const toastId = toast.loading("Uploading images...");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload images");
      }

      const newImages = data.imageUrls; // Expecting an array of URLs from the API
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast.success("Images uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload images", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      toast.error("Please wait, submission in progress...");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Saving profile...");

    try {
      if (!formData.description || !formData.logo || formData.images.length < 1) {
        throw new Error("Description, logo, and at least one image are required");
      }
      if (formData.description.length > 500) {
        throw new Error("Description must be 500 characters or less");
      }

      const response = await fetch("/api/register/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Please complete basic information first") {
          toast.error("Please complete basic information first.", { id: toastId });
          router.push("/register/basic-info");
          return;
        }
        throw new Error(data.error || "Failed to save profile");
      }

      toast.success("Profile saved successfully!", { id: toastId });
      router.push("./service-selection");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", color: "#333", marginBottom: "20px" }}>
        Complete Your Profile
      </h1>
      <RegistrationStepper currentStep="Profile-setup" />

      {isDraftLoading ? (
        <LoadingSpinner />
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>
              Description <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minHeight: "100px",
                fontSize: "16px",
              }}
              required
              maxLength={500}
            />
            <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              {formData.description.length}/500 characters
            </p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>
              Logo URL <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
              }}
              required
            />
            {formData.logo && (
              <img
                src={formData.logo}
                alt="Logo Preview"
                style={{ marginTop: "10px", width: "100px", height: "100px", objectFit: "cover" }}
                onError={() => toast.error("Invalid logo URL")}
              />
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>
              Images (minimum 1) <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ width: "100%", padding: "8px" }}
              disabled={isLoading}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {formData.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Image ${index}`}
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={saveDraft}
              disabled={isDraftLoading || isLoading}
              style={{
                background: "#666",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: isDraftLoading || isLoading ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              {isDraftLoading ? "Saving Draft..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: "#B4004E",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              {isLoading ? <LoadingSpinner /> : "Save Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}