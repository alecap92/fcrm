import React, { useState, useEffect } from "react";
import { useWorkflowStore } from "../store/workflow";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface NodeEditorProps {
  nodeId: string;
  type: string;
  data: any;
  onClose: () => void;
}

interface Variable {
  name: string;
  description: string;
  example: string;
}

interface ContactField {
  key: string;
  value: string;
}

const availableVariables: Variable[] = [
  {
    name: "{{deal._id}}",
    description: "Deal ID",
    example: "507f1f77bcf86cd799439011",
  },
  { name: "{{deal.name}}", description: "Deal Name", example: "Big Sale Q1" },
  {
    name: "{{contact.email}}",
    description: "Contact Email",
    example: "john@example.com",
  },
  {
    name: "{{contact.name}}",
    description: "Contact Name",
    example: "John Doe",
  },
  { name: "{{status}}", description: "Current Status", example: "approved" },
  {
    name: "{{organization.name}}",
    description: "Organization Name",
    example: "Acme Inc",
  },
];

const VariableSelector = ({
  onSelect,
}: {
  onSelect: (variable: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Insert Variable
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Available Variables
            </h4>
            <div className="space-y-2">
              {availableVariables.map((variable) => (
                <div
                  key={variable.name}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    onSelect(variable.name);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-mono text-blue-600">
                      {variable.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      e.g. {variable.example}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {variable.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para gestionar campos dinámicos
const DynamicContactFields = ({ 
  initialFields = {}, 
  onChange,
  insertVariable 
}: { 
  initialFields: Record<string, string>;
  onChange: (fields: Record<string, string>) => void;
  insertVariable: (fieldName: string, variable: string) => void;
}) => {
  // Convertir objeto a array de objetos con key y value
  const fieldsToArray = (obj: Record<string, string>): ContactField[] => {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  };

  // Inicializar los campos
  const [fields, setFields] = useState<ContactField[]>(
    Object.keys(initialFields).length > 0 
      ? fieldsToArray(initialFields)
      : [
          { key: "firstName", value: "{{data.firstName}}" },
          { key: "lastName", value: "{{data.lastName}}" },
          { key: "email", value: "{{data.email}}" },
          { key: "phone", value: "{{data.phone}}" },
          { key: "companyName", value: "{{data.company}}" }
        ]
  );
  
  // Efecto para notificar al componente padre sobre los campos iniciales
  useEffect(() => {
    if (Object.keys(initialFields).length === 0) {
      // Si no hay campos iniciales, actualizar con los predeterminados
      const defaultFields = fields.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
      }, {} as Record<string, string>);
      
      onChange(defaultFields);
    }
  }, []);
  
  // Manejar cambios en cualquier campo
  const handleFieldChange = (index: number, field: Partial<ContactField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
    
    // Convertir de nuevo a objeto para el callback
    const fieldsObject = newFields.reduce((obj, item) => {
      if (item.key) {
        obj[item.key] = item.value;
      }
      return obj;
    }, {} as Record<string, string>);
    
    onChange(fieldsObject);
  };
  
  // Añadir campo nuevo
  const addField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };
  
  // Eliminar campo
  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
    
    // Actualizar el objeto padre
    const fieldsObject = newFields.reduce((obj, item) => {
      if (item.key) {
        obj[item.key] = item.value;
      }
      return obj;
    }, {} as Record<string, string>);
    
    onChange(fieldsObject);
  };
  
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={field.key}
              onChange={(e) => handleFieldChange(index, { key: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              placeholder="Nombre del campo"
            />
          </div>
          <div className="flex-1 relative">
            <div className="absolute right-2 top-2 z-10">
              <VariableSelector
                onSelect={(v) => {
                  // Crear un ID único para el campo
                  const inputId = `contactData.${field.key}`;
                  insertVariable(inputId, v);
                  
                  // Actualizar el valor del campo con la variable seleccionada
                  const input = document.getElementById(inputId) as HTMLInputElement;
                  if (input) {
                    handleFieldChange(index, { value: input.value });
                  }
                }}
              />
            </div>
            <input
              id={`contactData.${field.key}`}
              type="text"
              value={field.value}
              onChange={(e) => handleFieldChange(index, { value: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              placeholder="Valor o variable"
            />
          </div>
          <button
            type="button"
            onClick={() => removeField(index)}
            className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            ✕
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addField}
        className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center justify-center"
      >
        + Añadir campo
      </button>
    </div>
  );
};

export const NodeEditor: React.FC<NodeEditorProps> = ({
  nodeId,
  type,
  data,
  onClose,
}) => {
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    data.date ? new Date(data.date) : null
  );
  
  // Detectar cambios en el tipo de nodo y sus datos
  useEffect(() => {
    // Si es un nodo de contactos y no tiene acción definida, establecer "create" por defecto
    if (type === "contacts" && !data.action) {
      updateNode(nodeId, { action: "create" });
    }
  }, [type, nodeId, data.action, updateNode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates: Record<string, string> = {};

    formData.forEach((value, key) => {
      updates[key] = value as string;
    });

    // Asegurar que delayMinutes se actualice si estamos trabajando con un nodo delay
    if (type === "delay" && updates.duration) {
      updates.delayMinutes = updates.duration;
    }

    if (type === "datetime" && selectedDate) {
      updates.date = selectedDate.toISOString();
      updates.formattedDate = format(selectedDate, "PPpp");
    }

    updateNode(nodeId, updates);
    onClose();
  };

  const insertVariable = (fieldName: string, variable: string) => {
    const textarea = document.querySelector(
      `[name="${fieldName}"]`
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);

      textarea.value = before + variable + after;
      textarea.focus();
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
    }
  };

  const renderFields = () => {
    switch (type) {
      case "trigger":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trigger Type
              </label>
              <select
                name="triggerType"
                defaultValue={data.triggerType}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="webhook">Webhook</option>
                <option value="schedule">Schedule</option>
                <option value="database">Database Change</option>
              </select>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Recipient
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("recipient", v)}
                />
              </div>
              <input
                type="text"
                name="recipient"
                defaultValue={data.recipient}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="recipient@example.com or {{contact.email}}"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("subject", v)}
                />
              </div>
              <input
                type="text"
                name="subject"
                defaultValue={data.subject}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Email subject"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("content", v)}
                />
              </div>
              <textarea
                name="content"
                defaultValue={data.content}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Email content..."
              />
            </div>
          </div>
        );

      case "mass_email":
      case "send_mass_email":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Lista de Contactos ID
                </label>
              </div>
              <input
                type="text"
                name="listId"
                defaultValue={data.listId}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="ID de la lista de contactos"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Correo Remitente
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("from", v)}
                />
              </div>
              <input
                type="email"
                name="from"
                defaultValue={data.from}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="nombre@tudominio.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Asunto
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("subject", v)}
                />
              </div>
              <input
                type="text"
                name="subject"
                defaultValue={data.subject}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Asunto del correo masivo"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Contenido
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("emailBody", v)}
                />
              </div>
              <textarea
                name="emailBody"
                defaultValue={data.emailBody}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="<p>Hola {{contact.firstName}}, este es el contenido del correo...</p>"
              />
              <p className="mt-1 text-xs text-gray-500">
                Puedes usar variables como ${`{{contact.firstName}} {{contact.email}}`}, etc.
              </p>
            </div>
          </div>
        );

      case "massiveMail":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Lista de Destinatarios (ID)
                </label>
              </div>
              <input
                type="text"
                name="listId"
                defaultValue={data.listId}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="ID de la lista de contactos"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Remitente (From)
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("from", v)}
                />
              </div>
              <input
                type="email"
                name="from"
                defaultValue={data.from}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="nombre@tudominio.com o {{user.email}}"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Asunto
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("subject", v)}
                />
              </div>
              <input
                type="text"
                name="subject"
                defaultValue={data.subject}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Asunto del correo masivo"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Contenido del Email
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("emailBody", v)}
                />
              </div>
              <textarea
                name="emailBody"
                defaultValue={data.emailBody}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="<p>Hola {{contact.firstName}}, este es el contenido del correo...</p>"
              />
              <p className="mt-1 text-xs text-gray-500">
                Puedes usar variables como ${`{{contact.firstName}} {{contact.email}}`}, etc.
              </p>
            </div>
          </div>
        );

      case "whatsapp":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("recipient", v)}
                />
              </div>
              <input
                type="tel"
                name="recipient"
                defaultValue={data.recipient}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="+1234567890 or {{contact.phone}}"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("message", v)}
                />
              </div>
              <textarea
                name="message"
                defaultValue={data.message}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="WhatsApp message..."
              />
            </div>
          </div>
        );

      case "webhook_trigger":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre del Webhook
              </label>
              <input
                type="text"
                name="webhookName"
                defaultValue={data.webhookName || "Webhook para creación de contactos"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Nombre descriptivo para el webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="webhookDescription"
                defaultValue={data.webhookDescription || "Recibe datos de formularios externos y crea contactos"}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Descripción del propósito del webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre del Evento
              </label>
              <input
                type="text"
                name="event"
                defaultValue={data.event || "contact_form"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Ej: contact_form, lead_form, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Módulo
              </label>
              <input
                type="text"
                name="module"
                value="webhook"
                readOnly
                className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            
            {data.webhookId ? (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <h4 className="font-medium text-sm mb-2">Webhook configurado</h4>
                <p className="text-xs text-gray-600 mb-1">ID: {data.webhookId}</p>
                <p className="text-xs text-gray-600">Endpoint: 
                  <code className="ml-1 bg-gray-100 px-1 py-0.5 rounded">
                    http://localhost:3001/api/v1/webhooks/id/{data.webhookId}
                  </code>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Puede probar el webhook enviando datos vía POST a este endpoint.
                </p>
                <div className="mt-3 p-2 bg-blue-50 rounded">
                  <p className="text-xs text-blue-700">Ejemplo de payload:</p>
                  <pre className="text-xs bg-blue-100 p-2 rounded mt-1 overflow-auto">
                {`{
                  "data": {
                    "firstName": "Pedro",
                    "lastName": "Pérez",
                    "email": "pedro.perez@ejemplo.com",
                    "phone": "123456789",
                    "company": "Empresa ABC"
                  }
                }`}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Nota:</span> El webhook se creará automáticamente cuando guarde la automatización.
                </p>
              </div>
            )}
          </div>
        );

      case "contacts":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Acción
              </label>
              <select
                name="action"
                defaultValue={data.action || "create"}
                onChange={(e) => updateNode(nodeId, { action: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="create">Crear contacto</option>
                <option value="update">Actualizar contacto</option>
                <option value="find">Buscar contacto</option>
              </select>
            </div>

            {(data.action === "create" || data.action === "update") ? (
              <>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Datos del contacto</h3>
                  
                  <DynamicContactFields
                    initialFields={data.contactData || {}}
                    onChange={(fields) => {
                      // Actualizar el objeto de datos del contacto
                      updateNode(nodeId, { contactData: fields });
                    }}
                    insertVariable={(fieldName, variable) => {
                      insertVariable(fieldName, variable);
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-500 italic">
                  Puedes usar variables como contact.firstName, contact.email, etc. Los datos vendrán del payload del webhook.
                </p>
              </>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    ID del Contacto
                  </label>
                  <VariableSelector
                    onSelect={(v) => insertVariable("contact", v)}
                  />
                </div>
                <input
                  type="text"
                  name="contact"
                  defaultValue={data.contact}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="ID del contacto o {{variable}}"
                />
              </div>
            )}
          </div>
        );

      case "http":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <VariableSelector onSelect={(v) => insertVariable("url", v)} />
              </div>
              <input
                type="url"
                name="url"
                defaultValue={data.url}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Method
              </label>
              <select
                name="method"
                defaultValue={data.method || "GET"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Headers
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("headers", v)}
                />
              </div>
              <textarea
                name="headers"
                defaultValue={data.headers}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder='{"Content-Type": "application/json"}'
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Body
                </label>
                <VariableSelector onSelect={(v) => insertVariable("body", v)} />
              </div>
              <textarea
                name="body"
                defaultValue={data.body}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Request body..."
              />
            </div>
          </div>
        );

      case "condition":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Condition
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("condition", v)}
                />
              </div>
              <textarea
                name="condition"
                defaultValue={data.condition}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="{{contact.email}} !== undefined"
              />
            </div>
          </div>
        );

      case "datetime":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Action Type
              </label>
              <select
                name="actionType"
                defaultValue={data.actionType || "delay"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="delay">Delay</option>
                <option value="schedule">Schedule for Date</option>
                <option value="businessHours">Check Business Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date and Time
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholderText="Select date and time"
              />
            </div>
            {data.actionType === "businessHours" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs text-gray-500">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="businessHoursStart"
                      defaultValue={data.businessHoursStart || "09:00"}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="businessHoursEnd"
                      defaultValue={data.businessHoursEnd || "17:00"}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Working Days
                  </label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <label key={day} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name={`workingDays.${day.toLowerCase()}`}
                            defaultChecked={
                              data.workingDays?.[day.toLowerCase()] ??
                              ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day)
                            }
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            {day}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "deals_trigger":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Pipeline
              </label>
              <select
                name="pipeline"
                defaultValue={data.pipeline}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select From Stage
              </label>
              <select
                name="stage"
                defaultValue={data.stage}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="prospecting">Prospecting</option>
                <option value="negotiation">Negotiation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select To Stage
              </label>
              <select
                name="toStage"
                defaultValue={data.toStage}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="prospecting">Prospecting</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed">Closed</option>
                <option value="won">Won</option>
              </select>
            </div>
          </div>
        );

      case "delay":
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delay Duration (in minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="duration"
                  defaultValue={data.duration || 5}
                  min="1"
                  className="pl-3 pr-12 py-2.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Enter minutes (e.g., 10)"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-sm">
                  <span>minutes</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter a positive whole number of minutes (e.g., 5, 10, 30)
              </p>
              <input
                type="hidden"
                name="delayMinutes"
                value={data.duration || 5}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">
              No fields available for this node type. Check the node type
            </p>
          </div>
        );
    }
  };

  return (
    <div className=" inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Configure {type}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">{renderFields()}</div>
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
