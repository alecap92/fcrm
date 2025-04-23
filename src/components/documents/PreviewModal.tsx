import React from 'react';
import { X, FileText, AlertCircle, Download } from 'lucide-react';
import { Document } from '../../types/documents';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function PreviewModal({ isOpen, onClose, document }: PreviewModalProps) {
  if (!isOpen || !document) return null;
  console.log("document", document);
  const getFileType = (type: string): string => {
    // Normalizar el tipo de archivo para el manejo correcto
    const fileType = type.toLowerCase();
    
    // Manejar tipos MIME
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('image/')) return 'image';
    if (fileType.includes('word') || fileType.includes('doc')) return 'doc';
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) return 'xls';
    if (fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('ppt')) return 'ppt';
    
    // Manejar extensiones de archivo
    const extensionMatch = document.name.match(/\.([^.]+)$/);
    if (extensionMatch) {
      const extension = extensionMatch[1].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
      if (['pdf'].includes(extension)) return 'pdf';
      if (['doc', 'docx'].includes(extension)) return 'doc';
      if (['xls', 'xlsx', 'csv'].includes(extension)) return 'xls';
      if (['ppt', 'pptx'].includes(extension)) return 'ppt';
    }
    
    // Tipo por defecto
    return fileType;
  };

  const getPreviewContent = () => {
    const fileType = getFileType(document.type);
    
    // Determinar si el archivo es una imagen
    if (fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileType)) {
      return (
        <div className="flex flex-col items-center">
          <img
            src={document.fileURL || document.url}
            alt={document.name}
            className="max-w-full h-auto rounded-lg max-h-[600px] object-contain"
          />
        </div>
      );
    }
    
    // Documentos PDF
    if (fileType === 'pdf' || document.type === 'application/pdf') {
      return (
        <embed
          src={document.fileURL || document.url}
          type="application/pdf"
          width="100%"
          height="600px"
          className="rounded-lg"
        />
      );
    }
    
    // Documentos de Office
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType)) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.fileURL)}`}
          width="100%"
          height="600px"
          className="rounded-lg"
        />
      );
    }
    
    // Para otros tipos de archivos que no pueden ser previsualizados
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <FileText className="w-16 h-16 text-blue-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{document.name}</h3>
        <div className="text-sm text-gray-500 space-y-2">
          <p className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            La previsualización no está disponible para este tipo de archivo
          </p>
          <div className="flex flex-col items-center gap-1 pt-4">
            <p>Detalles del archivo:</p>
            <p>Tipo: {document.type}</p>
            <p>Tamaño: {(document.size/1000000).toFixed(2)} MB</p>
            <p>Subido por: {document.uploadedBy.email}</p>
            <p>Fecha: {new Date(document.uploadDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Previsualización de documento
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {getPreviewContent()}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <a
            href={document.fileURL}
            download={document.name}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
} 