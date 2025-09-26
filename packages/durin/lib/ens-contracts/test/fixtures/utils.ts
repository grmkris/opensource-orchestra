import { type Hex, hexToBigInt, labelhash, namehash } from "viem";

export const toTokenId = (hash: Hex) => hexToBigInt(hash);
export const toLabelId = (label: string) => toTokenId(labelhash(label));
export const toNameId = (name: string) => toTokenId(namehash(name));
