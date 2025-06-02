import { useState, useCallback } from "react";
import { useEmail } from "../contexts/EmailContext";
import { Email, BulkEmailOperation } from "../types/email";

/**
 * Hook personalizado para operaciones comunes de correos
 */
export function useEmailOperations() {
  const {
    state,
    markAsRead,
    toggleStar,
    toggleImportant,
    moveToFolder,
    deleteEmail,
    bulkOperation,
    toggleEmailSelection,
    selectAllEmails,
    clearSelection,
  } = useEmail();

  const [isProcessing, setIsProcessing] = useState(false);

  // Operaciones individuales
  const handleMarkAsRead = useCallback(
    async (email: Email, isRead: boolean = true) => {
      if (email.isRead === isRead) return;

      setIsProcessing(true);
      try {
        await markAsRead(email._id, isRead);
      } finally {
        setIsProcessing(false);
      }
    },
    [markAsRead]
  );

  const handleToggleStar = useCallback(
    async (email: Email) => {
      setIsProcessing(true);
      try {
        await toggleStar(email._id);
      } finally {
        setIsProcessing(false);
      }
    },
    [toggleStar]
  );

  const handleToggleImportant = useCallback(
    async (email: Email) => {
      setIsProcessing(true);
      try {
        await toggleImportant(email._id);
      } finally {
        setIsProcessing(false);
      }
    },
    [toggleImportant]
  );

  const handleMoveToFolder = useCallback(
    async (email: Email, folder: string) => {
      if (email.folder === folder) return;

      setIsProcessing(true);
      try {
        await moveToFolder(email._id, folder);
      } finally {
        setIsProcessing(false);
      }
    },
    [moveToFolder]
  );

  const handleDeleteEmail = useCallback(
    async (email: Email) => {
      setIsProcessing(true);
      try {
        await deleteEmail(email._id);
      } finally {
        setIsProcessing(false);
      }
    },
    [deleteEmail]
  );

  // Operaciones masivas
  const handleBulkMarkAsRead = useCallback(
    async (emailIds: string[], isRead: boolean = true) => {
      if (emailIds.length === 0) return;

      setIsProcessing(true);
      try {
        const operation: BulkEmailOperation = {
          emailIds,
          action: isRead ? "markAsRead" : "markAsUnread",
        };
        await bulkOperation(operation);
      } finally {
        setIsProcessing(false);
      }
    },
    [bulkOperation]
  );

  const handleBulkMoveToFolder = useCallback(
    async (emailIds: string[], folder: string) => {
      if (emailIds.length === 0) return;

      setIsProcessing(true);
      try {
        const operation: BulkEmailOperation = {
          emailIds,
          action: "moveToFolder",
          folder,
        };
        await bulkOperation(operation);
      } finally {
        setIsProcessing(false);
      }
    },
    [bulkOperation]
  );

  const handleBulkDelete = useCallback(
    async (emailIds: string[]) => {
      if (emailIds.length === 0) return;

      setIsProcessing(true);
      try {
        const operation: BulkEmailOperation = {
          emailIds,
          action: "delete",
        };
        await bulkOperation(operation);
      } finally {
        setIsProcessing(false);
      }
    },
    [bulkOperation]
  );

  // Operaciones de selección
  const handleToggleSelection = useCallback(
    (emailId: string) => {
      toggleEmailSelection(emailId);
    },
    [toggleEmailSelection]
  );

  const handleSelectAll = useCallback(() => {
    selectAllEmails();
  }, [selectAllEmails]);

  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Operaciones combinadas
  const handleArchiveEmails = useCallback(
    async (emailIds: string[]) => {
      await handleBulkMoveToFolder(emailIds, "ARCHIVE");
    },
    [handleBulkMoveToFolder]
  );

  const handleSpamEmails = useCallback(
    async (emailIds: string[]) => {
      await handleBulkMoveToFolder(emailIds, "SPAM");
    },
    [handleBulkMoveToFolder]
  );

  const handleTrashEmails = useCallback(
    async (emailIds: string[]) => {
      await handleBulkMoveToFolder(emailIds, "TRASH");
    },
    [handleBulkMoveToFolder]
  );

  // Operaciones con confirmación
  const handleDeleteWithConfirmation = useCallback(
    async (email: Email) => {
      if (
        window.confirm("¿Estás seguro de que quieres eliminar este correo?")
      ) {
        await handleDeleteEmail(email);
      }
    },
    [handleDeleteEmail]
  );

  const handleBulkDeleteWithConfirmation = useCallback(
    async (emailIds: string[]) => {
      const count = emailIds.length;
      if (
        window.confirm(
          `¿Estás seguro de que quieres eliminar ${count} correo${
            count > 1 ? "s" : ""
          }?`
        )
      ) {
        await handleBulkDelete(emailIds);
      }
    },
    [handleBulkDelete]
  );

  return {
    // Estado
    isProcessing,
    selectedEmails: state.selectedEmails,

    // Operaciones individuales
    markAsRead: handleMarkAsRead,
    toggleStar: handleToggleStar,
    toggleImportant: handleToggleImportant,
    moveToFolder: handleMoveToFolder,
    deleteEmail: handleDeleteEmail,

    // Operaciones masivas
    bulkMarkAsRead: handleBulkMarkAsRead,
    bulkMoveToFolder: handleBulkMoveToFolder,
    bulkDelete: handleBulkDelete,

    // Operaciones de selección
    toggleSelection: handleToggleSelection,
    selectAll: handleSelectAll,
    clearSelection: handleClearSelection,

    // Operaciones combinadas
    archiveEmails: handleArchiveEmails,
    spamEmails: handleSpamEmails,
    trashEmails: handleTrashEmails,

    // Operaciones con confirmación
    deleteWithConfirmation: handleDeleteWithConfirmation,
    bulkDeleteWithConfirmation: handleBulkDeleteWithConfirmation,
  };
}
