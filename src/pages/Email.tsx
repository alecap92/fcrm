import React from "react";
import { EmailProvider } from "../contexts/EmailContext";
import { EmailClient } from "../components/email/EmailClient";

export function Email() {
  return (
    <EmailProvider>
      <EmailClient />
    </EmailProvider>
  );
}
