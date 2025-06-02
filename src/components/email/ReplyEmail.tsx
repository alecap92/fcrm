import { BaseEmailComposer } from "./BaseEmailComposer";
import type { Email } from "../../types/email";

interface ReplyEmailProps {
  email: Email;
  onClose: () => void;
  handleSendEmail: any;
  replyAll?: boolean;
}

export function ReplyEmail({
  email,
  onClose,
  handleSendEmail,
  replyAll = false,
}: ReplyEmailProps) {
  // Extraer el email del remitente
  const getSenderEmail = (fromEmail: string) => {
    const match = fromEmail.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return match[2].trim();
    }
    return fromEmail;
  };

  // Preparar destinatarios
  const getRecipients = () => {
    const senderEmail = getSenderEmail(email.from);

    if (replyAll) {
      // Para "Responder a todos", incluir remitente + todos los destinatarios originales (excepto nosotros)
      const allRecipients = [senderEmail, ...email.to];
      if (email.cc) {
        allRecipients.push(...email.cc);
      }
      // Filtrar duplicados y emails propios (esto se podría mejorar con el email del usuario actual)
      return [...new Set(allRecipients)];
    } else {
      // Para "Responder", solo al remitente
      return [senderEmail];
    }
  };

  // Preparar asunto
  const getSubject = () => {
    const originalSubject = email.subject || "";
    if (originalSubject.toLowerCase().startsWith("re:")) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  };

  // Preparar contenido con el mensaje original
  const getInitialContent = () => {
    const originalDate = new Date(email.date).toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const senderName =
      email.from.match(/^(.+?)\s*<(.+)>$/)?.[1]?.trim() || email.from;

    const originalContent = email.html || email.text || email.snippet || "";

    return `
      <br><br>
      <div style="border-left: 3px solid #ccc; padding-left: 15px; margin-left: 0;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          El ${originalDate}, ${senderName} escribió:
        </p>
        <div style="color: #666;">
          ${originalContent}
        </div>
      </div>
    `;
  };

  return (
    <BaseEmailComposer
      title={replyAll ? "Responder a todos" : "Responder"}
      onClose={onClose}
      handleSendEmail={handleSendEmail}
      initialRecipients={getRecipients()}
      initialSubject={getSubject()}
      initialContent={getInitialContent()}
      showToField={true}
      showCcField={replyAll}
      showBccField={false}
    />
  );
}
