import React, { useState, useRef } from "react";
import {
  Settings,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  FileKey,
  FileText,
  TestTube,
} from "lucide-react";
import type {
  InvoiceConfig,
  VerificationData,
  CertificateData,
  ResolutionData,
} from "../types/invoice";

import { VerificationStep } from "../components/invoices/configuration/VerificationStep";
import { CertificateStep } from "../components/invoices/configuration/CertificateStep";
import { ResolutionStep } from "../components/invoices/configuration/ResolutionStep";
import { Modal } from "../components/ui/modal";
import { ConfigStep } from "../components/invoices/configuration/ConfigStep";
import { TestStep } from "../components/invoices/configuration/TestStep";

function InvoiceConfiguration() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<InvoiceConfig>({
    type_document_identification_id: 3,
    type_organization_id: 2,
    type_regime_id: 2,
    type_liability_id: 14,
    business_name: "",
    merchant_registration: "",
    municipality_id: 820,
    address: "",
    phone: 0,
    email: "",
    mail_host: "smtp.gmail.com",
    mail_port: "587",
    mail_username: "",
    mail_password: "",
    mail_encryption: "tls",
    verification_number: "0",
    id_number: "",
  });

  const [verificationData, setVerificationData] = useState<VerificationData>({
    id: "",
    pin: 0,
  });

  const [certificateData, setCertificateData] = useState<CertificateData>({
    certificate: null,
    password: "",
  });

  const [resolutionData, setResolutionData] = useState<ResolutionData>({
    type_document_id: 1,
    prefix: "SETP",
    resolution: "18760000001",
    resolution_date: "2019-01-19",
    technical_key: "fc8eac422eba16e22ffd8c6f94b3f40a6e38162c",
    from: 990000000,
    to: 995000000,
    generated_to_date: 0,
    date_from: "2019-01-19",
    date_to: "2030-01-19",
  });

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVerificationData((prev) => ({
      ...prev,
      [name]: name === "pin" ? Number(value) : value,
    }));
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "certificate" && files && files[0]) {
      if (!files[0].name.toLowerCase().endsWith(".p12")) {
        alert("Please upload a valid .p12 certificate file");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setCertificateData((prev) => ({
        ...prev,
        certificate: files[0],
      }));
    } else {
      setCertificateData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResolutionData((prev) => ({
      ...prev,
      [name]: ["from", "to", "generated_to_date", "type_document_id"].includes(
        name
      )
        ? Number(value)
        : value,
    }));
  };

  const handleTestInvoice = () => {
    console.log("test");
  };

  const navigateStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <Settings className="mx-auto h-12 w-12 text-blue-600" />;
      case 2:
        return <KeyRound className="mx-auto h-12 w-12 text-blue-600" />;
      case 3:
        return <FileKey className="mx-auto h-12 w-12 text-blue-600" />;
      case 4:
        return <FileText className="mx-auto h-12 w-12 text-blue-600" />;
      case 5:
        return <TestTube className="mx-auto h-12 w-12 text-blue-600" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Electronic Invoice Configuration";
      case 2:
        return "Verification";
      case 3:
        return "Certificate Upload";
      case 4:
        return "Resolution Configuration";
      case 5:
        return "Test Configuration";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Set up your basic invoice configuration and email settings";
      case 2:
        return "Verify your identity with ID and PIN";
      case 3:
        return "Upload your digital certificate";
      case 4:
        return "Configure resolution details and numbering";
      case 5:
        return "Test your invoice configuration";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invoice Configuration"
        modalSize="XL"
      >
        <div className="text-center mb-8">
          {getStepIcon()}
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {getStepTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{getStepDescription()}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigateStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`p-2 rounded-full ${
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex flex-col items-center mx-4">
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => navigateStep(1)}
                    className={`rounded-full h-10 w-10 flex items-center justify-center transition-all duration-200 ${
                      currentStep === 1
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    1
                  </button>
                  <span className="text-xs mt-2 text-gray-600">Config</span>
                </div>
                <div className="h-1 w-16 bg-blue-200 mx-2 mt-[-8px]"></div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => navigateStep(2)}
                    className={`rounded-full h-10 w-10 flex items-center justify-center transition-all duration-200 ${
                      currentStep === 2
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    2
                  </button>
                  <span className="text-xs mt-2 text-gray-600">Verify</span>
                </div>
                <div className="h-1 w-16 bg-blue-200 mx-2 mt-[-8px]"></div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => navigateStep(3)}
                    className={`rounded-full h-10 w-10 flex items-center justify-center transition-all duration-200 ${
                      currentStep === 3
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    3
                  </button>
                  <span className="text-xs mt-2 text-gray-600">
                    Certificate
                  </span>
                </div>
                <div className="h-1 w-16 bg-blue-200 mx-2 mt-[-8px]"></div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => navigateStep(4)}
                    className={`rounded-full h-10 w-10 flex items-center justify-center transition-all duration-200 ${
                      currentStep === 4
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    4
                  </button>
                  <span className="text-xs mt-2 text-gray-600">Resolution</span>
                </div>
                <div className="h-1 w-16 bg-blue-200 mx-2 mt-[-8px]"></div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => navigateStep(5)}
                    className={`rounded-full h-10 w-10 flex items-center justify-center transition-all duration-200 ${
                      currentStep === 5
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    5
                  </button>
                  <span className="text-xs mt-2 text-gray-600">Test</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateStep(currentStep + 1)}
              disabled={currentStep === 5}
              className={`p-2 rounded-full ${
                currentStep === 5
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {currentStep === 1 ? (
          <ConfigStep />
        ) : currentStep === 2 ? (
          <VerificationStep />
        ) : currentStep === 3 ? (
          <CertificateStep />
        ) : currentStep === 4 ? (
          <ResolutionStep />
        ) : (
          <TestStep />
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default InvoiceConfiguration;
