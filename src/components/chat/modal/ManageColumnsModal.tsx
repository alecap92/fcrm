import React from "react";
import { X, GripVertical, Edit } from "lucide-react";
import { Button } from "../../ui/button";

interface Column {
  id: string;
  title: string;
  color: string;
}

interface ColorOption {
  id: string;
  label: string;
}

interface ManageColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  onColumnRemove: (columnId: string) => void;
  onColumnAdd: (title: string, color: string) => void;
  onColumnEdit: (columnId: string, title: string, color: string) => void;
  onColumnsReorder: (newColumns: Column[]) => void;
}

const colorOptions: ColorOption[] = [
  { id: "bg-gray-100", label: "Gris" },
  { id: "bg-blue-50", label: "Azul" },
  { id: "bg-red-50", label: "Rojo" },
  { id: "bg-green-50", label: "Verde" },
  { id: "bg-yellow-50", label: "Amarillo" },
  { id: "bg-purple-50", label: "Morado" },
  { id: "bg-pink-50", label: "Rosa" },
  { id: "bg-indigo-50", label: "Índigo" },
];

const ManageColumnsModal: React.FC<ManageColumnsModalProps> = ({
  isOpen,
  onClose,
  columns,
  onColumnRemove,
  onColumnAdd,
  onColumnEdit,
  onColumnsReorder,
}) => {
  const [newColumnTitle, setNewColumnTitle] = React.useState("");
  const [newColumnColor, setNewColumnColor] = React.useState("bg-gray-100");
  const [draggedColumnIndex, setDraggedColumnIndex] = React.useState<
    number | null
  >(null);
  const [activeColumn, setActiveColumn] = React.useState<Column | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleColumnDragStart = (index: number) => {
    setDraggedColumnIndex(index);
  };

  const handleColumnDragOver = (index: number) => {
    if (draggedColumnIndex === null) return;
    if (draggedColumnIndex === index) return;

    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedColumnIndex, 1);
    newColumns.splice(index, 0, draggedColumn);

    setDraggedColumnIndex(index);
    onColumnsReorder(newColumns);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    onColumnAdd(newColumnTitle, newColumnColor);
    setNewColumnTitle("");
    setNewColumnColor("bg-gray-100");
  };

  const handleSelectColumn = (column: Column) => {
    setActiveColumn(column);
    setNewColumnTitle(column.title);
    setNewColumnColor(column.color);
    setIsEditing(true);
  };

  const handleEditColumn = () => {
    if (!activeColumn || !newColumnTitle.trim()) return;

    onColumnEdit(activeColumn.id, newColumnTitle, newColumnColor);
    setActiveColumn(null);
    setNewColumnTitle("");
    setNewColumnColor("bg-gray-100");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setActiveColumn(null);
    setNewColumnTitle("");
    setNewColumnColor("bg-gray-100");
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px]">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Administrar Columnas
        </h3>
        <div className="space-y-6">
          {/* Current Columns */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">
              Columnas Actuales
            </h4>
            <div className="space-y-2">
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  draggable
                  onDragStart={() => handleColumnDragStart(index)}
                  onDragOver={() => handleColumnDragOver(index)}
                  onDragEnd={handleColumnDragEnd}
                  className={`flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm ${
                    activeColumn?.id === column.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <GripVertical
                      size={20}
                      className="text-gray-400 mr-2 cursor-move"
                    />
                    <div
                      className={`w-4 h-4 rounded-full ${column.color.replace(
                        "bg-",
                        "bg-opacity-50 bg-"
                      )} mr-2`}
                    />
                    <span className="text-gray-900 font-medium">
                      {column.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectColumn(column)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onColumnRemove(column.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      disabled={columns.length <= 1}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Column */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">
              {isEditing ? "Editar Columna" : "Añadir Nueva Columna"}
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={
                  isEditing
                    ? "Editar nombre de columna"
                    : "Nombre de la columna"
                }
              />
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setNewColumnColor(color.id)}
                    className={`p-2 rounded-lg border-2 ${
                      newColumnColor === color.id
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-300"
                    } transition-colors`}
                  >
                    <div
                      className={`w-full h-8 rounded ${color.id} flex items-center justify-center`}
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {color.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {isEditing ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleEditColumn}
                    className="flex-1"
                    disabled={!newColumnTitle.trim()}
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddColumn}
                  className="w-full"
                  disabled={!newColumnTitle.trim()}
                >
                  Añadir Columna
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageColumnsModal;
