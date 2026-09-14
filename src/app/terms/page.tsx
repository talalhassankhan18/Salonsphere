import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Terms of Service
        </h1>
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="mt-2 text-sm">
              By accessing or using SalonSphere, you agree to be bound by these
              Terms of Service and our Privacy Policy.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. User Responsibilities</h2>
            <div className="mt-2 text-sm">
              <p>You are responsible for:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Providing accurate and complete information during registration.</li>
                <li>Maintaining the confidentiality of your account credentials.</li>
                <li>Ensuring your salon information is up-to-date.</li>
              </ul>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. Prohibited Activities</h2>
            <div className="mt-2 text-sm">
              <p>You may not:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Use SalonSphere for any illegal or unauthorized purpose.</li>
                <li>Attempt to hack or disrupt the platform.</li>
                <li>Share your account with others.</li>
              </ul>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Contact Us</h2>
            <p className="mt-2 text-sm">
              If you have any questions, please contact us at{" "}
              <a
                href="mailto:support@salonsphere.com"
                className="text-blue-600 hover:text-blue-800"
              >
                support@salonsphere.com
              </a>
              .
            </p>
          </section>
          <p className="text-center text-sm">
            Back to{" "}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-800">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}