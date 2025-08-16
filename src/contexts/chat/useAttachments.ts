import { useCallback, useState } from "react";
import chatService, { UploadFileResponse } from "../../services/chatService";
import { conversationService } from "../../services/conversationService";

export interface FileDocument {
  name: string;
  mediaURL: string;
  fileType: string; // image | document | audio
}

export function useAttachments({
  getDestinationPhone,
  getCurrentChatId,
  reloadMessages,
  refreshConversations,
  onUpdateConversationReadState,
}: {
  getDestinationPhone: () => string | "";
  getCurrentChatId: () => string | null;
  reloadMessages: () => Promise<void>;
  refreshConversations: () => void;
  onUpdateConversationReadState?: (chatId: string, isRead: boolean) => void;
}) {
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearUploadError = useCallback(() => setUploadError(null), []);

  const sendFile = useCallback(
    async (formData: FormData) => {
      try {
        await conversationService.sendMessage(formData);
        await reloadMessages();
        refreshConversations();
        
        // Marcar la conversación como leída después de enviar el archivo exitosamente
        const currentChatId = getCurrentChatId();
        if (currentChatId && onUpdateConversationReadState) {
          try {
            await conversationService.markConversationAsRead(currentChatId);
            onUpdateConversationReadState(currentChatId, true);
          } catch (markError) {
            console.warn("Error al marcar conversación como leída:", markError);
          }
        }
      } catch (err) {
        console.error("Error al enviar archivo:", err);
        throw err;
      }
    },
    [reloadMessages, refreshConversations, getCurrentChatId, onUpdateConversationReadState]
  );

  const handleAttachmentClick = useCallback(
    async (file: File) => {
      const destinationPhone = getDestinationPhone();
      if (!destinationPhone) {
        setUploadError("No se pudo determinar el número de destino");
        return;
      }
      const currentChatId = getCurrentChatId();
      setIsUploadingFile(true);
      setUploadError(null);
      try {
        const fileResponse: UploadFileResponse = await chatService.uploadFile(
          file,
          true
        );
        if (!fileResponse.success) throw new Error("Error al subir el archivo");
        const messageData = new FormData();
        messageData.append("to", destinationPhone);
        const messageType = file.type.startsWith("image/")
          ? "image"
          : "document";
        messageData.append("messageType", messageType);
        messageData.append("type", messageType);
        messageData.append("mediaUrl", fileResponse.mediaURL);
        messageData.append("conversation", currentChatId || "");
        messageData.append("caption", file.name);
        await sendFile(messageData);
      } catch (error) {
        console.error("Error al enviar archivo:", error);
        setUploadError("Error al enviar el archivo. Inténtalo de nuevo.");
      } finally {
        setIsUploadingFile(false);
      }
    },
    [getDestinationPhone, getCurrentChatId, sendFile]
  );

  const handleLibraryUpload = useCallback(
    async (document: FileDocument) => {
      const destinationPhone = getDestinationPhone();
      if (!destinationPhone) {
        setUploadError("No se pudo determinar el número de destino");
        return;
      }
      const currentChatId = getCurrentChatId();
      setIsUploadingFile(true);
      setUploadError(null);
      try {
        const response = await fetch(document.mediaURL);
        if (!response.ok)
          throw new Error("No se pudo descargar el archivo de la biblioteca");
        const blob = await response.blob();
        const file = new File([blob], document.name, { type: blob.type });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("to", destinationPhone);
        formData.append("messageType", document.fileType);
        formData.append("type", document.fileType);
        formData.append("mediaUrl", document.mediaURL);
        formData.append("conversation", currentChatId || "");
        formData.append("caption", document.name);
        await sendFile(formData);
      } catch (err) {
        console.error("Error al enviar archivo desde la biblioteca:", err);
        setUploadError(
          "Error al enviar el archivo desde la biblioteca. Inténtalo de nuevo."
        );
      } finally {
        setIsUploadingFile(false);
      }
    },
    [getDestinationPhone, getCurrentChatId, sendFile]
  );

  return {
    isUploadingFile,
    uploadError,
    clearUploadError,
    handleAttachmentClick,
    handleLibraryUpload,
    sendFile,
  } as const;
}
