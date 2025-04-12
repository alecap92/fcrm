import { Loader2, Play, Plus, Power, RefreshCcw } from "lucide-react";
import { Button } from "../../ui/button";
import useInvoiceConfigStore from "../../../store/invoiceConfigStore";
import { invoiceConfigService } from "../../../services/invoiceConfigService";
import { useState } from "react";

const Actions = () => {
  const invoiceConfig = useInvoiceConfigStore((state) => state.invoiceConfig);
  const [isLoading, setIsLoading] = useState(false)

  const handleTestInvoice = () => {
    // Aquí iría la lógica para enviar la factura de prueba
    console.log('Enviando factura de prueba...');
  };

  const handleToggleEnvironment = () => {
    // Aquí iría la lógica para cambiar el entorno
    console.log('Cambiando entorno...');
  };

  const handleCreateCompany = async () => {
    try{
      setIsLoading(true)
      const response = await invoiceConfigService.createCompany({organizationId: 'organization._id'})
      console.log(response)
      
      alert('Empresa creada correctamente')
    } catch (error) {
      console.error(error)
      alert('Error al crear la empresa')
    } finally {
      setIsLoading(false)
    }
  }

  const actions = [
    {
      name: 'Crear empresa',
      description: 'Crea una nueva empresa en el micro servicio de facturación',
      action: (
        <Button
          onClick={handleCreateCompany}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear empresa
        </Button>
      )
    },
    {
      name: 'Enviar factura de prueba',
      description: 'Envía una factura de prueba al ambiente actual para verificar la configuración',
      action: (
        <Button
          onClick={handleTestInvoice}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          Enviar prueba
        </Button>
      )
    },
    {
      name: 'Cambiar a modo Producción',
      description: 'Cambia el ambiente de trabajo entre pruebas y producción',
      action: (
        <Button
          onClick={handleToggleEnvironment}
          className={`${
            invoiceConfig.status 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          <Power className="w-4 h-4 mr-2" />
          { invoiceConfig.status  ? 'Cambiar a Pruebas' : 'Cambiar a Producción'}
        </Button>
      )
    },
    {
      name: 'Actualizar resolución',
      description: 'Actualiza la resolución de facturación con los nuevos datos',
      action: (
        <Button
          onClick={() => console.log('Actualizando resolución...')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Actualizar resolución
        </Button>
      )
    },
    
  ];

  return (
    <div className="space-y-8">
      {isLoading && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>}
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Power className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 ml-3">
            Acciones
          </h3>
          <p className="text-sm text-gray-500 ml-3">
            Realice acciones sobre la configuración de facturación
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actividad
              </th> 
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actions.map((action, index) => (
              <tr key={index}>
             
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <h5 className="text-sm font-medium text-gray-900">
                    {action.name}
                  </h5>
                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {action.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Actions;