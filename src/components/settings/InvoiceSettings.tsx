import { useState } from 'react';
import { Save, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useSettingsStore } from '../../store/settingsStore';
import { format } from 'date-fns';

export function InvoiceSettings() {
  const { invoiceConfig, updateInvoiceConfig } = useSettingsStore();
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Save invoice settings logic here
    setHasChanges(false);
  };

  const handleChange = (field: string, value: string | number) => {
    updateInvoiceConfig({ [field]: value });
    setHasChanges(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de Facturación
      </h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Resolución de Facturación
              </h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Resolución
                  </label>
                  <input
                    type="date"
                    value={invoiceConfig?.resolutionDate || format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => handleChange('resolutionDate', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Resolución
                  </label>
                  <input
                    type="text"
                    value={invoiceConfig?.resolutionNumber || ''}
                    onChange={(e) => handleChange('resolutionNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Ej: 18764000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prefijo
                  </label>
                  <input
                    type="text"
                    value={invoiceConfig?.prefix || ''}
                    onChange={(e) => handleChange('prefix', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Ej: SETP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Clave Técnica
                  </label>
                  <input
                    type="text"
                    value={invoiceConfig?.technicalKey || ''}
                    onChange={(e) => handleChange('technicalKey', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Clave técnica de la DIAN"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Rango de Numeración
              </h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Desde
                  </label>
                  <input
                    type="number"
                    value={invoiceConfig?.from || ''}
                    onChange={(e) => handleChange('from', Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hasta
                  </label>
                  <input
                    type="number"
                    value={invoiceConfig?.to || ''}
                    onChange={(e) => handleChange('to', Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={invoiceConfig?.dateFrom || ''}
                    onChange={(e) => handleChange('dateFrom', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={invoiceConfig?.dateTo || ''}
                    onChange={(e) => handleChange('dateTo', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Estado Actual
              </h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Facturas generadas hasta la fecha:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {invoiceConfig?.generatedToDate || 0}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-action h-2 rounded-full"
                    style={{
                      width: `${Math.min(((invoiceConfig?.generatedToDate || 0) / (invoiceConfig?.to || 1)) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {invoiceConfig?.to && invoiceConfig?.generatedToDate
                    ? `${invoiceConfig.to - invoiceConfig.generatedToDate} facturas disponibles en el rango actual`
                    : 'Configure el rango de numeración para ver las facturas disponibles'}
                </p>
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