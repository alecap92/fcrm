import axios from "axios";
import {
  Email,
  EmailCompose,
  EmailSettings,
  EmailSearchQuery,
  EmailFilters,
  BulkEmailOperation,
  EmailStats,
  EmailThread,
  EmailFolder,
  EmailLabel,
  EmailPagination,
} from "../types/email";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configurar interceptor para incluir token automáticamente
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/email`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios de configuración de cuenta
export const accountService = {
  /**
   * Configura la cuenta de email del usuario
   */
  async configureAccount(settings: EmailSettings): Promise<any> {
    const response = await apiClient.post("/settings/account", settings);
    return response.data;
  },

  /**
   * Valida las configuraciones de email
   */
  async validateAccount(): Promise<any> {
    const response = await apiClient.post("/settings/validate");
    return response.data;
  },

  /**
   * Obtiene las configuraciones actuales del usuario
   */
  async getAccountSettings(): Promise<EmailSettings | null> {
    try {
      const response = await apiClient.get("/settings/account");
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Detecta configuraciones automáticamente basadas en el email
   */
  async autoDetectSettings(emailAddress: string): Promise<any> {
    const response = await apiClient.post("/settings/auto-detect", {
      emailAddress,
    });
    return response.data;
  },
};

// Servicios de correos
export const emailService = {
  /**
   * Obtiene la lista de correos con filtros y paginación
   */
  async getEmails(
    filters: Partial<EmailFilters> = {},
    pagination: Partial<EmailPagination> = {}
  ): Promise<{ emails: Email[]; pagination: EmailPagination }> {
    const params = new URLSearchParams();

    // Agregar filtros
    if (filters.folder) params.append("folder", filters.folder);
    if (filters.isRead !== undefined)
      params.append("isRead", filters.isRead.toString());
    if (filters.isStarred !== undefined)
      params.append("isStarred", filters.isStarred.toString());
    if (filters.hasAttachments !== undefined)
      params.append("hasAttachments", filters.hasAttachments.toString());
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.labels?.length)
      params.append("labels", filters.labels.join(","));

    // Agregar paginación
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());

    const response = await apiClient.get(`/?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtiene un correo específico por ID
   */
  async getEmail(emailId: string): Promise<Email> {
    const response = await apiClient.get(`/${emailId}`);
    return response.data;
  },

  /**
   * Busca correos con query avanzada
   */
  async searchEmails(query: EmailSearchQuery): Promise<Email[]> {
    const response = await apiClient.post("/search", query);
    return response.data;
  },

  /**
   * Envía un nuevo correo
   */
  async sendEmail(emailData: EmailCompose): Promise<any> {
    const formData = new FormData();

    // Agregar campos básicos
    formData.append("to", JSON.stringify(emailData.to));
    if (emailData.cc?.length)
      formData.append("cc", JSON.stringify(emailData.cc));
    if (emailData.bcc?.length)
      formData.append("bcc", JSON.stringify(emailData.bcc));
    formData.append("subject", emailData.subject);
    formData.append("content", emailData.content);
    if (emailData.priority) formData.append("priority", emailData.priority);
    if (emailData.inReplyTo) formData.append("inReplyTo", emailData.inReplyTo);
    if (emailData.threadId) formData.append("threadId", emailData.threadId);

    // Agregar archivos adjuntos
    if (emailData.attachments?.length) {
      emailData.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await apiClient.post("/send", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Marca un correo como leído/no leído
   */
  async markAsRead(emailId: string, isRead: boolean = true): Promise<Email> {
    const response = await apiClient.patch(`/${emailId}/read`, { isRead });
    return response.data;
  },

  /**
   * Marca un correo como favorito
   */
  async toggleStar(emailId: string): Promise<Email> {
    const response = await apiClient.patch(`/${emailId}/star`);
    return response.data;
  },

  /**
   * Marca un correo como importante
   */
  async toggleImportant(emailId: string): Promise<Email> {
    const response = await apiClient.patch(`/${emailId}/important`);
    return response.data;
  },

  /**
   * Mueve un correo a una carpeta
   */
  async moveToFolder(emailId: string, folder: string): Promise<Email> {
    const response = await apiClient.patch(`/${emailId}/folder`, { folder });
    return response.data;
  },

  /**
   * Añade una etiqueta a un correo
   */
  async addLabel(emailId: string, label: string): Promise<Email> {
    const response = await apiClient.patch(`/${emailId}/labels/add`, { label });
    return response.data;
  },

  /**
   * Elimina una etiqueta de un correo
   */
  async removeLabel(emailId: string, label: string): Promise<Email> {
    const response = await apiClient.patch(`/${emailId}/labels/remove`, {
      label,
    });
    return response.data;
  },

  /**
   * Elimina un correo
   */
  async deleteEmail(emailId: string): Promise<void> {
    await apiClient.delete(`/${emailId}`);
  },

  /**
   * Operaciones masivas en correos
   */
  async bulkOperation(operation: BulkEmailOperation): Promise<any> {
    const response = await apiClient.post("/bulk", operation);
    return response.data;
  },

  /**
   * Descarga un adjunto
   */
  async downloadAttachment(emailId: string, partID: string): Promise<Blob> {
    const response = await apiClient.get(`/${emailId}/attachments/${partID}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

// Servicios de carpetas
export const folderService = {
  /**
   * Obtiene todas las carpetas
   */
  async getFolders(): Promise<EmailFolder[]> {
    const response = await apiClient.get("/folders");
    return response.data.folders;
  },

  /**
   * Crea una nueva carpeta
   */
  async createFolder(name: string): Promise<EmailFolder> {
    const response = await apiClient.post("/folders", { folderName: name });
    return response.data;
  },

  /**
   * Renombra una carpeta
   */
  async renameFolder(oldName: string, newName: string): Promise<EmailFolder> {
    const response = await apiClient.put("/folders", { oldName, newName });
    return response.data;
  },

  /**
   * Elimina una carpeta
   */
  async deleteFolder(name: string): Promise<void> {
    await apiClient.delete("/folders", { data: { folderName: name } });
  },
};

// Servicios de etiquetas
export const labelService = {
  /**
   * Obtiene todas las etiquetas del usuario
   */
  async getLabels(): Promise<EmailLabel[]> {
    const response = await apiClient.get("/labels");
    return response.data;
  },

  /**
   * Crea una nueva etiqueta
   */
  async createLabel(label: Omit<EmailLabel, "id">): Promise<EmailLabel> {
    const response = await apiClient.post("/labels", label);
    return response.data;
  },

  /**
   * Actualiza una etiqueta
   */
  async updateLabel(
    labelId: string,
    updates: Partial<EmailLabel>
  ): Promise<EmailLabel> {
    const response = await apiClient.put(`/labels/${labelId}`, updates);
    return response.data;
  },

  /**
   * Elimina una etiqueta
   */
  async deleteLabel(labelId: string): Promise<void> {
    await apiClient.delete(`/labels/${labelId}`);
  },
};

// Servicios de hilos de conversación
export const threadService = {
  /**
   * Obtiene un hilo de conversación
   */
  async getThread(threadId: string): Promise<EmailThread> {
    const response = await apiClient.get(`/threads/${threadId}`);
    return response.data;
  },

  /**
   * Obtiene todos los hilos del usuario
   */
  async getThreads(): Promise<EmailThread[]> {
    const response = await apiClient.get("/threads");
    return response.data;
  },
};

// Servicios de estadísticas
export const statsService = {
  /**
   * Obtiene estadísticas de correos
   */
  async getStats(): Promise<EmailStats> {
    const response = await apiClient.get("/stats");
    return response.data;
  },

  /**
   * Obtiene uso de almacenamiento
   */
  async getStorageUsage(): Promise<{
    used: number;
    total: number;
    percentage: number;
  }> {
    const response = await apiClient.get("/stats/storage");
    return response.data;
  },
};

// Servicios de sincronización
export const syncService = {
  /**
   * Sincroniza correos antiguos
   */
  async syncOldEmails(): Promise<{ count: number; message: string }> {
    const response = await apiClient.post("/sync/old");
    return response.data;
  },

  /**
   * Fuerza sincronización completa
   */
  async forceSyncAll(): Promise<{ count: number; message: string }> {
    const response = await apiClient.post("/sync/force");
    return response.data;
  },

  /**
   * Obtiene estado de sincronización
   */
  async getSyncStatus(): Promise<{
    isActive: boolean;
    lastSync: string;
    nextSync: string;
  }> {
    const response = await apiClient.get("/sync/status");
    return response.data;
  },
};

// Servicios avanzados
export const advancedService = {
  /**
   * Configura notificaciones push
   */
  async configurePushNotifications(enabled: boolean): Promise<any> {
    const response = await apiClient.post("/notifications/push", {
      enable: enabled,
    });
    return response.data;
  },

  /**
   * Obtiene estadísticas de colas
   */
  async getQueueStats(): Promise<any> {
    const response = await apiClient.get("/queue/stats");
    return response.data;
  },

  /**
   * Exporta correos
   */
  async exportEmails(
    filters: EmailFilters,
    format: "json" | "csv" | "mbox"
  ): Promise<Blob> {
    const response = await apiClient.post(
      "/export",
      { filters, format },
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};

// Servicio principal que agrupa todos los servicios
const emailsService = {
  account: accountService,
  emails: emailService,
  folders: folderService,
  labels: labelService,
  threads: threadService,
  stats: statsService,
  sync: syncService,
  advanced: advancedService,

  // Método legacy para compatibilidad
  sendEmail: emailService.sendEmail,
};

export default emailsService;
