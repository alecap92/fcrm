import React from "react";
import type { InvoiceConfig } from "../../../types/invoice";

interface ConfigStepProps {
  config: InvoiceConfig;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ConfigStep({ config, onChange }: ConfigStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="type_document_identification_id"
            className="block text-sm font-medium text-gray-700"
          >
            Document Identification Type
          </label>
          <input
            type="number"
            name="type_document_identification_id"
            id="type_document_identification_id"
            value={config.type_document_identification_id}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="type_organization_id"
            className="block text-sm font-medium text-gray-700"
          >
            Organization Type
          </label>
          <input
            type="number"
            name="type_organization_id"
            id="type_organization_id"
            value={config.type_organization_id}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="type_regime_id"
            className="block text-sm font-medium text-gray-700"
          >
            Regime Type
          </label>
          <input
            type="number"
            name="type_regime_id"
            id="type_regime_id"
            value={config.type_regime_id}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="type_liability_id"
            className="block text-sm font-medium text-gray-700"
          >
            Liability Type
          </label>
          <input
            type="number"
            name="type_liability_id"
            id="type_liability_id"
            value={config.type_liability_id}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="business_name"
            className="block text-sm font-medium text-gray-700"
          >
            Business Name
          </label>
          <input
            type="text"
            name="business_name"
            id="business_name"
            value={config.business_name}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="id_number"
            className="block text-sm font-medium text-gray-700"
          >
            Nit
          </label>
          <input
            type="text"
            name="idNumber"
            id="idNumber"
            value={config.id_number}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="verification_number"
            className="block text-sm font-medium text-gray-700"
          >
            Codigo de verificación
          </label>
          <input
            type="text"
            name="verification_number"
            id="verification_number"
            value={config.verification_number}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="merchant_registration"
            className="block text-sm font-medium text-gray-700"
          >
            Merchant Registration
          </label>
          <input
            type="text"
            name="merchant_registration"
            id="merchant_registration"
            value={config.merchant_registration}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="municipality_id"
            className="block text-sm font-medium text-gray-700"
          >
            Municipality ID
          </label>
          <input
            type="number"
            name="municipality_id"
            id="municipality_id"
            value={config.municipality_id}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Address
        </label>
        <input
          type="text"
          name="address"
          id="address"
          value={config.address}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            type="number"
            name="phone"
            id="phone"
            value={config.phone}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={config.email}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Mail Configuration
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="mail_host"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Host
            </label>
            <input
              type="text"
              name="mail_host"
              id="mail_host"
              value={config.mail_host}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_port"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Port
            </label>
            <input
              type="text"
              name="mail_port"
              id="mail_port"
              value={config.mail_port}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_username"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Username
            </label>
            <input
              type="text"
              name="mail_username"
              id="mail_username"
              value={config.mail_username}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_password"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Password
            </label>
            <input
              type="password"
              name="mail_password"
              id="mail_password"
              value={config.mail_password}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_encryption"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Encryption
            </label>
            <input
              type="text"
              name="mail_encryption"
              id="mail_encryption"
              value={config.mail_encryption}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
