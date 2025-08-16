import { Button } from "./button";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

// Define size options for the modal
type ModalSize = "MD" | "L" | "XL" | "XXL";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  modalSize?: ModalSize; // Optional modalSize prop with default value
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  modalSize = "MD", // Default size is MD (medium)
}: ModalProps) {
  if (!isOpen) return null;

  // Define width classes based on modalSize
  const getWidthClass = () => {
    switch (modalSize) {
      case "L":
        return "max-w-2xl"; // Large size (576px)
      case "XL":
        return "max-w-4xl"; // Extra large size (896px)
      case "XXL":
        return "max-w-6xl"; // Extra large size (896px)
      default:
        return "max-w-2xl"; // Medium size (default, 448px)
    }
  };

  const modal = (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 m-0 p-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${getWidthClass()} mx-4 max-h-screen overflow-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
