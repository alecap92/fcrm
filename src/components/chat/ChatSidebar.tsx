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
    <div className="w-80 border-l border-gray-200 flex flex-col">
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

      <CreateContactModal
        isOpen={isCreateContactModalOpen}
        onClose={() => setIsCreateContactModalOpen(false)}
        onSubmit={handleCreateContactWrapper}
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
