import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { base, mainnet, sepolia } from "wagmi/chains";
import { env } from "@/env";

export const wagmiConfig = getDefaultConfig({
	appName: "Open Source Orchestra P.I.T.",
	projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "0",
	chains: [base, mainnet, sepolia],
	transports: {
		[mainnet.id]: http(),
		[base.id]: http(),
		[sepolia.id]: http(),
	},
	ssr: true,
});
