"use client";

import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  required: boolean;
}

interface OnboardingProgressProps {
  steps: Step[];
  currentStep: number;
}

export function OnboardingProgress({
  steps,
  currentStep,
}: OnboardingProgressProps) {
  // Calculate the transform offset to keep current step centered
  const stepWidth = 120; // minWidth of each step container
  const connectorWidth = 100; // 60px line + 40px margins
  const totalStepWidth = stepWidth + connectorWidth;

  // Calculate offset to center the current step
  const containerWidth = 600; // Approximate visible width
  const offset = Math.max(
    0,
    currentStep * totalStepWidth - containerWidth / 2 + stepWidth / 2
  );

  return (
    <div className="mx-auto mb-8 w-full max-w-4xl">
      <div className="overflow-hidden">
        <div
          className="flex items-center transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${offset}px)`,
            width: `${steps.length * totalStepWidth}px`,
          }}
        >
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle and Title Container */}
              <div
                className="flex flex-col items-center"
                style={{ minWidth: "120px" }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    height: "48px",
                    width: "48px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    border: "3px solid",
                    borderColor:
                      index < currentStep
                        ? "#2f3044"
                        : index === currentStep
                        ? "#2f3044"
                        : "#d1d5db",
                    backgroundColor:
                      index < currentStep
                        ? "#2f3044"
                        : index === currentStep
                        ? "#ffffff"
                        : "#f3f4f6",
                    color:
                      index < currentStep
                        ? "#ffffff"
                        : index === currentStep
                        ? "#2f3044"
                        : "#9ca3af",
                    fontWeight: "700",
                    fontSize: "18px",
                    lineHeight: "1",
                    transition: "all 0.3s",
                    boxSizing: "border-box",
                    flexShrink: 0,
                  }}
                >
                  {index < currentStep ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Check
                        style={{
                          width: "20px",
                          height: "20px",
                          strokeWidth: "3px",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <span
                        style={{
                          lineHeight: "1",
                          textAlign: "center",
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step Title */}
                <div className="mt-2 text-center" style={{ width: "100%" }}>
                  <p
                    style={{
                      fontWeight: "600",
                      fontSize: "12px",
                      color: index <= currentStep ? "#2f3044" : "#9ca3af",
                      transition: "color 0.3s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: "60px",
                    height: "3px",
                    backgroundColor:
                      index < currentStep ? "#2f3044" : "#d1d5db",
                    transition: "background-color 0.3s",
                    borderRadius: "2px",
                    margin: "0 20px",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
