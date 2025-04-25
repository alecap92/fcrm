import { useState } from "react";
import {
  OrganizationSettings,
  UsersSettings,
  ContactFieldsSettings,
  SecuritySettings,
  IntegrationsSettings,
  EmailSettings,
  InvoiceSettings,
  DealsSettings,
  QuotationSettings,
  SettingsSidebar,
  LeadScoringSettings,
} from "../components/settings";
import type { SettingsSection } from "../types/settings";

export function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("organization");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <SettingsSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-lg shadow">
              {activeSection === "organization" && <OrganizationSettings />}
              {activeSection === "users" && <UsersSettings />}
              {activeSection === "contact-fields" && <ContactFieldsSettings />}
              {activeSection === "security" && <SecuritySettings />}
              {activeSection === "integrations" && <IntegrationsSettings />}
              {activeSection === "email" && <EmailSettings />}
              {activeSection === "invoice" && <InvoiceSettings />}
              {activeSection === "quotation" && <QuotationSettings />}
              {activeSection === "deals" && <DealsSettings />}
              {activeSection === "lead-scoring" && <LeadScoringSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
