import React from "react";
import { Tag, X } from "lucide-react";

interface TagsSectionProps {
  tags: string[];
  newTag: string;
  onNewTagChange: (value: string) => void;
  onAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onDeleteTag: (tag: string) => void;
}

export const TagsSection: React.FC<TagsSectionProps> = ({
  tags,
  newTag,
  onNewTagChange,
  onAddTag,
  onDeleteTag,
}) => {
  return (
    <div className="mt-4 pb-4 px-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Tag className="w-4 h-4 text-gray-500 mr-2" />
          <h4 className="font-medium text-gray-900">Etiquetas</h4>
        </div>
      </div>

      {/* Input para añadir nueva etiqueta */}
      <div className="mb-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => onNewTagChange(e.target.value)}
          onKeyDown={onAddTag}
          placeholder="Añadir etiqueta y presionar Enter"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center"
          >
            {tag}
            <button
              onClick={() => onDeleteTag(tag)}
              className="ml-1 text-blue-500 hover:text-red-500"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
