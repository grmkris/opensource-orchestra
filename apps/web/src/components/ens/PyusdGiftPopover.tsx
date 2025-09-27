"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PY_USD_CONTRACTS } from "@/lib/pyusd/py-usd-contract";
import {
	useGiftToArtist,
	usePyusdAllowance,
	usePyusdApprove,
} from "@/lib/pyusd/pyUsdHooks";

interface PyusdGiftPopoverProps {
	recipientAddress: string;
	recipientName: string;
	theme?: "green" | "amber";
}

const PRESET_AMOUNTS = [
	{ value: "1", label: "1" },
	{ value: "5", label: "5" },
	{ value: "10", label: "10" },
	{ value: "25", label: "25" },
];

export function PyusdGiftPopover({
	recipientAddress,
	recipientName,
	theme = "amber",
}: PyusdGiftPopoverProps) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [isCustom, setIsCustom] = useState(false);
	const { address: userAddress } = useAccount();
	const chainId = useChainId();
	const { switchChain } = useSwitchChain();
	const giftToArtist = useGiftToArtist();
	const approvePyusd = usePyusdApprove();

	// Calculate amount in wei for allowance checks
	const amountInWei = amount ? parseUnits(amount, 6) : 0n;

	// Check allowance
	const { data: allowance } = usePyusdAllowance(
		userAddress,
		PY_USD_CONTRACTS.GIFT_SINGLE as `0x${string}`,
	);

	const isOnSepolia = chainId === sepolia.id;

	// Check if approval is needed
	const needsApproval =
		amount &&
		allowance !== undefined &&
		amountInWei > 0n &&
		allowance < amountInWei;

	const themeClasses = {
		green: {
			button: "border-green-200 text-green-700 hover:bg-green-50",
			sendButton: "bg-green-600 hover:bg-green-700",
			preset:
				"border-green-200 hover:bg-green-50 data-[state=on]:bg-green-100 data-[state=on]:border-green-300",
		},
		amber: {
			button:
				"border-amber-400/50 text-amber-300 hover:bg-amber-500/20 bg-amber-500/10",
			sendButton: "bg-amber-500 hover:bg-amber-600 text-black",
			preset:
				"border-amber-400/30 hover:bg-amber-500/20 data-[state=on]:bg-amber-500/30 data-[state=on]:border-amber-400",
		},
	};

	const handlePresetClick = (presetAmount: string) => {
		setAmount(presetAmount);
		setIsCustom(false);
	};

	const handleCustomClick = () => {
		setIsCustom(true);
		setAmount("");
	};

	const handleSwitchToSepolia = async () => {
		try {
			await switchChain({ chainId: sepolia.id });
		} catch (error) {
			console.error("Failed to switch to Sepolia:", error);
			toast.error("Failed to switch network");
		}
	};

	const handleApprove = async () => {
		if (!userAddress || !amount) {
			toast.error("Please connect your wallet and enter an amount");
			return;
		}

		if (!isOnSepolia) {
			toast.error("Please switch to Sepolia network for PYUSD approval");
			return;
		}

		try {
			await approvePyusd.mutateAsync({
				spender: PY_USD_CONTRACTS.GIFT_SINGLE as `0x${string}`,
				amount: amountInWei,
			});

			toast.success("PYUSD approval successful! You can now send the gift.");
		} catch (error) {
			console.error("Approval error:", error);
			toast.error("Failed to approve PYUSD spending. Please try again.");
		}
	};

	const handleSendGift = async () => {
		if (!userAddress) {
			toast.error("Please connect your wallet first");
			return;
		}

		if (!isOnSepolia) {
			toast.error("Please switch to Sepolia network for PYUSD gifts");
			return;
		}

		if (!amount || Number.parseFloat(amount) <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		try {
			await giftToArtist.mutateAsync({
				artist: recipientAddress as `0x${string}`,
				amount: amountInWei,
			});

			toast.success(`Gift of ${amount} PYUSD sent to ${recipientName}!`);
			setOpen(false);
			setAmount("");
			setIsCustom(false);
		} catch (error) {
			console.error("Transaction error:", error);
			toast.error("Failed to send PYUSD gift. Please try again.");
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					size="sm"
					variant="outline"
					className={themeClasses[theme].button}
				>
					<Gift className="mr-2 h-4 w-4" />
					Gift PYUSD
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72 border-opacity-50">
				{!userAddress ? (
					<div className="grid gap-3 text-center">
						<div>
							<h4 className="font-medium text-sm leading-none">
								Connect Wallet
							</h4>
							<p className="mt-1 text-muted-foreground text-xs">
								Connect your wallet to send PYUSD gift to {recipientName}
							</p>
						</div>
						<ConnectButton />
					</div>
				) : (
					<div className="grid gap-3">
						<div>
							<h4 className="font-medium text-sm leading-none">
								Send PYUSD gift
							</h4>
							<p className="mt-1 text-muted-foreground text-xs">
								to {recipientName}
							</p>
						</div>

						{!isOnSepolia && (
							<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-sm text-yellow-800">
											Switch to Sepolia
										</p>
										<p className="text-xs text-yellow-700">
											PYUSD gifts require Sepolia testnet
										</p>
									</div>
									<Button
										onClick={handleSwitchToSepolia}
										variant="outline"
										size="sm"
										className="text-xs"
									>
										Switch
									</Button>
								</div>
							</div>
						)}

						<div className="grid gap-2">
							<div className="grid grid-cols-4 gap-1">
								{PRESET_AMOUNTS.map((preset) => (
									<Button
										key={preset.value}
										variant={
											amount === preset.value && !isCustom
												? "default"
												: "outline"
										}
										size="sm"
										onClick={() => handlePresetClick(preset.value)}
										className={`h-8 text-xs ${themeClasses[theme].preset}`}
									>
										{preset.label}
									</Button>
								))}
							</div>

							<Button
								variant={isCustom ? "default" : "outline"}
								size="sm"
								onClick={handleCustomClick}
								className={`h-8 text-xs ${themeClasses[theme].preset}`}
							>
								Custom
							</Button>

							{isCustom && (
								<div className="flex items-center gap-2">
									<Input
										type="number"
										step="0.01"
										min="0.01"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										placeholder="1"
										className="h-8 flex-1 text-sm"
									/>
									<span className="text-muted-foreground text-xs">PYUSD</span>
								</div>
							)}
						</div>

						{amount && (
							<div className="rounded bg-muted/50 px-2 py-1">
								<p className="font-medium text-sm">{amount} PYUSD</p>
							</div>
						)}

						<Button
							onClick={needsApproval ? handleApprove : handleSendGift}
							disabled={
								!amount ||
								!isOnSepolia ||
								giftToArtist.isPending ||
								approvePyusd.isPending
							}
							className={`h-8 w-full text-sm ${themeClasses[theme].sendButton}`}
						>
							{approvePyusd.isPending ? (
								<>
									<Loader2 className="mr-2 h-3 w-3 animate-spin" />
									Approving...
								</>
							) : giftToArtist.isPending ? (
								<>
									<Loader2 className="mr-2 h-3 w-3 animate-spin" />
									Sending...
								</>
							) : needsApproval ? (
								<>
									<Gift className="mr-2 h-3 w-3" />
									Approve PYUSD
								</>
							) : (
								<>
									<Gift className="mr-2 h-3 w-3" />
									Send PYUSD Gift
								</>
							)}
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
