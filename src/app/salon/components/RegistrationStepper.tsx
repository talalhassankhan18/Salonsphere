// src/components/RegistrationStepper.tsx
import Link from "next/link";

interface RegistrationStepperProps {
  currentStep: string;
}

const steps = [
  { name: "Basic Info", path: "/salon/register/basic-info" },
  { name: "Verification", path: "/salon/register/verification" },
  { name: "Plan Selection", path: "/salon/register/plan-selection" },
  { name: "Payment", path: "/salon/register/payment" },
];

export default function RegistrationStepper({
  currentStep,
}: RegistrationStepperProps) {
  const currentStepIndex = steps.findIndex((s) => s.name === currentStep);

  return (
    <nav
      aria-label="Registration Progress"
      className="mb-8 px-4 sm:px-6 lg:px-8"
    >
      <ol className="flex flex-col sm:flex-row justify-between items-center relative py-6 space-y-6 sm:space-y-0 sm:space-x-4">
        {steps.map((step, index) => {
          const isActive = step.name === currentStep;
          const isCompleted = currentStepIndex > index;
          const isNextActive =
            index < steps.length - 1 && steps[index + 1].name === currentStep;

          return (
            <li
              key={step.name}
              className="flex-1 flex flex-col items-center relative z-10 group w-full sm:w-auto"
              aria-current={isActive ? "step" : undefined}
            >
              {/* Step Circle */}
              <Link
                href={step.path}
                aria-label={`Go to ${step.name} step`}
                className={`
                  relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm font-semibold
                  transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E]
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#B4004E] to-[#D81B60] text-white shadow-lg shadow-[#B4004E]/50"
                      : isCompleted
                      ? "bg-green-600 text-white shadow-md shadow-green-500/50"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
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
                <span
                  className="
                    absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-800 bg-white
                    px-3 py-1.5 rounded-lg shadow-lg border border-gray-200
                    opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300
                    whitespace-nowrap pointer-events-none
                  "
                >
                  {step.name}
                </span>
              </Link>

              {/* Step Label */}
              <span
                className={`
                  mt-3 text-xs sm:text-sm font-medium text-center transition-colors duration-300
                  ${
                    isActive
                      ? "text-[#B4004E]"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                `}
              >
                {step.name}
              </span>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    absolute top-5 sm:top-6 left-1/2 sm:right-0 w-1/2 sm:w-full h-1 sm:h-1.5
                    transform sm:translate-x-1/2 transition-all duration-300
                    ${
                      isCompleted || isActive || isNextActive
                        ? "bg-gradient-to-r from-[#B4004E] to-[#D81B60]"
                        : "bg-gray-200"
                    }
                    ${index === 0 ? "sm:ml-[50%]" : ""}
                    ${index === steps.length - 2 ? "sm:mr-[50%]" : ""}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
