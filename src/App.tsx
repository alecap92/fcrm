import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { Login } from "./pages/Login";
import { WorkflowEditor } from "./pages/WorkflowEditor";
import { Home } from "./pages/Home";
import { TopBar } from "./components/TopBar";
import { ContactsDirectory } from "./pages/ContactsDirectory";
import { ContactLists } from "./pages/ContactLists";
import { CreateContactList } from "./pages/CreateContactList";
import { WhatsApp } from "./pages/WhatsApp";
import { WhatsAppMass } from "./pages/WhatsAppMass";
import { WhatsAppMassNew } from "./pages/WhatsAppMassNew";
import { EmailMass } from "./pages/EmailMass";
import { EmailMassNew } from "./pages/EmailMassNew";
import { Deals } from "./pages/Deals";
import { Quotes } from "./pages/Quotes";
import { QuoteEditor } from "./pages/QuoteEditor";
import { Reports } from "./pages/Reports";
import { Fragments } from "./pages/Fragments";
import { Email } from "./pages/Email";
import { Projects } from "./pages/Projects";
import { SocialMedia } from "./pages/SocialMedia";
import { Settings } from "./pages/Settings";
import { Products } from "./pages/Products";
import { Automations } from "./pages/Automations";
import { Sequences } from "./pages/Sequences";
import { Templates } from "./pages/Templates";
import { ContactDetails } from "./pages/ContactDetails";
import { Invoices } from "./pages/Invoices";
import { CreateInvoice } from "./pages/CreateInvoice";
import InvoiceConfiguration from "./pages/InvoiceConfiguration";
import { NotasCredito } from "./pages/CreateCreditNote";
import { Documents } from "./pages/Documents";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <>
              <TopBar />
              <Routes>
                <Route path="/" element={<Navigate to="/deals" replace />} />
                <Route path="/workflow/new" element={<WorkflowEditor />} />
                <Route path="/workflow/:id" element={<WorkflowEditor />} />
                <Route path="/contacts" element={<ContactsDirectory />} />
                <Route path="/contacts/:id" element={<ContactDetails />} />
                <Route path="/contacts/lists" element={<ContactLists />} />
                <Route
                  path="/contacts/lists/new"
                  element={<CreateContactList />}
                />
                <Route
                  path="/contacts/lists/:id"
                  element={<CreateContactList />}
                />
                <Route path="/whatsapp" element={<WhatsApp />} />
                <Route path="/whatsapp/:contactId" element={<WhatsApp />} />
                <Route path="/mass-whatsapp" element={<WhatsAppMass />} />
                <Route
                  path="/mass-whatsapp/new"
                  element={<WhatsAppMassNew />}
                />
                <Route path="/mass-email" element={<EmailMass />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/mass-email/new" element={<EmailMassNew />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/quotes/new" element={<QuoteEditor />} />
                <Route path="/quotes/:id" element={<QuoteEditor />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/snippets" element={<Fragments />} />
                <Route path="/email" element={<Email />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/social-media" element={<SocialMedia />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/products" element={<Products />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/automations/sequences" element={<Sequences />} />
                <Route path="/automations/templates" element={<Templates />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/new" element={<CreateInvoice />} />
                <Route
                  path="/invoices/settings"
                  element={<InvoiceConfiguration />}
                />
                <Route path="/notas-credito" element={<NotasCredito />} />
              </Routes>
            </>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
