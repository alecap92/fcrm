import React from "react";
import { Modal } from "../ui/modal";
import { Bot, Play, Settings, Clock } from "lucide-react";

interface N8nModalProps {
  isOpen: boolean;
  onClose: () => void;
  n8nAutomation?: {
    _id: string;
    name: string;
    endpoint: string;
    type: "n8n";
    createdAt: string;
  };
}

export const N8nModal: React.FC<N8nModalProps> = ({
  isOpen,
  onClose,
  n8nAutomation,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        n8nAutomation
          ? `N8N: ${n8nAutomation.name}`
          : "Nueva Automatización N8N"
      }
      modalSize="XL"
    >
      <div className="space-y-6">
        {/* Header con información de la automatización N8n */}
        {n8nAutomation && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {n8nAutomation.name}
                </h4>
                <p className="text-sm text-gray-600 break-all">
                  <strong>Endpoint:</strong> {n8nAutomation.endpoint}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Creada:{" "}
                  {new Date(n8nAutomation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  N8N
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Contenido del flujo de automatización */}
        <div className="space-y-4">
          <h5 className="text-md font-semibold text-gray-900">
            Flujo de Automatización
          </h5>

          {/* Nodos del flujo */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Trigger: Nuevo mensaje
                </p>
                <p className="text-xs text-gray-600">
                  Se activa cuando llega un nuevo mensaje
                </p>
              </div>
              <Play className="w-4 h-4 text-blue-600" />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Procesar contenido
                </p>
                <p className="text-xs text-gray-600">
                  Analiza el contenido del mensaje
                </p>
              </div>
              <Settings className="w-4 h-4 text-green-600" />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Crear contacto
                </p>
                <p className="text-xs text-gray-600">
                  Genera un nuevo contacto en el sistema
                </p>
              </div>
              <Bot className="w-4 h-4 text-purple-600" />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Enviar respuesta
                </p>
                <p className="text-xs text-gray-600">
                  Confirma la creación del contacto
                </p>
              </div>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="text-md font-semibold text-gray-900 mb-3">
            Estadísticas
          </h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-xs text-gray-600">Ejecuciones hoy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">98%</p>
              <p className="text-xs text-gray-600">Tasa de éxito</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">2.3s</p>
              <p className="text-xs text-gray-600">Tiempo promedio</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Editar Automatización
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default N8nModal;
