import { Modal } from "../../ui/modal";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
}: ImagePreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vista previa de imagen"
      modalSize="XXL"
    >
      <div className="flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Vista previa"
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </Modal>
  );
}
