import React, { useState } from "react";
import CreateContactModal from "../contacts/AddContact";
import { CreateDealModal } from "../deals/CreateDealModal";
import { useChatSidebar } from "../../hooks/useChatSidebar";
import { TagsSection } from "./sidebar/TagsSection";
import { AssignmentSection } from "./sidebar/AssignmentSection";
import { ContactInfo } from "./sidebar/ContactInfo";
import { DealsSection } from "./sidebar/DealsSection";
import AutomationsSection from "./sidebar/AutomationsSection";

interface ConversationData {
  _id: string;
  title: string;
  organization: string;
  participants: {
    user: {
      reference: string;
      type: "User";
    };
    contact: {
      reference: string;
      type: "Contact";
      contactId: string;
      displayInfo?: {
        mobile?: string;
        name?: string;
        lastName?: string;
        email?: string;
        position?: string;
        contactId?: string;
      };
    };
  };
  unreadCount: number;
  pipeline: any;
  currentStage: number;
  assignedTo: {
    _id: string;
    email: string;
    name: string;
  };
  isResolved: boolean;
  priority: string;
  tags: string[];
  firstContactTimestamp: string;
  metadata: Array<{
    key: string;
    value: string;
    _id: string;
  }>;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  chatId: string;
  conversation?: ConversationData;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chatId, conversation }) => {
  // Estados para modales
  const [isCreateContactModalOpen, setIsCreateContactModalOpen] =
    useState<boolean>(false);
  const [isCreateDealModalOpen, setIsCreateDealModalOpen] =
    useState<boolean>(false);

  // Hook personalizado para la lógica del sidebar
  const {
    newTag,
    setNewTag,
    tags,
    employees,
    contact,
    contactLoading,
    contactError,
    deals,
    hasContactId,
    handleAddTag,
    handleDeleteTag,
    handleEmployeeChange,
    handleCreateContact,
    handleCreateDeal,
  } = useChatSidebar(chatId, conversation);

  // Función para extraer datos del contacto de la conversación
  const extractContactDataFromConversation = (
    conversation: ConversationData
  ) => {
    // Extraer datos del displayInfo del contacto
    const displayInfo = conversation.participants?.contact?.displayInfo;

    if (displayInfo) {
      // Remover el + del número de teléfono para guardar solo el número
      const formattedPhone = displayInfo.mobile?.startsWith("+")
        ? displayInfo.mobile.substring(1)
        : displayInfo.mobile;

      // Usar el título para el nombre ya que displayInfo.name tiene el número
      const titleParts = conversation.title.split(" ");
      const firstName = titleParts[0] || "";
      const lastName = titleParts.slice(1).join(" ") || "";

      const extractedData = {
        firstName,
        lastName,
        mobile: formattedPhone,
        email: displayInfo.email || "",
        phone: "",
        companyName: "",
        companyType: "",
        idNumber: "",
        position: displayInfo.position || "",
        website: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        source: "",
        tags: "",
        notas: "",
        dv: "",
        idType: "",
        lifeCycle: "",
      };

      console.log("Datos extraídos de la conversación:", {
        conversation,
        extractedData,
      });
      return extractedData;
    }

    // Fallback: extraer del título si no hay displayInfo
    const title = conversation.title;
    const parts = title.split(" - ");
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const phone = parts[1].trim();

      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const formattedPhone = phone.startsWith("+") ? phone.substring(1) : phone;

      const fallbackData = {
        firstName,
        lastName,
        mobile: formattedPhone,
        email: "",
        phone: "",
        companyName: "",
        companyType: "",
        idNumber: "",
        position: "",
        website: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        source: "",
        tags: "",
        notas: "",
        dv: "",
        idType: "",
        lifeCycle: "",
      };

      console.log("Datos de fallback desde título:", { title, fallbackData });
      return fallbackData;
    }

    // Último fallback: solo el nombre del título
    const finalFallback = {
      firstName: title.trim(),
      lastName: "",
      mobile: "",
      email: "",
      phone: "",
      companyName: "",
      companyType: "",
      idNumber: "",
      position: "",
      website: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      source: "",
      tags: "",
      notas: "",
      dv: "",
      idType: "",
      lifeCycle: "",
    };

    console.log("Datos finales de fallback:", { title, finalFallback });
    return finalFallback;
  };

  // Funciones para manejar modales
  const handleCreateContactWrapper = async (contactData: any) => {
    await handleCreateContact(contactData);
    setIsCreateContactModalOpen(false);
  };

  const handleCreateDealWrapper = async (dealData: any) => {
    await handleCreateDeal(dealData);
    setIsCreateDealModalOpen(false);
  };

  if (!conversation) {
    return (
      <div className="w-80 border-l border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  console.log(conversation);

  return (
    <div className="w-80 border-l border-gray-200 flex flex-col h-full">
      {/* Contenedor con scroll para el contenido del sidebar */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <AutomationsSection
          conversationId={conversation._id}
          contactId={conversation.participants.contact.reference}
          userId={conversation.participants.user.reference}
          organizationId={conversation.organization}
        />

        <TagsSection
          tags={tags}
          newTag={newTag}
          onNewTagChange={setNewTag}
          onAddTag={handleAddTag}
          onDeleteTag={handleDeleteTag}
        />

        <AssignmentSection
          employees={employees}
          assignedToId={conversation?.assignedTo?._id}
          onEmployeeChange={handleEmployeeChange}
        />

        <ContactInfo
          contact={contact}
          conversationTitle={conversation.title}
          contactLoading={contactLoading}
          contactError={contactError}
          hasContactId={hasContactId}
          onCreateContact={() => setIsCreateContactModalOpen(true)}
        />

        <DealsSection
          deals={deals}
          onCreateDeal={() => setIsCreateDealModalOpen(true)}
        />
      </div>

      <CreateContactModal
        isOpen={isCreateContactModalOpen}
        onClose={() => setIsCreateContactModalOpen(false)}
        onSubmit={handleCreateContactWrapper}
        initialData={extractContactDataFromConversation(conversation) as any}
      />

      <CreateDealModal
        isOpen={isCreateDealModalOpen}
        onClose={() => setIsCreateDealModalOpen(false)}
        onSubmit={handleCreateDealWrapper}
        initialStage="66c6370ad573dacc51e620f0"
        initialData={null}
        preselectedContact={contact as any}
      />
    </div>
  );
};

export default ChatSidebar;
