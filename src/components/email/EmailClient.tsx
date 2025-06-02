import React from "react";
import { useEmail } from "../../contexts/EmailContext";
import { useEmailSearch } from "../../hooks/useEmailSearch";
import { useEmailOperations } from "../../hooks/useEmailOperations";
import { EmailList } from "./EmailList";
import { EmailView } from "./EmailView";
import { ComposeEmail } from "./ComposeEmail";
import { EmailSetup } from "./EmailSetup";
import { EmailToolbar } from "./EmailToolbar";
import { Mail } from "lucide-react";

export function EmailClient() {
  const { state, selectEmail, setComposing, selectFolder, sendEmail } =
    useEmail();
  const { searchResults, hasSearched } = useEmailSearch();
  const { toggleSelection, selectAll, clearSelection } = useEmailOperations();

  // Si no hay configuración de email, mostrar pantalla de configuración
  if (!state.emailSettings) {
    return <EmailSetup />;
  }

  const emailsToShow = hasSearched ? searchResults : state.emails;

  const handleCloseEmail = () => {
    selectEmail(null);
  };

  const handleCloseCompose = () => {
    setComposing(false);
  };

  const handleCompose = () => {
    setComposing(true);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      selectAll();
    } else {
      clearSelection();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Barra de herramientas superior */}
      <EmailToolbar
        onCompose={handleCompose}
        currentFolder={state.currentFolder}
        emailCount={emailsToShow.length}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List */}
        <div
          className={`w-full lg:w-[400px] bg-white border-r flex flex-col ${
            state.selectedEmail ? "hidden lg:flex" : "flex"
          }`}
        >
          <EmailList
            emails={emailsToShow}
            selectedEmail={state.selectedEmail}
            onSelectEmail={selectEmail}
            selectedEmails={state.selectedEmails}
            onSelectEmailCheckbox={toggleSelection}
            onSelectAll={handleSelectAll}
          />
        </div>

        {/* Email View */}
        {state.selectedEmail ? (
          <EmailView email={state.selectedEmail} onClose={handleCloseEmail} />
        ) : !state.isComposing ? (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900">
                Selecciona un correo para ver
              </h2>
              <p className="mt-1 text-gray-500">
                Elige un correo de la lista para ver su contenido
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Compose Email Modal */}
      {state.isComposing && (
        <ComposeEmail
          onClose={handleCloseCompose}
          handleSendEmail={sendEmail}
        />
      )}
    </div>
  );
}
