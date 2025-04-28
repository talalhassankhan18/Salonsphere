"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

interface GoogleUserData {
  email?: string;
  name?: string;
}

interface GoogleSignInButtonProps {
  onSuccess: (data: GoogleUserData) => void;
  className?: string;
}

export default function GoogleSignInButton({ 
  onSuccess, 
  className = "" 
}: GoogleSignInButtonProps) {
  
  const handleSignIn = async () => {
    try {
      const result = await signIn("google", { 
        redirect: false,
        callbackUrl: "/register/profile-setup"
      });

      if (result?.error) {
        console.error(result.error);
        throw new Error("Google login failed");
      }

      // In a real implementation, you would fetch the user data here
      // This is a placeholder - you'll need to implement actual user data fetching
      const mockUserData = {
        email: "user@example.com", // Replace with actual data from your auth flow
        name: "Google User"       // Replace with actual data from your auth flow
      };
      
      onSuccess(mockUserData);
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("An error occurred during Google login.");
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className={`flex items-center justify-center gap-3 bg-white border border-gray-300 p-3 rounded-full w-full hover:bg-gray-100 transition-all duration-200 ${className}`}
    >
      <div className="relative w-6 h-6">
        <Image 
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-gray-700 font-medium">Continue with Google</span>
    </button>
  );
}