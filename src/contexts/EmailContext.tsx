import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  EmailState,
  EmailAction,
  Email,
  EmailFilters,
  EmailSettings,
  EmailStats,
  EmailFolder,
  EmailLabel,
  EmailThread,
  BulkEmailOperation,
  EmailCompose,
  EmailSearchQuery,
} from "../types/email";
import emailsService from "../services/emailService";
import { socket } from "../services/socketService";
import { useToast } from "../components/ui/toast";
import {
  Inbox,
  Send,
  Star,
  Archive,
  Trash2,
  Clock,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

// Estado inicial
const initialState: EmailState = {
  emails: [],
  selectedEmail: null,
  selectedEmails: [],
  folders: [
    {
      id: "ALL",
      name: "Todos",
      icon: FolderOpen,
      count: 0,
      unreadCount: 0,
    },
    {
      id: "INBOX",
      name: "Bandeja de entrada",
      icon: Inbox,
      count: 0,
      unreadCount: 0,
    },
    { id: "SENT", name: "Enviados", icon: Send, count: 0 },
    { id: "STARRED", name: "Destacados", icon: Star, count: 0 },
    { id: "ARCHIVE", name: "Archivo", icon: Archive, count: 0 },
    { id: "TRASH", name: "Papelera", icon: Trash2, count: 0 },
    { id: "DRAFTS", name: "Borradores", icon: Clock, count: 0 },
    { id: "SPAM", name: "Spam", icon: AlertCircle, count: 0 },
  ],
  labels: [],
  currentFolder: "ALL",
  searchQuery: "",
  filters: {
    folder: "ALL",
  },
  isLoading: false,
  isComposing: false,
  emailSettings: null,
  stats: null,
  threads: [],
  currentThread: null,
};

// Funciones de persistencia local
const saveEmailSettingsToLocal = (settings: EmailSettings | null) => {
  try {
    if (settings) {
      // Guardar sin contraseñas por seguridad
      const safeSettings = {
        emailAddress: settings.emailAddress,
        imapSettings: {
          host: settings.imapSettings.host,
          port: settings.imapSettings.port,
          user: settings.imapSettings.user,
          tls: settings.imapSettings.tls,
          // password omitida
        },
        smtpSettings: {
          host: settings.smtpSettings.host,
          port: settings.smtpSettings.port,
          user: settings.smtpSettings.user,
          secure: settings.smtpSettings.secure,
          // password omitida
        },
      };
      localStorage.setItem("emailSettings", JSON.stringify(safeSettings));
    } else {
      localStorage.removeItem("emailSettings");
    }
  } catch (error) {
    console.error("Error saving email settings to localStorage:", error);
  }
};

const loadEmailSettingsFromLocal = (): EmailSettings | null => {
  try {
    const saved = localStorage.getItem("emailSettings");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error loading email settings from localStorage:", error);
    return null;
  }
};

// Reducer para manejar las acciones
function emailReducer(state: EmailState, action: EmailAction): EmailState {
  switch (action.type) {
    case "SET_EMAILS":
      return { ...state, emails: action.payload };

    case "ADD_EMAIL":
      return {
        ...state,
        emails: [action.payload, ...state.emails],
      };

    case "UPDATE_EMAIL":
      return {
        ...state,
        emails: state.emails.map((email) =>
          email._id === action.payload.id
            ? { ...email, ...action.payload.updates }
            : email
        ),
        selectedEmail:
          state.selectedEmail?._id === action.payload.id
            ? { ...state.selectedEmail, ...action.payload.updates }
            : state.selectedEmail,
      };

    case "DELETE_EMAIL":
      return {
        ...state,
        emails: state.emails.filter((email) => email._id !== action.payload),
        selectedEmail:
          state.selectedEmail?._id === action.payload
            ? null
            : state.selectedEmail,
        selectedEmails: state.selectedEmails.filter(
          (id) => id !== action.payload
        ),
      };

    case "SELECT_EMAIL":
      return { ...state, selectedEmail: action.payload };

    case "SELECT_EMAILS":
      return { ...state, selectedEmails: action.payload };

    case "SET_FOLDERS":
      return { ...state, folders: action.payload };

    case "SET_LABELS":
      return { ...state, labels: action.payload };

    case "SET_CURRENT_FOLDER":
      return {
        ...state,
        currentFolder: action.payload,
        filters: { ...state.filters, folder: action.payload },
        selectedEmail: null,
        selectedEmails: [],
      };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_COMPOSING":
      return { ...state, isComposing: action.payload };

    case "SET_EMAIL_SETTINGS":
      return { ...state, emailSettings: action.payload };

    case "SET_STATS":
      return { ...state, stats: action.payload };

    case "SET_THREADS":
      return { ...state, threads: action.payload };

    case "SET_CURRENT_THREAD":
      return { ...state, currentThread: action.payload };

    case "BULK_UPDATE_EMAILS":
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.payload.emailIds.includes(email._id)
            ? { ...email, ...action.payload.updates }
            : email
        ),
      };

    default:
      return state;
  }
}

// Contexto
interface EmailContextType {
  state: EmailState;
  dispatch: React.Dispatch<EmailAction>;

  // Acciones de correos
  loadEmails: (filters?: Partial<EmailFilters>) => Promise<void>;
  searchEmails: (query: EmailSearchQuery) => Promise<void>;
  sendEmail: (emailData: EmailCompose) => Promise<void>;
  markAsRead: (emailId: string, isRead?: boolean) => Promise<void>;
  toggleStar: (emailId: string) => Promise<void>;
  toggleImportant: (emailId: string) => Promise<void>;
  moveToFolder: (emailId: string, folder: string) => Promise<void>;
  deleteEmail: (emailId: string) => Promise<void>;
  bulkOperation: (operation: BulkEmailOperation) => Promise<void>;

  // Acciones de configuración
  loadEmailSettings: () => Promise<void>;
  configureAccount: (settings: EmailSettings) => Promise<void>;

  // Acciones de hilos
  loadThreads: () => Promise<void>;
  loadThread: (threadId: string) => Promise<void>;

  // Acciones de UI
  selectEmail: (email: Email | null) => void;
  selectFolder: (folderId: string) => void;
  setSearchQuery: (query: string) => void;
  setComposing: (isComposing: boolean) => void;
  selectEmails: (emailIds: string[]) => void;
  toggleEmailSelection: (emailId: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

// Provider del contexto
interface EmailProviderProps {
  children: ReactNode;
}

export function EmailProvider({ children }: EmailProviderProps) {
  const [state, dispatch] = useReducer(emailReducer, initialState);
  const toast = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    loadEmailSettings();
  }, []);

  // Escuchar eventos de socket para nuevos correos
  useEffect(() => {
    const handleNewEmail = (data: { email: Email; message: string }) => {
      console.log("📧 Recibido un correo"); // Mensaje específico que el usuario quiere ver

      // Agregar el nuevo correo al estado si estamos en la carpeta correcta
      if (
        state.currentFolder === "ALL" ||
        state.currentFolder === data.email.folder
      ) {
        dispatch({ type: "ADD_EMAIL", payload: data.email });

        // Mostrar notificación toast
        toast.show({
          type: "success",
          title: "Nuevo correo",
          description: `De: ${data.email.from} - ${data.email.subject}`,
        });
      }
    };

    // Suscribirse al evento
    socket.on("newEmail", handleNewEmail);

    // Cleanup al desmontar
    return () => {
      socket.off("newEmail", handleNewEmail);
    };
  }, [state.currentFolder, toast]); // Dependencia del folder actual y toast

  // Cargar correos cuando cambia la carpeta o filtros
  useEffect(() => {
    if (state.emailSettings) {
      loadEmails(state.filters);
    }
  }, [state.currentFolder, state.emailSettings]);

  // Funciones de correos
  const loadEmails = async (filters: Partial<EmailFilters> = {}) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const mergedFilters = { ...state.filters, ...filters };

      // Si la carpeta es "ALL", no aplicar filtro de carpeta para mostrar todos los emails
      if (mergedFilters.folder === "ALL") {
        const { folder, ...filtersWithoutFolder } = mergedFilters;
        const response = await emailsService.emails.getEmails(
          filtersWithoutFolder
        );
        dispatch({ type: "SET_EMAILS", payload: response.emails });
      } else {
        const response = await emailsService.emails.getEmails(mergedFilters);
        dispatch({ type: "SET_EMAILS", payload: response.emails });
      }
    } catch (error) {
      console.error("Error loading emails:", error);
      toast.show({
        type: "error",
        title: "Error al cargar los correos",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const searchEmails = async (query: EmailSearchQuery) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const emails = await emailsService.emails.searchEmails(query);
      dispatch({ type: "SET_EMAILS", payload: emails });
    } catch (error) {
      console.error("Error searching emails:", error);
      toast.show({
        type: "error",
        title: "Error en la búsqueda",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const sendEmail = async (emailData: EmailCompose) => {
    try {
      await emailsService.emails.sendEmail(emailData);
      dispatch({ type: "SET_COMPOSING", payload: false });

      // Recargar correos si estamos en la carpeta de enviados
      if (state.currentFolder === "SENT") {
        loadEmails();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Re-lanzar el error para que lo maneje el componente
    }
  };

  const markAsRead = async (emailId: string, isRead: boolean = true) => {
    try {
      const updatedEmail = await emailsService.emails.markAsRead(
        emailId,
        isRead
      );
      dispatch({
        type: "UPDATE_EMAIL",
        payload: { id: emailId, updates: { isRead } },
      });
    } catch (error) {
      console.error("Error marking email as read:", error);
      toast.show({
        type: "error",
        title: "Error al actualizar el correo",
      });
    }
  };

  const toggleStar = async (emailId: string) => {
    try {
      const updatedEmail = await emailsService.emails.toggleStar(emailId);
      dispatch({
        type: "UPDATE_EMAIL",
        payload: {
          id: emailId,
          updates: { isStarred: updatedEmail.isStarred },
        },
      });
    } catch (error) {
      console.error("Error toggling star:", error);
      toast.show({
        type: "error",
        title: "Error al marcar como favorito",
      });
    }
  };

  const toggleImportant = async (emailId: string) => {
    try {
      const updatedEmail = await emailsService.emails.toggleImportant(emailId);
      dispatch({
        type: "UPDATE_EMAIL",
        payload: {
          id: emailId,
          updates: { isImportant: updatedEmail.isImportant },
        },
      });
    } catch (error) {
      console.error("Error toggling important:", error);
      toast.show({
        type: "error",
        title: "Error al marcar como importante",
      });
    }
  };

  const moveToFolder = async (emailId: string, folder: string) => {
    try {
      await emailsService.emails.moveToFolder(emailId, folder);
      dispatch({
        type: "UPDATE_EMAIL",
        payload: { id: emailId, updates: { folder } },
      });

      // Si el correo se movió fuera de la carpeta actual, removerlo de la vista
      if (folder !== state.currentFolder) {
        dispatch({ type: "DELETE_EMAIL", payload: emailId });
      }

      toast.show({
        type: "success",
        title: "Correo movido exitosamente",
      });
    } catch (error) {
      console.error("Error moving email:", error);
      toast.show({
        type: "error",
        title: "Error al mover el correo",
      });
    }
  };

  const deleteEmail = async (emailId: string) => {
    try {
      await emailsService.emails.deleteEmail(emailId);
      dispatch({ type: "DELETE_EMAIL", payload: emailId });
      toast.show({
        type: "success",
        title: "Correo eliminado",
      });
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.show({
        type: "error",
        title: "Error al eliminar el correo",
      });
    }
  };

  const bulkOperation = async (operation: BulkEmailOperation) => {
    try {
      await emailsService.emails.bulkOperation(operation);

      // Actualizar el estado local basado en la operación
      switch (operation.action) {
        case "markAsRead":
          dispatch({
            type: "BULK_UPDATE_EMAILS",
            payload: {
              emailIds: operation.emailIds,
              updates: { isRead: true },
            },
          });
          break;
        case "markAsUnread":
          dispatch({
            type: "BULK_UPDATE_EMAILS",
            payload: {
              emailIds: operation.emailIds,
              updates: { isRead: false },
            },
          });
          break;
        case "delete":
          operation.emailIds.forEach((emailId) => {
            dispatch({ type: "DELETE_EMAIL", payload: emailId });
          });
          break;
        case "moveToFolder":
          if (operation.folder !== state.currentFolder) {
            operation.emailIds.forEach((emailId) => {
              dispatch({ type: "DELETE_EMAIL", payload: emailId });
            });
          } else {
            dispatch({
              type: "BULK_UPDATE_EMAILS",
              payload: {
                emailIds: operation.emailIds,
                updates: { folder: operation.folder },
              },
            });
          }
          break;
      }

      dispatch({ type: "SELECT_EMAILS", payload: [] });
      toast.show({
        type: "success",
        title: "Operación completada",
      });
    } catch (error) {
      console.error("Error in bulk operation:", error);
      toast.show({
        type: "error",
        title: "Error en la operación masiva",
      });
    }
  };

  // Funciones de configuración
  const loadEmailSettings = async () => {
    try {
      // Intentar cargar desde el servidor primero
      const settings = await emailsService.account.getAccountSettings();
      if (settings) {
        dispatch({ type: "SET_EMAIL_SETTINGS", payload: settings });
        saveEmailSettingsToLocal(settings);
      } else {
        // Si no hay en el servidor, intentar cargar desde localStorage
        const localSettings = loadEmailSettingsFromLocal();
        if (localSettings) {
          dispatch({ type: "SET_EMAIL_SETTINGS", payload: localSettings });
        }
      }
    } catch (error) {
      console.error("Error loading email settings:", error);
      // En caso de error, intentar cargar desde localStorage
      const localSettings = loadEmailSettingsFromLocal();
      if (localSettings) {
        dispatch({ type: "SET_EMAIL_SETTINGS", payload: localSettings });
      }
    }
  };

  const configureAccount = async (settings: EmailSettings) => {
    try {
      await emailsService.account.configureAccount(settings);
      dispatch({ type: "SET_EMAIL_SETTINGS", payload: settings });

      // Guardar también en localStorage como respaldo
      saveEmailSettingsToLocal(settings);

      toast.show({
        type: "success",
        title: "Cuenta configurada exitosamente",
      });

      // Cargar correos después de configurar la cuenta
      loadEmails();
    } catch (error) {
      console.error("Error configuring account:", error);
      toast.show({
        type: "error",
        title: "Error al configurar la cuenta",
      });
      throw error;
    }
  };

  // Funciones de hilos
  const loadThreads = async () => {
    try {
      const threads = await emailsService.threads.getThreads();
      dispatch({ type: "SET_THREADS", payload: threads });
    } catch (error) {
      console.error("Error loading threads:", error);
    }
  };

  const loadThread = async (threadId: string) => {
    try {
      const thread = await emailsService.threads.getThread(threadId);
      dispatch({ type: "SET_CURRENT_THREAD", payload: thread });
    } catch (error) {
      console.error("Error loading thread:", error);
    }
  };

  // Funciones de UI
  const selectEmail = (email: Email | null) => {
    dispatch({ type: "SELECT_EMAIL", payload: email });

    // Marcar como leído automáticamente al seleccionar
    if (email && !email.isRead) {
      markAsRead(email._id);
    }
  };

  const selectFolder = (folderId: string) => {
    dispatch({ type: "SET_CURRENT_FOLDER", payload: folderId });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  const setComposing = (isComposing: boolean) => {
    dispatch({ type: "SET_COMPOSING", payload: isComposing });
  };

  const selectEmails = (emailIds: string[]) => {
    dispatch({ type: "SELECT_EMAILS", payload: emailIds });
  };

  const toggleEmailSelection = (emailId: string) => {
    const isSelected = state.selectedEmails.includes(emailId);
    const newSelection = isSelected
      ? state.selectedEmails.filter((id) => id !== emailId)
      : [...state.selectedEmails, emailId];

    dispatch({ type: "SELECT_EMAILS", payload: newSelection });
  };

  const selectAllEmails = () => {
    const allEmailIds = state.emails.map((email) => email._id);
    dispatch({ type: "SELECT_EMAILS", payload: allEmailIds });
  };

  const clearSelection = () => {
    dispatch({ type: "SELECT_EMAILS", payload: [] });
  };

  const contextValue: EmailContextType = {
    state,
    dispatch,

    // Acciones de correos
    loadEmails,
    searchEmails,
    sendEmail,
    markAsRead,
    toggleStar,
    toggleImportant,
    moveToFolder,
    deleteEmail,
    bulkOperation,

    // Acciones de configuración
    loadEmailSettings,
    configureAccount,

    // Acciones de hilos
    loadThreads,
    loadThread,

    // Acciones de UI
    selectEmail,
    selectFolder,
    setSearchQuery,
    setComposing,
    selectEmails,
    toggleEmailSelection,
    selectAllEmails,
    clearSelection,
  };

  return (
    <EmailContext.Provider value={contextValue}>
      {children}
    </EmailContext.Provider>
  );
}

// Hook para usar el contexto
export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}

export default EmailContext;
