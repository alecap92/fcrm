import React, { useState } from "react";
import { Modal } from "../../ui/modal";
import { Button } from "../../ui/button";
import { N8nAutomation } from "../../../services/n8nService";

interface AutomationDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation: N8nAutomation | null;
  onSubmit: (data: string) => void;
  isSubmitting?: boolean;
}

export const AutomationDataModal: React.FC<AutomationDataModalProps> = ({
  isOpen,
  onClose,
  automation,
  onSubmit,
  isSubmitting = false,
}) => {
  const [data, setData] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.trim()) {
      onSubmit(data.trim());
    }
  };

  const handleClose = () => {
    setData("");
    onClose();
  };

  if (!automation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Ejecutar automatización: ${automation.name}`}
      modalSize="L"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información requerida
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Esta automatización requiere información adicional para
                  ejecutarse. Por favor, proporciona los datos necesarios en el
                  campo de texto a continuación.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="automation-data"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Datos para la automatización
            </label>
            <textarea
              id="automation-data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Ingresa la información requerida para esta automatización..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={6}
              required
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              {data.length} caracteres
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!data.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ejecutando...
                </>
              ) : (
                "Ejecutar automatización"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AutomationDataModal;
