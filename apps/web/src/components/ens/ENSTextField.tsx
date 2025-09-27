"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useENSFields } from "./ENSFieldsProvider";
import type { TextRecordKey } from "@/lib/ens/ens-contracts";

interface ENSTextFieldProps {
  recordKey: TextRecordKey;
  label: string;
  placeholder: string;
  isOwner: boolean;
  ensName: string;
}

export function ENSTextField({
  recordKey,
  label,
  placeholder,
  isOwner,
  ensName,
}: ENSTextFieldProps) {
  const fieldId = useId();
  const { getValue, setValue, isLoading } = useENSFields();

  const value = getValue(recordKey);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1">
        <Label>{label}</Label>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
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
        {value ? (
          <p className="text-muted-foreground">{value}</p>
        ) : (
          <p className="text-muted-foreground italic">Not set</p>
        )}
      </div>
    );
  }

  // Editable view for owners
  return (
    <div className="flex-1">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(recordKey, e.target.value)}
      />
    </div>
  );
}
