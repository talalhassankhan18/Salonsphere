"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function CustomerSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("customer-credentials-login", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
      authApi: "/api/auth/customer", // Specify customer auth API
    });
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", {
      callbackUrl: "/",
      authApi: "/api/auth/customer",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 font-poppins">
          Customer Sign-in
        </h1>
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Email/Password Sign-in Form */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="worn"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Sign in with Email
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-white text-gray-800 font-semibold rounded-lg border border-gray-300 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FcGoogle className="text-xl" />
          Sign in with Google
        </button>

        {/* Register Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
