import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { env } from "@/env";

export const wagmiConfig = getDefaultConfig({
	appName: "Open Source Orchestra",
	projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "0",
	chains: [base, mainnet],
	transports: {
		[mainnet.id]: http(),
		[base.id]: http(),
	},
	ssr: true,
});
