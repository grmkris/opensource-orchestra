"use client";

import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useAccount, useSendTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface GiftPopoverProps {
	recipientAddress: string;
	recipientName: string;
}

const PRESET_AMOUNTS = [
	{ value: "0.001", label: "0.001 ETH" },
	{ value: "0.01", label: "0.01 ETH" },
	{ value: "0.1", label: "0.1 ETH" },
	{ value: "1", label: "1 ETH" },
];

export function GiftPopover({
	recipientAddress,
	recipientName,
}: GiftPopoverProps) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [isCustom, setIsCustom] = useState(false);
	const { address: userAddress } = useAccount();
	const { sendTransaction, isPending } = useSendTransaction();

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
					className="border-green-200 text-green-700 hover:bg-green-50"
				>
					<Gift className="mr-2 h-4 w-4" />
					Gift ETH
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Send a gift</h4>
						<p className="text-muted-foreground text-sm">
							Choose an amount to gift to {recipientName}
						</p>
					</div>

					<div className="grid gap-2">
						<Label>Select amount</Label>
						<div className="grid grid-cols-2 gap-2">
							{PRESET_AMOUNTS.map((preset) => (
								<Button
									key={preset.value}
									variant={
										amount === preset.value && !isCustom ? "default" : "outline"
									}
									size="sm"
									onClick={() => handlePresetClick(preset.value)}
									className="justify-start"
								>
									{preset.label}
								</Button>
							))}
						</div>

						<Button
							variant={isCustom ? "default" : "outline"}
							size="sm"
							onClick={handleCustomClick}
							className="w-full"
						>
							Custom Amount
						</Button>

						{isCustom && (
							<div className="mt-2 flex items-center gap-2">
								<Input
									type="number"
									step="0.000001"
									min="0.000001"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="Enter amount"
									className="flex-1"
								/>
								<span className="text-muted-foreground text-sm">ETH</span>
							</div>
						)}
					</div>

					{amount && (
						<div className="rounded-lg bg-muted p-3">
							<p className="text-muted-foreground text-sm">You're sending</p>
							<p className="font-semibold text-lg">{amount} ETH</p>
						</div>
					)}

					<Button
						onClick={handleSendGift}
						disabled={!amount || isPending}
						className="w-full bg-green-600 text-white hover:bg-green-700"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							<>
								<Gift className="mr-2 h-4 w-4" />
								Send Gift
							</>
						)}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
