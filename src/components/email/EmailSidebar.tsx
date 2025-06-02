import React from "react";
import { Button } from "../ui/button";
import {
  Plus,
  Inbox,
  Send,
  Star,
  Archive,
  Trash2,
  Clock,
  AlertCircle,
  Folder,
} from "lucide-react";
import type { EmailFolder, EmailLabel } from "../../types/email";

interface EmailSidebarProps {
  folders: EmailFolder[];
  labels: EmailLabel[];
  selectedFolder: string;
  onSelectFolder: (folderId: string) => void;
  onCompose: () => void;
}

// Mapeo de iconos por defecto para carpetas
const defaultIcons: { [key: string]: React.ComponentType<any> } = {
  INBOX: Inbox,
  SENT: Send,
  STARRED: Star,
  ARCHIVE: Archive,
  TRASH: Trash2,
  DRAFTS: Clock,
  SPAM: AlertCircle,
};

export function EmailSidebar({
  folders,
  labels,
  selectedFolder,
  onSelectFolder,
  onCompose,
}: EmailSidebarProps) {
  return (
    <div className="w-64 bg-white border-r p-4 hidden lg:block">
      <Button className="w-full mb-6" onClick={onCompose}>
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Correo
      </Button>

      <nav>
        <div className="space-y-1">
          {folders.map((folder) => {
            // Usar el icono del folder o uno por defecto basado en el ID
            const Icon = folder.icon || defaultIcons[folder.id] || Folder;
            const isSelected = selectedFolder === folder.id;
            const hasCount = folder.count && folder.count > 0;

            return (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    isSelected
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                {hasCount && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {labels && labels.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Etiquetas
            </h3>
            <div className="space-y-1">
              {labels.map((label) => {
                const hasCount = label.count && label.count > 0;

                return (
                  <button
                    key={label.id}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="flex-1 text-left truncate">
                      {label.name}
                    </span>
                    {hasCount && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        {label.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
