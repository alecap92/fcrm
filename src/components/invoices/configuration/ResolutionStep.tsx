import React from "react";
import type { ResolutionData } from "../../../types/invoice";

interface ResolutionStepProps {
  data: ResolutionData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ResolutionStep({ data, onChange }: ResolutionStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="type_document_id"
            className="block text-sm font-medium text-gray-700"
          >
            Document Type ID
          </label>
          <input
            type="number"
            name="type_document_id"
            id="type_document_id"
            value={data.type_document_id}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="prefix"
            className="block text-sm font-medium text-gray-700"
          >
            Prefix
          </label>
          <input
            type="text"
            name="prefix"
            id="prefix"
            value={data.prefix}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="resolution"
          className="block text-sm font-medium text-gray-700"
        >
          Resolution
        </label>
        <input
          type="text"
          name="resolution"
          id="resolution"
          value={data.resolution}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="resolution_date"
            className="block text-sm font-medium text-gray-700"
          >
            Resolution Date
          </label>
          <input
            type="date"
            name="resolution_date"
            id="resolution_date"
            value={data.resolution_date}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="technical_key"
            className="block text-sm font-medium text-gray-700"
          >
            Technical Key
          </label>
          <input
            type="text"
            name="technical_key"
            id="technical_key"
            value={data.technical_key}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="from"
            className="block text-sm font-medium text-gray-700"
          >
            From
          </label>
          <input
            type="number"
            name="from"
            id="from"
            value={data.from}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="to"
            className="block text-sm font-medium text-gray-700"
          >
            To
          </label>
          <input
            type="number"
            name="to"
            id="to"
            value={data.to}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="generated_to_date"
            className="block text-sm font-medium text-gray-700"
          >
            Generated To Date
          </label>
          <input
            type="number"
            name="generated_to_date"
            id="generated_to_date"
            value={data.generated_to_date}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date_from"
            className="block text-sm font-medium text-gray-700"
          >
            Date From
          </label>
          <input
            type="date"
            name="date_from"
            id="date_from"
            value={data.date_from}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="date_to"
            className="block text-sm font-medium text-gray-700"
          >
            Date To
          </label>
          <input
            type="date"
            name="date_to"
            id="date_to"
            value={data.date_to}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>
    </div>
  );
}
