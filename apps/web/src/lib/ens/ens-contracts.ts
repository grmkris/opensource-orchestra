import { base } from "viem/chains";

// Contract addresses on Base
export const ENS_CONTRACTS = {
	// L2Registry deployed on Base - stores subdomains as NFTs
	L2_REGISTRY: "0xfdf982948acb8e1922ff2162a2f5ac14a02e64e3" as const,
	// L2Registrar address will be set after deployment
	L2_REGISTRAR: "0xd90e4c76760Da613f37379a1df8a25929df78EA1" as const,
	// L1 Resolver on Ethereum Mainnet (for CCIP Read)
	L1_RESOLVER: "0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61" as const,
	// Base Reverse Registrar (official ENS deployment)
	BASE_REVERSE_REGISTRAR: "0x0000000000D8e504002cC26E3Ec46D81971C1664" as const,
	// Universal Resolver on Ethereum Mainnet
	UNIVERSAL_RESOLVER: "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe" as const,
} as const;

// Parent ENS domain
export const PARENT_DOMAIN = "osopit.eth" as const;

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
	FARCASTER: "social.farcaster",
	LENS: "social.lens",
	LIVESTREAM_URL: "livestream.url",
	IS_STREAMING: "livestream.active",
	ART1: "art1",
	ART2: "art2",
	ART3: "art3",
	ART4: "art4",
	ART5: "art5",
	ART6: "art6",
	ART7: "art7",
	ART8: "art8",
} as const;

export type TextRecordKey =
	(typeof TEXT_RECORD_KEYS)[keyof typeof TEXT_RECORD_KEYS];
