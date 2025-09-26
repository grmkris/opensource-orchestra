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
import { getFullSubdomainName } from "@/lib/contracts/ens-contracts";

interface SubdomainRegistrationProps {
	onSuccess?: (label: string, fullName: string) => void;
}

export function SubdomainRegistration({
	onSuccess,
}: SubdomainRegistrationProps) {
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

	const {
		isAvailable,
		isLoading: availabilityLoading,
		fullName,
		isValidLength,
	} = useSubdomainAvailability(debouncedLabel);

	const { register, isPending, isConfirmed, error } = useRegisterSubdomain({
		onSuccess: (registeredLabel) => {
			const fullSubdomainName = getFullSubdomainName(registeredLabel);
			onSuccess?.(registeredLabel, fullSubdomainName);
			setLabel(""); // Clear input after successful registration
		},
	});

	const canRegister = useMemo(() => {
		return (
			address &&
			label.length >= 3 &&
			isValidLength &&
			isAvailable &&
			!availabilityLoading &&
			!isPending
		);
	}, [
		address,
		label,
		isValidLength,
		isAvailable,
		availabilityLoading,
		isPending,
	]);

	const handleRegister = () => {
		if (!address || !canRegister) return;
		register(label, address);
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
		if (availabilityLoading)
			return { status: "loading", message: "Checking..." };
		if (!isAvailable && debouncedLabel === label)
			return { status: "error", message: "Already taken" };
		if (isAvailable && debouncedLabel === label)
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
							disabled={isPending}
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
					{label && isValidLength && (
						<div className="text-muted-foreground text-sm">
							Your subdomain: <span className="font-mono">{fullName}</span>
						</div>
					)}
				</div>

				{/* Registration Button */}
				<Button
					onClick={handleRegister}
					disabled={!canRegister}
					className="w-full"
				>
					{isPending ? (
						<div className="flex items-center space-x-2">
							<Loader className="h-4 w-4" />
							<span>Registering...</span>
						</div>
					) : (
						"Register Subdomain"
					)}
				</Button>

				{/* Transaction Status */}
				{error && (
					<div className="text-red-600 text-sm">Error: {error.message}</div>
				)}

				{isConfirmed && (
					<div className="text-green-600 text-sm">
						Successfully registered {fullName}!
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
				</div>
			</div>
		</Card>
	);
}
