import { BaseEmailComposer } from "./BaseEmailComposer";

interface ComposeEmailProps {
  onClose: () => void;
  handleSendEmail: any;
  selectedInvoice?: any;
  defaultRecipientsEmail?: string[];
}

export function ComposeEmail({
  onClose,
  handleSendEmail,
  selectedInvoice,
  defaultRecipientsEmail,
}: ComposeEmailProps) {
  return (
    <BaseEmailComposer
      title="Nuevo Mensaje"
      onClose={onClose}
      handleSendEmail={handleSendEmail}
      initialRecipients={defaultRecipientsEmail || []}
      selectedInvoice={selectedInvoice}
      showToField={true}
      showCcField={false}
      showBccField={false}
    />
  );
}
