import { useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, mapping: Record<string, string>) => void;
}

export default function ImportContactsModal({
  isOpen,
  onClose,
  onImport,
}: ImportContactsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mappingJson, setMappingJson] = useState<string>(`{
  "Nombre": "firstName",
  "Apellidos": "lastName",
  "Correo": "email",
  "Número de teléfono de WhatsApp": "mobile",
  "Tipo de empresa": "companyName",
  "Estado o región": "state",
  "Ciudad": "city",
  "Origen": "source"
}`);
  const [mappingError, setMappingError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateFile(selectedFile);
    }
  };

  const validateFile = (selectedFile: File) => {
    setError(null);

    // Verificar tipo de archivo (CSV o Excel)
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Por favor selecciona un archivo CSV o Excel (.xlsx, .xls)");
      return;
    }

    // Verificar tamaño (máximo 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande. El tamaño máximo es 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const validateMapping = (): Record<string, string> | null => {
    setMappingError(null);
    try {
      const mapping = JSON.parse(mappingJson);
      if (typeof mapping !== "object" || mapping === null) {
        setMappingError("El mapeo debe ser un objeto JSON válido");
        return null;
      }
      return mapping;
    } catch (e) {
      setMappingError(
        "El JSON de mapeo no es válido. Por favor, verifica la sintaxis."
      );
      return null;
    }
  };

  const handleSubmit = () => {
    if (file) {
      const mapping = validateMapping();
      if (mapping) {
        onImport(file, mapping);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Contactos">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Formato de archivo</p>
            <p>
              El archivo debe ser CSV o Excel con las columnas que coincidan con
              las propiedades del mapeo.
            </p>
            <p className="mt-2">
              <a
                href="/template/contacts_import_template.xlsx"
                download
                className="text-blue-600 underline hover:text-blue-800"
              >
                Descargar plantilla de ejemplo
              </a>
            </p>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-action bg-action/5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">
            Arrastra tu archivo aquí o
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Acepta archivos CSV y Excel (máximo 5MB)
          </p>

          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-action rounded-md shadow-sm hover:bg-action/90">
                Seleccionar archivo
              </span>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {error}
          </div>
        )}

        {file && (
          <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="font-medium text-gray-900">{file.name}</div>
              <div className="text-sm text-gray-500 ml-2">
                ({(file.size / 1024).toFixed(0)} KB)
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              className="text-gray-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mapeo de campos <span className="text-red-500">*</span>
          </label>
          <div className="text-xs text-gray-500 mb-2">
            Define cómo se mapean las columnas del archivo a los campos de
            contacto.
          </div>
          <textarea
            value={mappingJson}
            onChange={(e) => setMappingJson(e.target.value)}
            className="w-full h-48 font-mono text-sm p-3 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Introduce el mapeo JSON"
            required
          />
          {mappingError && (
            <div className="text-sm text-red-600 mt-1">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {mappingError}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!file}>
            Importar Contactos
          </Button>
        </div>
      </div>
    </Modal>
  );
}
