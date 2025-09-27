"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

		setPrimaryMutation.mutate(registeredData.label);
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
		<Card className="p-6">
			<div className="space-y-4">
				<div>
					<h2 className="mb-2 font-semibold text-xl">
						Register Your Subdomain
					</h2>
					<p className="text-muted-foreground">
						Get your own .catmisha.eth subdomain on Base L2
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="subdomain">Choose your subdomain</Label>
					<div className="flex items-center space-x-2">
						<Input
							id={subdomainId}
							placeholder="yourname"
							value={label}
							onChange={handleLabelChange}
							className="flex-1"
							disabled={isRegistering}
						/>
						<span className="whitespace-nowrap text-muted-foreground">
							.catmisha.eth
						</span>
					</div>

					{/* Availability Status */}
					{availabilityStatus && (
						<div className="flex items-center space-x-2">
							{availabilityStatus.status === "loading" && (
								<Loader className="h-4 w-4" />
							)}
							<span
								className={`text-sm ${
									availabilityStatus.status === "success"
										? "text-green-600"
										: availabilityStatus.status === "error"
											? "text-red-600"
											: "text-muted-foreground"
								}`}
							>
								{availabilityStatus.message}
							</span>
						</div>
					)}

					{/* Preview */}
					{label && domainAvailability.data && (
						<div className="text-muted-foreground text-sm">
							Your subdomain:{" "}
							<span className="font-mono">{debouncedLabel}</span>
						</div>
					)}
				</div>

				{/* Registration Button */}
				<Button
					onClick={handleRegister}
					disabled={!canRegister}
					className="w-full"
				>
					{isRegistering ? (
						<div className="flex items-center space-x-2">
							<Loader className="h-4 w-4" />
							<span>Registering...</span>
						</div>
					) : (
						"Register Subdomain"
					)}
				</Button>

				{/* Primary Name Button - Shows after successful registration */}
				{registerSuccess && registeredData && (
					<Button
						onClick={handleSetPrimary}
						disabled={isSettingPrimary}
						className="w-full"
						variant="outline"
					>
						{isSettingPrimary ? (
							<div className="flex items-center space-x-2">
								<Loader className="h-4 w-4" />
								<span>Setting as primary name...</span>
							</div>
						) : (
							`Set ${debouncedLabel} as Primary Name on Base`
						)}
					</Button>
				)}

				{/* Status Messages - Direct from mutations */}
				{registerError && (
					<div className="text-red-600 text-sm">
						Registration Error: {registerError.message}
					</div>
				)}

				{primaryError && (
					<div className="text-red-600 text-sm">
						Primary Name Error: {primaryError.message}
					</div>
				)}

				{/* Registration Success */}
				{registerSuccess && registeredData && (
					<div className="text-green-600 text-sm">
						✅ Successfully registered {debouncedLabel}!
						<div className="mt-1 text-muted-foreground">
							Click the button above to set it as your primary name on Base.
						</div>
					</div>
				)}

				{/* Primary Name Success */}
				{primarySuccess && (
					<div className="text-green-600 text-sm">
						✅ Primary name set successfully! It may take a few moments to
						update.
					</div>
				)}

				{/* Requirements */}
				{!address && (
					<div className="text-center text-muted-foreground text-sm">
						Connect your wallet to register a subdomain
					</div>
				)}

				{/* Info */}
				<div className="space-y-1 text-muted-foreground text-xs">
					<p>• Free registration on Base L2</p>
					<p>• Minimum 3 characters, alphanumeric only</p>
					<p>• You can set avatar, bio, and social links after registration</p>
					<p>
						• After registration, optionally set as your primary name on Base
					</p>
				</div>
			</div>
		</Card>
	);
}
