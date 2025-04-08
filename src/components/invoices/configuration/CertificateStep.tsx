import React from "react";
import type { CertificateData } from "../../../types/invoice";

interface CertificateStepProps {
  data: CertificateData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function CertificateStep({
  data,
  onChange,
  fileInputRef,
}: CertificateStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="certificate"
          className="block text-sm font-medium text-gray-700"
        >
          Certificate (.p12)
        </label>
        <div className="mt-1 flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            name="certificate"
            id="certificate"
            accept=".p12"
            onChange={onChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Only .p12 certificate files are allowed
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Certificate Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={data.password}
          onChange={onChange}
          placeholder="Enter certificate password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
    </div>
  );
}
