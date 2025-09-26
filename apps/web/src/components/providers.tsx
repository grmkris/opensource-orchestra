"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import dynamic from 'next/dynamic';

const WalletConnectProvider = dynamic(
  () => import('./providers/WalletConnectProvider'),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<WalletConnectProvider>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster richColors />
			</ThemeProvider>
		</WalletConnectProvider>
	);
}
