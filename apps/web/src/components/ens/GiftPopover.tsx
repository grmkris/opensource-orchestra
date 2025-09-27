"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useAccount, useSendTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface GiftPopoverProps {
	recipientAddress: string;
	recipientName: string;
	theme?: "green" | "amber";
}

const PRESET_AMOUNTS = [
	{ value: "0.001", label: "0.001" },
	{ value: "0.01", label: "0.01" },
	{ value: "0.1", label: "0.1" },
	{ value: "1", label: "1" },
];

export function GiftPopover({
	recipientAddress,
	recipientName,
	theme = "green",
}: GiftPopoverProps) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [isCustom, setIsCustom] = useState(false);
	const { address: userAddress } = useAccount();
	const { sendTransaction, isPending } = useSendTransaction();

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

	const handleSendGift = async () => {
		if (!userAddress) {
			toast.error("Please connect your wallet first");
			return;
		}

		if (!amount || Number.parseFloat(amount) <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		try {
			await sendTransaction({
				to: recipientAddress as `0x${string}`,
				value: parseEther(amount),
			});

			toast.success(`Gift of ${amount} ETH sent to ${recipientName}!`);
			setOpen(false);
			setAmount("");
			setIsCustom(false);
		} catch (error) {
			console.error("Transaction error:", error);
			toast.error("Failed to send gift. Please try again.");
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
					Gift
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
								Connect your wallet to send a gift to {recipientName}
							</p>
						</div>
						<ConnectButton />
					</div>
				) : (
					<div className="grid gap-3">
						<div>
							<h4 className="font-medium text-sm leading-none">Send a gift</h4>
							<p className="mt-1 text-muted-foreground text-xs">
								to {recipientName}
							</p>
						</div>

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
										step="0.000001"
										min="0.000001"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										placeholder="0.001"
										className="h-8 flex-1 text-sm"
									/>
									<span className="text-muted-foreground text-xs">ETH</span>
								</div>
							)}
						</div>

						{amount && (
							<div className="rounded bg-muted/50 px-2 py-1">
								<p className="font-medium text-sm">{amount} ETH</p>
							</div>
						)}

						<Button
							onClick={handleSendGift}
							disabled={!amount || isPending}
							className={`h-8 w-full text-sm ${themeClasses[theme].sendButton}`}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-3 w-3 animate-spin" />
									Sending...
								</>
							) : (
								<>
									<Gift className="mr-2 h-3 w-3" />
									Send Gift
								</>
							)}
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
