import { encodePacked, keccak256, namehash } from "viem";
import { base } from "viem/chains";

// Contract addresses on Base
export const ENS_CONTRACTS = {
	// L2Registry deployed on Base - stores subdomains as NFTs
	L2_REGISTRY: "0x0ce4122ca2f0466891f0a8c023ef8091585adfc8" as const,
	// L2Registrar address will be set after deployment
	L2_REGISTRAR: "" as const,
	// L1 Resolver on Ethereum Mainnet (for CCIP Read)
	L1_RESOLVER: "0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61" as const,
} as const;

// Parent ENS domain
export const PARENT_DOMAIN = "catmisha.eth" as const;

// Chain configuration
export const ENS_CHAIN = base;

// L2Registrar ABI - core functions for registration
export const L2_REGISTRAR_ABI = [
	{
		type: "function",
		name: "register",
		inputs: [
			{ name: "label", type: "string" },
			{ name: "owner", type: "address" },
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "available",
		inputs: [{ name: "label", type: "string" }],
		outputs: [{ name: "", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "event",
		name: "NameRegistered",
		inputs: [
			{ name: "label", type: "string", indexed: true },
			{ name: "owner", type: "address", indexed: true },
		],
	},
] as const;

// L2Registry ABI - core functions for text records and ownership
export const L2_REGISTRY_ABI = [
	{
		type: "function",
		name: "setText",
		inputs: [
			{ name: "node", type: "bytes32" },
			{ name: "key", type: "string" },
			{ name: "value", type: "string" },
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "text",
		inputs: [
			{ name: "node", type: "bytes32" },
			{ name: "key", type: "string" },
		],
		outputs: [{ name: "", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "ownerOf",
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ name: "", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "makeNode",
		inputs: [
			{ name: "parentNode", type: "bytes32" },
			{ name: "label", type: "string" },
		],
		outputs: [{ name: "", type: "bytes32" }],
		stateMutability: "pure",
	},
	{
		type: "function",
		name: "baseNode",
		inputs: [],
		outputs: [{ name: "", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "event",
		name: "TextChanged",
		inputs: [
			{ name: "node", type: "bytes32", indexed: true },
			{ name: "indexedKey", type: "string", indexed: true },
			{ name: "key", type: "string" },
			{ name: "value", type: "string" },
		],
	},
] as const;

// Helper functions
export function getFullSubdomainName(label: string): string {
	return `${label}.${PARENT_DOMAIN}`;
}

export function getSubdomainNamehash(label: string): `0x${string}` {
	const fullName = getFullSubdomainName(label);
	return namehash(fullName);
}

export function getLabelHash(label: string): `0x${string}` {
	return keccak256(encodePacked(["string"], [label]));
}

// Common text record keys
export const TEXT_RECORD_KEYS = {
	AVATAR: "avatar",
	DESCRIPTION: "description",
	DISPLAY: "display",
	EMAIL: "email",
	URL: "url",
	TWITTER: "com.twitter",
	GITHUB: "com.github",
	DISCORD: "com.discord",
	TELEGRAM: "com.telegram",
} as const;

export type TextRecordKey =
	(typeof TEXT_RECORD_KEYS)[keyof typeof TEXT_RECORD_KEYS];
