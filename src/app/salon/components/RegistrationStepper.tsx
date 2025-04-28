import Link from "next/link";

interface RegistrationStepperProps {
  currentStep: string;
}

const steps = [
  { name: "Basic Info", path: "/salon/register/basic-info" },
  { name: "Verification", path: "/salon/register/verification" },
  { name: "Plan Selection", path: "/salon/register/PlanSelection" },
  { name: "Payment", path: "/salon/register/payment" },
];

export default function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center relative px-4 sm:px-8 py-6">
        {steps.map((step, index) => {
          const isActive = step.name === currentStep;
          const isCompleted = steps.findIndex((s) => s.name === currentStep) > index;
          const isNextActive = index < steps.length - 1 && steps[index + 1].name === currentStep;

          return (
            <div key={step.name} className="flex-1 flex flex-col items-center relative z-10 group">
              {/* Step Circle */}
              <Link
                href={step.path}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-110
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#B4004E] to-[#D81B60] text-white shadow-lg shadow-[#B4004E]/40 animate-pulse"
                      : isCompleted
                      ? "bg-green-500 text-white shadow-md shadow-green-400/50"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}

                {/* Tooltip */}
                <span className="absolute top-14 left-1/2 -translate-x-1/2 text-xs text-gray-800 bg-white px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {step.name}
                </span>
              </Link>

              {/* Step Label */}
              <span
                className={`mt-3 text-xs font-semibold transition-colors duration-300 ${
                  isActive
                    ? "text-[#B4004E]"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {step.name}
              </span>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 right-0 w-full h-1 transform translate-x-1/2 transition-all duration-300
                    ${
                      isCompleted || isActive || isNextActive
                        ? "bg-gradient-to-r from-[#B4004E] to-[#D81B60]"
                        : "bg-gray-200"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
