import React from "react";
import { Facebook } from "lucide-react";
import { Button } from "../ui/button";

interface OnboardingViewProps {
  handleConnect: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  handleConnect,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Social Media Accounts
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            To start planning and scheduling your content, connect your social
            media accounts first.
          </p>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Conecta tu facebook
                  </h3>
                  <p className="text-sm text-gray-500">
                    Debes iniciar sesion y otorgar los accesos para conectar tu
                    cuenta de facebook e instagram. Asi podremos publicar
                    contenido desde acá.
                  </p>
                </div>
              </div>
              <Button onClick={handleConnect}>Conectar</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
