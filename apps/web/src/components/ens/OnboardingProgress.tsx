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

export function OnboardingProgress({ steps, currentStep }: OnboardingProgressProps) {
	return (
		<div className="w-full max-w-4xl mx-auto mb-8">
			<div className="flex items-center justify-between">
				{steps.map((step, index) => (
					<div key={step.id} className="flex items-center flex-1">
						{/* Step Circle */}
						<div className="flex flex-col items-center">
							<div
								className={`
									relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium text-sm transition-all duration-300
									${
										index < currentStep
											? "border-blue-500 bg-blue-500 text-white"
											: index === currentStep
												? "border-blue-500 bg-white text-blue-500"
												: "border-gray-300 bg-gray-100 text-gray-400"
									}
								`}
							>
								{index < currentStep ? (
									<Check className="h-5 w-5" />
								) : (
									<span>{index + 1}</span>
								)}
							</div>
							
							{/* Step Title */}
							<div className="mt-2 text-center">
								<p
									className={`
										font-medium text-sm transition-colors duration-300
										${
											index <= currentStep
												? "text-gray-900"
												: "text-gray-400"
										}
									`}
								>
									{step.title}
								</p>
								{!step.required && (
									<p className="text-gray-400 text-xs mt-1">Optional</p>
								)}
							</div>
						</div>

						{/* Connector Line */}
						{index < steps.length - 1 && (
							<div
								className={`
									ml-4 mr-4 flex-1 h-0.5 transition-colors duration-300
									${
										index < currentStep
											? "bg-blue-500"
											: "bg-gray-300"
									}
								`}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
}