"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useEnsAvatar, useEnsText } from "wagmi";
import { useBatchSetTextRecords } from "@/hooks/useSetTextRecords";
import { TEXT_RECORD_KEYS, type TextRecordKey } from "@/lib/ens/ens-contracts";

interface ENSFieldsContextType {
	// Field values
	values: Record<TextRecordKey, string>;

	// State management
	setValue: (key: TextRecordKey, value: string) => void;
	getValue: (key: TextRecordKey) => string;

	// Batch operations
	saveAllFields: () => Promise<void>;
	hasChanges: boolean;
	isSaving: boolean;
	saved: boolean;

	// Loading states
	isLoading: boolean;
}

const ENSFieldsContext = createContext<ENSFieldsContextType | undefined>(
	undefined,
);

interface ENSFieldsProviderProps {
	children: ReactNode;
	ensName: string;
	isOwner: boolean;
}

export function ENSFieldsProvider({
	children,
	ensName,
	isOwner,
}: ENSFieldsProviderProps) {
	// All possible text record keys
	const textRecordKeys = Object.values(TEXT_RECORD_KEYS);

	// Local state for field values
	const [values, setValues] = useState<Record<TextRecordKey, string>>(() => {
		const initialValues: Record<string, string> = {};
		textRecordKeys.forEach((key) => {
			initialValues[key] = "";
		});
		return initialValues as Record<TextRecordKey, string>;
	});

	// Original values from ENS (to track changes)
	const [originalValues, setOriginalValues] = useState<
		Record<TextRecordKey, string>
	>(() => {
		const initialValues: Record<string, string> = {};
		textRecordKeys.forEach((key) => {
			initialValues[key] = "";
		});
		return initialValues as Record<TextRecordKey, string>;
	});

	// Batch save state
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const batchSetTextRecords = useBatchSetTextRecords();

	// Fetch all text records using individual hooks
	const textQueries = {
		description: useEnsText({
			name: ensName,
			key: "description",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		avatar: useEnsAvatar({
			name: ensName,
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		header: useEnsText({
			name: ensName,
			key: "header",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		email: useEnsText({
			name: ensName,
			key: "email",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		url: useEnsText({
			name: ensName,
			key: "url",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"com.twitter": useEnsText({
			name: ensName,
			key: "com.twitter",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"com.github": useEnsText({
			name: ensName,
			key: "com.github",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"com.discord": useEnsText({
			name: ensName,
			key: "com.discord",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"com.telegram": useEnsText({
			name: ensName,
			key: "com.telegram",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"social.farcaster": useEnsText({
			name: ensName,
			key: "social.farcaster",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"social.lens": useEnsText({
			name: ensName,
			key: "social.lens",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"livestream.url": useEnsText({
			name: ensName,
			key: "livestream.url",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		"livestream.active": useEnsText({
			name: ensName,
			key: "livestream.active",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art1: useEnsText({
			name: ensName,
			key: "art1",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art2: useEnsText({
			name: ensName,
			key: "art2",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art3: useEnsText({
			name: ensName,
			key: "art3",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art4: useEnsText({
			name: ensName,
			key: "art4",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art5: useEnsText({
			name: ensName,
			key: "art5",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art6: useEnsText({
			name: ensName,
			key: "art6",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art7: useEnsText({
			name: ensName,
			key: "art7",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
		art8: useEnsText({
			name: ensName,
			key: "art8",
			query: { enabled: !!ensName },
			chainId: 1,
		}),
	};

	// Check if any query is loading
	const isLoading = Object.values(textQueries).some((query) => query.isLoading);

	// Update local state when ENS data loads
	useEffect(() => {
		const newValues: Record<string, string> = {};
		const newOriginalValues: Record<string, string> = {};

		// Handle avatar separately since it comes from useEnsAvatar
		const avatarUrl = textQueries.avatar.data || "";
		newValues.avatar = avatarUrl;
		newOriginalValues.avatar = avatarUrl;

		// Handle other text records
		textRecordKeys.forEach((key) => {
			if (key === "avatar") return; // Already handled above

			const query = textQueries[key as keyof typeof textQueries];
			const value = query?.data || "";
			newValues[key] = value;
			newOriginalValues[key] = value;
		});

		setValues(newValues as Record<TextRecordKey, string>);
		setOriginalValues(newOriginalValues as Record<TextRecordKey, string>);
	}, [
		textQueries.description.data,
		textQueries.avatar.data,
		textQueries.header.data,
		textQueries.email.data,
		textQueries.url.data,
		textQueries["com.twitter"].data,
		textQueries["com.github"].data,
		textQueries["com.discord"].data,
		textQueries["com.telegram"].data,
		textQueries["social.farcaster"].data,
		textQueries["social.lens"].data,
		textQueries["livestream.url"].data,
		textQueries["livestream.active"].data,
		textQueries.art1.data,
		textQueries.art2.data,
		textQueries.art3.data,
		textQueries.art4.data,
		textQueries.art5.data,
		textQueries.art6.data,
		textQueries.art7.data,
		textQueries.art8.data,
		textQueries[key as keyof typeof textQueries], // Handle other text records
		textRecordKeys.forEach,
	]);

	// Check if there are any changes
	const hasChanges = Object.keys(values).some((key) => {
		const typedKey = key as TextRecordKey;
		return values[typedKey] !== originalValues[typedKey];
	});

	const setValue = (key: TextRecordKey, value: string) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};

	const getValue = (key: TextRecordKey) => {
		return values[key] || "";
	};

	const saveAllFields = async () => {
		if (!isOwner || !hasChanges) return;

		setIsSaving(true);
		setSaved(false);

		try {
			// Prepare records array with only changed values
			const records = Object.entries(values)
				.filter(([key, value]) => {
					const typedKey = key as TextRecordKey;
					return value !== originalValues[typedKey];
				})
				.map(([key, value]) => ({
					key: key as TextRecordKey,
					value: value || "", // Use empty string for falsy values
				}));

			await batchSetTextRecords.mutateAsync({
				label: ensName,
				records,
			});

			// Update original values to match current values
			setOriginalValues({ ...values });
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error("Error saving all fields:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const contextValue: ENSFieldsContextType = {
		values,
		setValue,
		getValue,
		saveAllFields,
		hasChanges,
		isSaving,
		saved,
		isLoading,
	};

	return (
		<ENSFieldsContext.Provider value={contextValue}>
			{children}
		</ENSFieldsContext.Provider>
	);
}

export function useENSFields() {
	const context = useContext(ENSFieldsContext);
	if (context === undefined) {
		throw new Error("useENSFields must be used within an ENSFieldsProvider");
	}
	return context;
}
