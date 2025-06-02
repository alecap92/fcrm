import { BaseEmailComposer } from "./BaseEmailComposer";
import type { Email } from "../../types/email";

interface ForwardEmailProps {
  email: Email;
  onClose: () => void;
  handleSendEmail: any;
}

export function ForwardEmail({
  email,
  onClose,
  handleSendEmail,
}: ForwardEmailProps) {
  // Preparar asunto
  const getSubject = () => {
    const originalSubject = email.subject || "";
    if (
      originalSubject.toLowerCase().startsWith("fwd:") ||
      originalSubject.toLowerCase().startsWith("fw:")
    ) {
      return originalSubject;
    }
    return `Fwd: ${originalSubject}`;
  };

  // Preparar contenido con el mensaje original completo
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
    const senderEmail =
      email.from.match(/^(.+?)\s*<(.+)>$/)?.[2]?.trim() || email.from;

    const originalContent = email.html || email.text || email.snippet || "";

    return `
      <br><br>
      <div style="border: 1px solid #ddd; border-radius: 4px; padding: 15px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">---------- Mensaje reenviado ----------</h4>
        <div style="margin-bottom: 15px; font-size: 14px; color: #666;">
          <p style="margin: 5px 0;"><strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${originalDate}</p>
          <p style="margin: 5px 0;"><strong>Asunto:</strong> ${
            email.subject || "(Sin asunto)"
          }</p>
          <p style="margin: 5px 0;"><strong>Para:</strong> ${email.to.join(
            ", "
          )}</p>
          ${
            email.cc && email.cc.length > 0
              ? `<p style="margin: 5px 0;"><strong>CC:</strong> ${email.cc.join(
                  ", "
                )}</p>`
              : ""
          }
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <div style="color: #333;">
          ${originalContent}
        </div>
        ${
          email.hasAttachments &&
          email.attachments &&
          email.attachments.length > 0
            ? `
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <div style="color: #666; font-size: 14px;">
            <strong>Archivos adjuntos:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${email.attachments
                .map((att) => `<li>${att.filename} (${att.contentType})</li>`)
                .join("")}
            </ul>
          </div>
        `
            : ""
        }
      </div>
    `;
  };

  return (
    <BaseEmailComposer
      title="Reenviar"
      onClose={onClose}
      handleSendEmail={handleSendEmail}
      initialRecipients={[]}
      initialSubject={getSubject()}
      initialContent={getInitialContent()}
      showToField={true}
      showCcField={false}
      showBccField={false}
    />
  );
}
