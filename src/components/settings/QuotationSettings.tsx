import { useState } from 'react';
import { Save, FileText, Image as ImageIcon, Type } from 'lucide-react';
import { Button } from '../ui/button';
import { useSettingsStore } from '../../store/settingsStore';

export function QuotationSettings() {
  const { quotationConfig, updateQuotationConfig } = useSettingsStore();
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Save quotation settings logic here
    setHasChanges(false);
  };

  const handleChange = (field: string, value: string) => {
    updateQuotationConfig({ [field]: value });
    setHasChanges(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de Cotizaciones
      </h2>

      <div className="space-y-6">
        {/* Basic Configuration */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Configuración Básica
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Formato de Numeración
                  </label>
                  <input
                    type="text"
                    value={quotationConfig?.quotationNumber || ''}
                    onChange={(e) => handleChange('quotationNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Ej: QT-{YEAR}-{NUMBER}"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Variables disponibles: {'{YEAR}'}, {'{MONTH}'}, {'{NUMBER}'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Términos de Pago Predeterminados
                  </label>
                  <textarea
                    value={quotationConfig?.paymentTerms || ''}
                    onChange={(e) => handleChange('paymentTerms', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Ej: 50% de anticipo, 50% contra entrega"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Términos de Envío Predeterminados
                  </label>
                  <textarea
                    value={quotationConfig?.shippingTerms || ''}
                    onChange={(e) => handleChange('shippingTerms', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Ej: Entrega en 5-7 días hábiles"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Configuration */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Type className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Plantilla de Cotización
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notas Predeterminadas
                  </label>
                  <textarea
                    value={quotationConfig?.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Notas que aparecerán por defecto en las cotizaciones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Texto del Pie de Página
                  </label>
                  <textarea
                    value={quotationConfig?.footerText || ''}
                    onChange={(e) => handleChange('footerText', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Texto que aparecerá en el pie de página de todas las cotizaciones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen de Fondo
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    {quotationConfig?.bgImage && (
                      <div className="relative w-32 h-32">
                        <img
                          src={quotationConfig.bgImage}
                          alt="Background"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                          onClick={() => handleChange('bgImage', '')}
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="url"
                        value={quotationConfig?.bgImage || ''}
                        onChange={(e) => handleChange('bgImage', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                        placeholder="URL de la imagen de fondo"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ingresa la URL de una imagen para usarla como marca de agua en las cotizaciones
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}