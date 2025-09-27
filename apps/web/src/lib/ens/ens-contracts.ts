import { base } from "viem/chains";

// Contract addresses on Base
export const ENS_CONTRACTS = {
	// L2Registry deployed on Base - stores subdomains as NFTs
	L2_REGISTRY: "0x0ce4122ca2f0466891f0a8c023ef8091585adfc8" as const,
	// L2Registrar address will be set after deployment
	L2_REGISTRAR: "0xfDde380E6502FF463F9234d76fDf5A4d1eF256d7" as const,
	// L1 Resolver on Ethereum Mainnet (for CCIP Read)
	L1_RESOLVER: "0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61" as const,
	// Base Reverse Registrar (official ENS deployment)
	BASE_REVERSE_REGISTRAR: "0x0000000000D8e504002cC26E3Ec46D81971C1664" as const,
	// Universal Resolver on Ethereum Mainnet
	UNIVERSAL_RESOLVER: "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe" as const,
} as const;

// Parent ENS domain
export const PARENT_DOMAIN = "catmisha.eth" as const;

// Chain configuration
export const ENS_CHAIN = base;

// Common text record keys
export const TEXT_RECORD_KEYS = {
	AVATAR: "avatar",
	DESCRIPTION: "description",
	EMAIL: "email",
	URL: "url",
	HEADER: "header",
	TWITTER: "com.twitter",
	GITHUB: "com.github",
	DISCORD: "com.discord",
	TELEGRAM: "com.telegram",
} as const;

export type TextRecordKey =
	(typeof TEXT_RECORD_KEYS)[keyof typeof TEXT_RECORD_KEYS];
