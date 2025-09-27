"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Loader } from "@/components/loader";
import {
	useRegisterSubdomain,
	useSubdomainAvailability,
} from "@/hooks/useRegisterSubdomain";
import { useSetPrimaryName } from "@/hooks/useSetPrimaryName";

export function SubdomainRegistration() {
	const [label, setLabel] = useState("");
	const [debouncedLabel, setDebouncedLabel] = useState("");
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

	return (
		<div
			className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm"
			style={{ fontFamily: "var(--font-roboto)" }}
		>
			<div className="space-y-6">
				<div className="text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
						<div className="h-8 w-8 rounded-lg bg-blue-500" />
					</div>
					<h2 className="mb-2 font-bold text-2xl text-gray-900">
						Register Your Subdomain
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

				{/* Primary Name Button - Shows after successful registration */}
				{registerSuccess && registeredData && (
					<button
						type="button"
						onClick={handleSetPrimary}
						disabled={isSettingPrimary}
						className="flex w-full items-center justify-center rounded-lg border-2 border-blue-500 px-6 py-4 font-bold text-blue-600 transition-all duration-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSettingPrimary ? (
							<div className="flex items-center space-x-2">
								<Loader className="h-5 w-5" />
								<span>Setting as primary name...</span>
							</div>
						) : (
							`Set ${debouncedLabel} as Primary Name on Base`
						)}
					</button>
				)}

				{/* Status Messages - Direct from mutations */}
				{registerError && (
					<div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
						<div className="font-medium text-red-700 text-sm">
							Registration Error: {registerError.message}
						</div>
					</div>
				)}

				{primaryError && (
					<div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
						<div className="font-medium text-red-700 text-sm">
							Primary Name Error: {primaryError.message}
						</div>
					</div>
				)}

				{/* Registration Success */}
				{registerSuccess && registeredData && (
					<div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
						<div className="font-medium text-green-700 text-sm">
							✅ Successfully registered {debouncedLabel}!
						</div>
						<div className="mt-1 text-green-600 text-xs">
							Click the button above to set it as your primary name on Base.
						</div>
					</div>
				)}

				{/* Primary Name Success */}
				{primarySuccess && (
					<div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
						<div className="font-medium text-green-700 text-sm">
							✅ Primary name set successfully! It may take a few moments to
							update.
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
			</div>
		</div>
	);
}
