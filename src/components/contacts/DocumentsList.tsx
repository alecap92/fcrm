import { File, PlusCircle, X } from "lucide-react";

type Document = {
  _id?: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
};

type DocumentsListProps = {
  documents: Document[];
  onPreview: (doc: Document) => void;
  onDelete: (id: string) => void;
  onOpenUpload: () => void;
  title?: string;
};

export default function DocumentsList({ documents, onPreview, onDelete, onOpenUpload, title = "Documentos" }: DocumentsListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <button
          onClick={onOpenUpload}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors hover:scale-105"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
      {documents.length === 0 && <p className="text-gray-500">No hay documentos</p>}
      {documents.length > 0 &&
        documents.map((document) => (
          <div className="space-y-4" key={document._id}>
            <div className="flex items-center justify-between">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => onPreview(document)}
              >
                <File className="h-5 w-5 text-gray-400" />
                <p className="text-gray-700">{document.name}</p>
              </div>
              {document._id ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document._id!);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        ))}
    </div>
  );
}


