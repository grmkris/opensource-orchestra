"use client";

import { ArrowDownToLine, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits, type Address } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useArtistBalance, useWithdrawForArtist } from "@/lib/pyusd/pyUsdHooks";

interface PyusdBalanceCardProps {
	artistAddress: Address;
}

export function PyusdBalanceCard({ artistAddress }: PyusdBalanceCardProps) {
	const [withdrawAmount, setWithdrawAmount] = useState("");
	const { address: userAddress } = useAccount();
	const chainId = useChainId();
	const { switchChain } = useSwitchChain();

	const balance = useArtistBalance(artistAddress);
	const withdrawMutation = useWithdrawForArtist();

	const isOnSepolia = chainId === sepolia.id;
	const isOwner = artistAddress?.toLowerCase() === userAddress?.toLowerCase();

	const formattedBalance = balance.data
		? formatUnits(balance.data, 6)
		: "0";

	const handleWithdraw = async () => {
		if (!withdrawAmount || !artistAddress) return;

		try {
			// Switch to Sepolia if not already on it
			if (!isOnSepolia) {
				await switchChain({ chainId: sepolia.id });
				return;
			}

			const amount = parseUnits(withdrawAmount, 6);
			
			if (balance.data && amount > balance.data) {
				toast.error("Withdrawal amount exceeds available balance");
				return;
			}

			await withdrawMutation.mutateAsync({
				artist: artistAddress,
				amount,
			});

			toast.success("Withdrawal successful!");
			setWithdrawAmount("");
		} catch (error) {
			console.error("Withdrawal error:", error);
			toast.error("Withdrawal failed. Please try again.");
		}
	};

	// Don't render if not the owner
	if (!isOwner) {
		return null;
	}

	return (
		<div
			className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-sm"
			style={{ fontFamily: "var(--font-roboto)" }}
		>
			<div className="space-y-6 p-8">
				{/* Header */}
				<div className="flex items-center space-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
						<DollarSign className="h-6 w-6 text-green-600" />
					</div>
					<div>
						<h3 className="font-bold text-gray-900 text-lg">PYUSD Balance</h3>
						<p className="text-gray-600 text-sm">
							Your earned balance and withdrawal options
						</p>
					</div>
				</div>

				{/* Balance Display */}
				<div className="rounded-xl bg-gray-50 p-6">
					<div className="text-center">
						<div className="mb-2 font-bold text-3xl text-gray-900">
							{balance.isLoading ? (
								<div className="flex items-center justify-center">
									<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
								</div>
							) : (
								`${formattedBalance} PYUSD`
							)}
						</div>
						<p className="text-gray-600 text-sm">Available for withdrawal</p>
					</div>
				</div>

				{/* Withdrawal Form */}
				{parseFloat(formattedBalance) > 0 && (
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-green-500" />
							<h4 className="font-bold text-gray-900">Withdraw Funds</h4>
						</div>

						<div className="space-y-3">
							<Input
								type="number"
								placeholder="Amount to withdraw"
								value={withdrawAmount}
								onChange={(e) => setWithdrawAmount(e.target.value)}
								step="0.000001"
								min="0"
								max={formattedBalance}
							/>

							<Button
								onClick={handleWithdraw}
								disabled={
									!withdrawAmount ||
									withdrawMutation.isPending ||
									balance.isLoading ||
									parseFloat(withdrawAmount) <= 0
								}
								className="w-full bg-green-600 text-white hover:bg-green-700"
							>
								{withdrawMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{isOnSepolia ? "Withdrawing..." : "Switching Network..."}
									</>
								) : (
									<>
										<ArrowDownToLine className="mr-2 h-4 w-4" />
										{isOnSepolia ? "Withdraw to Wallet" : "Switch to Sepolia"}
									</>
								)}
							</Button>

							{!isOnSepolia && (
								<p className="text-center text-orange-600 text-sm">
									Switch to Sepolia network to withdraw funds
								</p>
							)}
						</div>
					</div>
				)}

				{/* Empty State */}
				{parseFloat(formattedBalance) === 0 && !balance.isLoading && (
					<div className="text-center text-gray-500">
						<p className="text-sm">
							No PYUSD balance available for withdrawal
						</p>
					</div>
				)}
			</div>
		</div>
	);
}