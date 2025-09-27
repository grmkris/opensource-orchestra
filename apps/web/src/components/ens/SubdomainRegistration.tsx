"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Loader } from "@/components/loader";
import {
	useRegisterSubdomain,
	useSubdomainAvailability,
} from "@/hooks/useRegisterSubdomain";
import { useSetPrimaryName } from "@/hooks/useSetPrimaryName";

interface SubdomainRegistrationProps {
	onSuccess?: () => void;
}

// Phase indicator component
const PhaseIndicator = ({
	phase,
}: {
	phase: "register" | "setPrimary" | "complete";
}) => (
	<div className="mb-6">
		<div className="mb-2 text-center">
			<span className="font-medium text-gray-600 text-sm">
				{phase === "register" && "Step 1 of 2: Register Username"}
				{phase === "setPrimary" && "Step 2 of 2: Activate Username"}
				{phase === "complete" && "Username Setup Complete!"}
			</span>
		</div>
		<div className="flex items-center justify-center space-x-2">
			<div
				className={`h-2 w-16 rounded-full transition-all duration-300 ${
					phase !== "register" ? "bg-green-500" : "bg-blue-500"
				}`}
			/>
			<div
				className={`h-2 w-16 rounded-full transition-all duration-300 ${
					phase === "complete"
						? "bg-green-500"
						: phase === "setPrimary"
							? "bg-blue-500"
							: "bg-gray-300"
				}`}
			/>
		</div>
	</div>
);

export function SubdomainRegistration({
	onSuccess,
}: SubdomainRegistrationProps = {}) {
	const [label, setLabel] = useState("");
	const [debouncedLabel, setDebouncedLabel] = useState("");
	const [currentPhase, setCurrentPhase] = useState<
		"register" | "setPrimary" | "complete"
	>("register");
	const { address } = useAccount();

	// Debounce the label input for availability checking
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedLabel(label);
		}, 300);

		return () => clearTimeout(timer);
	}, [label]);

	// Check availability
	const domainAvailability = useSubdomainAvailability({
		label: debouncedLabel,
	});

	// Mutations - clean and simple!
	const registerMutation = useRegisterSubdomain();
	const setPrimaryMutation = useSetPrimaryName();

	// Derived state from mutations - no manual tracking needed
	const isRegistering = registerMutation.isPending;
	const registerSuccess = registerMutation.isSuccess;
	const registeredData = registerMutation.data;
	const registerError = registerMutation.error;

	const isSettingPrimary = setPrimaryMutation.isPending;
	const primarySuccess = setPrimaryMutation.isSuccess;
	const primaryError = setPrimaryMutation.error;

	const canRegister = useMemo(() => {
		return (
			address &&
			label.length >= 3 &&
			domainAvailability.data &&
			!domainAvailability.isLoading &&
			!isRegistering
		);
	}, [
		address,
		label,
		isRegistering,
		domainAvailability.data,
		domainAvailability.isLoading,
	]);

	const handleRegister = () => {
		if (!address || !canRegister) return;

		registerMutation.mutate({ label, owner: address });
	};

	const handleSetPrimary = () => {
		if (!registeredData?.label) return;

		const fullLabel = `${registeredData.label}.catmisha.eth`; // TODO don't hardcode this
		console.log("setting primary", fullLabel);
		setPrimaryMutation.mutate(fullLabel);
	};

	const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
		setLabel(value);
	};

	const subdomainId = useId();

	const getAvailabilityStatus = () => {
		if (!label) return null;
		if (label.length < 3)
			return { status: "error", message: "Minimum 3 characters" };
		if (domainAvailability.isLoading)
			return { status: "loading", message: "Checking..." };
		if (!domainAvailability.data && debouncedLabel === label)
			return { status: "error", message: "Already taken" };
		if (domainAvailability.data && debouncedLabel === label)
			return { status: "success", message: "Available!" };
		return null;
	};

	const availabilityStatus = getAvailabilityStatus();

	// Auto-transition phases
	useEffect(() => {
		if (registerSuccess && registeredData && currentPhase === "register") {
			setCurrentPhase("setPrimary");
		}
	}, [registerSuccess, registeredData, currentPhase]);

	useEffect(() => {
		if (primarySuccess && currentPhase === "setPrimary") {
			setCurrentPhase("complete");
			// Brief delay then call onSuccess
			setTimeout(() => {
				if (onSuccess) onSuccess();
			}, 2000); // Show success state for 2 seconds
		}
	}, [primarySuccess, currentPhase, onSuccess]);

	return (
		<div
			className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm"
			style={{ fontFamily: "var(--font-roboto)" }}
		>
			<div className="space-y-6">
				{/* Phase indicator */}
				<PhaseIndicator phase={currentPhase} />

				{/* Phase-specific content */}
				{currentPhase === "register" && (
					<>
						<div className="text-center">
							<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
								<div className="h-8 w-8 rounded-lg bg-blue-500" />
							</div>
							<h2 className="mb-2 font-bold text-2xl text-gray-900">
								Choose Your Username
							</h2>
							<p className="text-gray-600">
								Get your own .catmisha.eth subdomain on Base L2
							</p>
						</div>

						<div className="space-y-3">
							<label
								htmlFor={subdomainId}
								className="block font-bold text-gray-900 text-sm"
							>
								Choose your subdomain
							</label>
							<div className="flex items-center">
								<input
									id={subdomainId}
									placeholder="yourname"
									value={label}
									onChange={handleLabelChange}
									disabled={isRegistering}
									className="flex-1 rounded-l-lg border-2 border-gray-200 px-4 py-3 font-medium text-gray-900 transition-colors focus:border-blue-400 focus:outline-none"
								/>
								<div className="whitespace-nowrap rounded-r-lg border-2 border-gray-200 border-l-0 bg-gray-50 px-4 py-3 font-medium text-gray-600">
									.catmisha.eth
								</div>
							</div>

							{/* Availability Status */}
							{availabilityStatus && (
								<div className="flex items-center space-x-2">
									{availabilityStatus.status === "loading" && (
										<Loader className="h-4 w-4 text-blue-500" />
									)}
									<span
										className={`font-medium text-sm ${
											availabilityStatus.status === "success"
												? "text-green-600"
												: availabilityStatus.status === "error"
													? "text-red-600"
													: "text-gray-600"
										}`}
									>
										{availabilityStatus.message}
									</span>
								</div>
							)}

							{/* Preview */}
							{label && domainAvailability.data && (
								<div className="text-gray-600 text-sm">
									Your subdomain:{" "}
									<span className="font-bold font-mono">
										{debouncedLabel}.catmisha.eth
									</span>
								</div>
							)}
						</div>

						{/* Registration Button */}
						<button
							type="button"
							onClick={handleRegister}
							disabled={!canRegister}
							className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-6 py-4 font-bold text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
						>
							{isRegistering ? (
								<div className="flex items-center space-x-2">
									<Loader className="h-5 w-5" />
									<span>Registering...</span>
								</div>
							) : (
								"Register Subdomain"
							)}
						</button>

						{/* Registration Error */}
						{registerError && (
							<div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
								<div className="font-medium text-red-700 text-sm">
									Registration Error: {registerError.message}
								</div>
							</div>
						)}

						{/* Requirements */}
						{!address && (
							<div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 text-center">
								<div className="font-medium text-gray-600 text-sm">
									Connect your wallet to register a subdomain
								</div>
							</div>
						)}
					</>
				)}

				{/* Phase 2: Set Primary Name */}
				{currentPhase === "setPrimary" && (
					<>
						<div className="space-y-4 text-center">
							<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
								<div className="h-8 w-8 rounded-lg bg-green-500" />
							</div>
							<div>
								<div className="mb-2 font-bold text-2xl text-gray-900">
									{registeredData?.label}.catmisha.eth
								</div>
								<div className="mb-4 font-medium text-green-600 text-sm">
									✅ Successfully registered!
								</div>
								<p className="mx-auto max-w-md text-gray-600">
									Almost done! Set this as your primary name to activate your
									identity on the Base network.
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={handleSetPrimary}
							disabled={isSettingPrimary}
							className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-6 py-4 font-bold text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSettingPrimary ? (
								<div className="flex items-center space-x-2">
									<Loader className="h-5 w-5" />
									<span>Activating Username...</span>
								</div>
							) : (
								"Activate as Primary Name"
							)}
						</button>

						{primaryError && (
							<div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
								<div className="font-medium text-red-700 text-sm">
									Activation Error: {primaryError.message}
								</div>
							</div>
						)}
					</>
				)}

				{/* Phase 3: Complete */}
				{currentPhase === "complete" && (
					<div className="space-y-4 text-center">
						<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
							<div className="h-8 w-8 rounded-lg bg-green-500" />
						</div>
						<div>
							<h2 className="mb-2 font-bold text-2xl text-gray-900">
								Username Setup Complete! 🎉
							</h2>
							<div className="mb-2 font-bold text-green-600 text-xl">
								{registeredData?.label}.catmisha.eth
							</div>
							<p className="text-gray-600">Is now your primary name on Base!</p>
						</div>
						<div className="text-gray-500 text-sm">
							Continuing to profile setup...
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
