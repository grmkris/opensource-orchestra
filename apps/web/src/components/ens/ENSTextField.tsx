"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useEnsText } from "wagmi";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetTextRecords } from "@/hooks/useSetTextRecords";
import type { TextRecordKey } from "@/lib/ens/ens-contracts";

interface ENSTextFieldProps {
  ensName: string;
  recordKey: TextRecordKey;
  label: string;
  placeholder: string;
  isOwner: boolean;
}

export function ENSTextField({
  ensName,
  recordKey,
  label,
  placeholder,
  isOwner,
}: ENSTextFieldProps) {
  const fieldId = useId();

  // Fetch this specific field's data
  const { data, isLoading } = useEnsText({
    name: ensName,
    key: recordKey,
    query: { enabled: !!ensName },
    chainId: 1,
  });

  // Local state for this field
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setTextRecords = useSetTextRecords();

  // Update local state when data loads
  useEffect(() => {
    if (data) {
      setValue(data);
    }
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      await setTextRecords.mutateAsync({
        label: ensName,
        key: recordKey,
        value,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(`Error saving ${recordKey}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Label>{label}</Label>
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  // Read-only view for non-owners
  if (!isOwner) {
    return (
      <div>
        <span className="font-medium text-muted-foreground text-sm">
          {label}:
        </span>
        {data ? (
          <p className="text-muted-foreground">{data}</p>
        ) : (
          <p className="text-muted-foreground italic">Not set</p>
        )}
      </div>
    );
  }

  // Editable view for owners
  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1">
        <Label htmlFor={fieldId}>{label}</Label>
        <Input
          id={fieldId}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button size="sm" onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <Loader className="h-4 w-4" />
        ) : saved ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <SaveIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
