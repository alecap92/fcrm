import { Button } from "../ui/button";
import { AUTOMATION_MESSAGES } from "../../constants/automations";

interface DeleteDialogProps {
  isOpen: boolean;
  automationName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteDialog({
  isOpen,
  automationName,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Eliminar Automatización</h3>
        <p className="text-gray-600 mb-6">
          {AUTOMATION_MESSAGES.DELETE_CONFIRMATION} "{automationName}"?{" "}
          {AUTOMATION_MESSAGES.DELETE_WARNING}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
