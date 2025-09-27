"use client";

import { Toaster } from "../ui/sonner";
import { ThemeProvider } from "./theme-provider";
import { Web3Provider } from "./Web3Provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Web3Provider>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster richColors />
			</ThemeProvider>
		</Web3Provider>
	);
}
