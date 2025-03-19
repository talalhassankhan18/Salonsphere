"use client";

import React, { useState } from "react";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaPaypal, FaGooglePay, FaLock } from "react-icons/fa";
import { SiAlipay } from "react-icons/si";

const PaymentForm = () => {
  const [activeTab, setActiveTab] = useState("card");

  const handleTabClick = (method: string) => {
    setActiveTab(method === activeTab ? "" : method);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="border border-purple-300 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
        Payment
      </h2>

      <p className="text-sm text-gray-600 mb-4">Instant pay:</p>

      {/* CARD PAYMENT */}
      <div className="border rounded-md mb-4">
        <button
          onClick={() => handleTabClick("card")}
          className="flex justify-between w-full items-center px-4 py-3 text-left hover:bg-gray-50"
        >
          <span className="font-medium">Card</span>
          <div className="flex gap-2 text-xl text-gray-500">
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcAmex />
            <FaCcDiscover />
          </div>
        </button>

        {activeTab === "card" && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name on card"
                className="border rounded-md px-4 py-2 w-full focus:outline-purple-500"
              />
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="border rounded-md px-4 py-2 w-full focus:outline-purple-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="MM / YY"
                className="border rounded-md px-4 py-2 w-full focus:outline-purple-500"
              />
              <input
                type="text"
                placeholder="CVC / CVV"
                className="border rounded-md px-4 py-2 w-full focus:outline-purple-500"
              />
            </div>
            <button className="px-6 py-3 bg-primary w-full text-primary-content font-medium rounded-md hover:bg-primary/90 transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Submit payment
            </button>

            <div className="flex items-center text-xs text-gray-500 mt-3">
              <FaLock className="mr-2" /> Encrypted and secure payments
            </div>

            <p className="text-xs text-gray-500 mt-3">
              By checking out you agree with our{" "}
              <a href="#" className="underline font-medium">
                Terms of Service
              </a>{" "}
              and confirm that you have read our{" "}
              <a href="#" className="underline font-medium">
                Privacy Policy
              </a>
              . You can cancel recurring payments at any time.
            </p>
          </div>
        )}
      </div>

      {/* PAYPAL PAYMENT */}
      <div className="border rounded-md mb-4">
        <button
          onClick={() => handleTabClick("paypal")}
          className="flex justify-between w-full items-center px-4 py-3 text-left hover:bg-gray-50"
        >
          <span className="font-medium">PayPal</span>
          <FaPaypal className="text-2xl text-blue-600" />
        </button>

        {activeTab === "paypal" && (
          <div className="p-4 border-t">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-md w-full flex items-center justify-center gap-2">
              <FaPaypal className="text-blue-700 text-lg" />
              PayPal Checkout
            </button>

            <div className="flex items-center text-xs text-gray-500 mt-3">
              <FaLock className="mr-2" /> Encrypted and secure payments
            </div>

            <p className="text-xs text-gray-500 mt-3">
              By checking out you agree with our{" "}
              <a href="#" className="underline font-medium">
                Terms of Service
              </a>{" "}
              and confirm that you have read our{" "}
              <a href="#" className="underline font-medium">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* GOOGLE PAY */}
      <div className="border rounded-md mb-4">
        <button
          onClick={() => handleTabClick("googlepay")}
          className="flex justify-between w-full items-center px-4 py-3 text-left hover:bg-gray-50"
        >
          <span className="font-medium">Google Pay</span>
          <FaGooglePay className="text-2xl" />
        </button>

        {activeTab === "googlepay" && (
          <div className="p-4 border-t">
            <button className="bg-black text-white py-2 px-4 rounded-md w-full flex items-center justify-center gap-2">
              <FaGooglePay className="text-white text-lg" />
              Buy with Google Pay
            </button>

            <div className="flex items-center text-xs text-gray-500 mt-3">
              <FaLock className="mr-2" /> Encrypted and secure payments
            </div>

            <p className="text-xs text-gray-500 mt-3">
              By checking out you agree with our{" "}
              <a href="#" className="underline font-medium">
                Terms of Service
              </a>{" "}
              and confirm that you have read our{" "}
              <a href="#" className="underline font-medium">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* ALIPAY PAYMENT */}
      <div className="border rounded-md mb-4">
        <button
          onClick={() => handleTabClick("alipay")}
          className="flex justify-between w-full items-center px-4 py-3 text-left hover:bg-gray-50"
        >
          <span className="font-medium">AliPay</span>
          <SiAlipay className="text-2xl text-blue-600" />
        </button>

        {activeTab === "alipay" && (
          <div className="p-4 border-t">
            <button className="px-6 py-3 bg-primary w-full text-primary-content font-medium rounded-md hover:bg-primary/90 transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Submit payment
            </button>

            <div className="flex items-center text-xs text-gray-500 mt-3">
              <FaLock className="mr-2" /> Encrypted and secure payments
            </div>

            <p className="text-xs text-gray-500 mt-3">
              By checking out you agree with our{" "}
              <a href="#" className="underline font-medium">
                Terms of Service
              </a>{" "}
              and confirm that you have read our{" "}
              <a href="#" className="underline font-medium">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
