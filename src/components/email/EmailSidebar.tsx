import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import type { EmailFolder, EmailLabel } from '../../types/email';

interface EmailSidebarProps {
  folders: EmailFolder[];
  labels: EmailLabel[];
  selectedFolder: string;
  onSelectFolder: (folderId: string) => void;
  onCompose: () => void;
}

export function EmailSidebar({
  folders,
  labels,
  selectedFolder,
  onSelectFolder,
  onCompose,
}: EmailSidebarProps) {
  return (
    <div className="w-64 bg-white border-r p-4 hidden lg:block">
      <Button
        className="w-full mb-6"
        onClick={onCompose}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Correo
      </Button>

      <nav>
        <div className="space-y-1">
          {folders.map((folder) => {
            const Icon = folder.icon;
            return (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                  ${selectedFolder === folder.id
                    ? 'bg-action/10 text-action'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{folder.name}</span>
                {folder.count && (
                  <span className="bg-action/10 text-action px-2 py-0.5 rounded-full text-xs">
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Etiquetas
          </h3>
          <div className="mt-2 space-y-1">
            {labels.map((label) => (
              <button
                key={label.id}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1 text-left">{label.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}