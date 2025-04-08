import React from "react";
import type { VerificationData } from "../../../types/invoice";

interface VerificationStepProps {
  data: VerificationData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VerificationStep({ data, onChange }: VerificationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="id" className="block text-sm font-medium text-gray-700">
          ID
        </label>
        <input
          type="text"
          name="id"
          id="id"
          value={data.id}
          onChange={onChange}
          placeholder="Enter your ID"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="pin"
          className="block text-sm font-medium text-gray-700"
        >
          PIN
        </label>
        <input
          type="number"
          name="pin"
          id="pin"
          value={data.pin || ""}
          onChange={onChange}
          placeholder="Enter your PIN"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
    </div>
  );
}
