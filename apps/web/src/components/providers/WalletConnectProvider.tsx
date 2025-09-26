"use client";

import { Web3Provider } from "./Web3Provider";

export default function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>;
}
