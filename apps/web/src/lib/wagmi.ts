import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";
import { env } from "@/env";

export const wagmiConfig = getDefaultConfig({
	appName: "Open Source Orchestra",
	projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "0",
	chains: [mainnet, base, optimism, arbitrum, polygon],
	transports: {
		[mainnet.id]: http(),
		[base.id]: http(),
		[optimism.id]: http(),
		[arbitrum.id]: http(),
		[polygon.id]: http(),
	},
	ssr: true,
});
