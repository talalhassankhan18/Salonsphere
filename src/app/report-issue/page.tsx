"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Logo from "@/assets/images/logo.png"; // Ensure this path is correct
import { IoClose } from "react-icons/io5"; // Import the close icon from react-icons

const ReportIssuePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [issue, setIssue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          issue,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit issue");
      alert("Issue reported successfully!");
      setIssue("");
      router.push("/"); // Redirect to homepage after success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/"); // Redirect to homepage or previous page on close
  };

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      {/* Form Container as a Popup */}
      <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <IoClose size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <img src={Logo.src} alt="logo" className="h-12" />
        </div>
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Report an Issue
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Your Issue
            </label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              placeholder="Please describe the issue you're facing..."
              rows={5}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !issue}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50 transition-colors duration-200"
            style={{ backgroundColor: "#B4004E" }}
          >
            {isLoading ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssuePage;
