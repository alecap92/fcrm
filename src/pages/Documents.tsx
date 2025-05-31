import React, { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Trash2,
  Share2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { UploadModal } from "../components/documents/UploadModal";
import { PreviewModal } from "../components/documents/PreviewModal";
import documentsService from "../services/documentsService";
import { Document } from "../types/documents";
import { useAuth } from "../contexts/AuthContext";

export function Documents() {
  const { user, organization } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    type: "success" | "error" | "info" | null;
  }>({ message: "", type: null });

  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus({ message: "Subiendo documentos...", type: "info" });

    try {
      // Para subir un solo archivo
      if (files.length === 1) {
        const file = files[0];

        const formData = new FormData();

        // Usar el nombre 'file' como clave para asegurarse que el backend lo reconoce
        formData.append("file", file);
        formData.append("organizationId", organization?._id || "");
        formData.append("uploadedBy", user?._id || "");

        // Log para verificar que formData contiene el archivo
        console.log("FormData creado:", formData);

        // Log para ver el contenido del FormData (verificación adicional)
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }

        // Asegurarse de que no se está transformando el formData en JSON
        const response = await documentsService.uploadDocument(formData);
        console.log("Respuesta del servidor:", response);

        setUploadStatus({
          message: "Documento subido correctamente",
          type: "success",
        });

        // Actualizar la lista de documentos
        loadDocuments();
      }
      // Para subir múltiples archivos
      else {
        let successCount = 0;

        // Subir cada archivo secuencialmente
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("file", file);

          setUploadStatus({
            message: `Subiendo archivo ${i + 1} de ${files.length}...`,
            type: "info",
          });

          try {
            await documentsService.uploadDocument(formData);
            successCount++;
          } catch (error) {
            console.error(`Error al subir archivo ${file.name}:`, error);
          }
        }

        setUploadStatus({
          message: `${successCount} de ${files.length} documentos subidos correctamente`,
          type: "success",
        });

        // Actualizar la lista de documentos
        loadDocuments();
      }
    } catch (error) {
      console.error("Error al subir el documento:", error);
      setUploadStatus({
        message: "Error al subir el documento. Por favor, inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      setIsUploading(false);

      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setUploadStatus({ message: "", type: null });
      }, 5000);
    }
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setIsPreviewModalOpen(true);
  };

  const handleDelete = async (docId: string) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este documento?")
    ) {
      try {
        await documentsService.deleteDocument(docId);
        loadDocuments();
        setUploadStatus({
          message: "Documento eliminado correctamente",
          type: "success",
        });
        setTimeout(() => {
          setUploadStatus({ message: "", type: null });
        }, 5000);
      } catch (error) {
        console.error("Error al eliminar el documento:", error);
        setUploadStatus({
          message: "Error al eliminar el documento",
          type: "error",
        });
      }
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  const loadDocuments = async () => {
    try {
      if (!organization?._id) {
        console.warn("No organization ID available");
        return;
      }

      const response: any = await documentsService.getDocuments(
        organization._id
      );
      if (response && response.data) {
        setDocuments(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error al cargar los documentos:", error);
    }
  };

  useEffect(() => {
    if (organization?._id) {
      loadDocuments();
    }
  }, [organization?._id]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {uploadStatus.message && uploadStatus.type && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              uploadStatus.type === "success"
                ? "bg-green-50 text-green-800"
                : uploadStatus.type === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : uploadStatus.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <span>{uploadStatus.message}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Documents
              </h1>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isUploading ? "Subiendo..." : "Upload Document"}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Size
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Uploaded By
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Upload Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No hay documentos disponibles. Sube un documento para
                      comenzar.
                    </td>
                  </tr>
                ) : (
                  documents?.map((doc) => (
                    <tr
                      key={doc._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <span className="text-sm text-gray-900">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {(doc.size / 1000000).toFixed(2)} MB
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {doc.uploadedBy.email}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {new Date(doc.uploadDate).toLocaleDateString(
                            "es-CO",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {doc.status.charAt(0).toUpperCase() +
                            doc.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreview(doc)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={doc.fileURL}
                            download={doc.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{documents?.length || 0}</span> of{" "}
                <span className="font-medium">{documents?.length || 0}</span>{" "}
                documents
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        document={selectedDocument}
      />
    </div>
  );
}
