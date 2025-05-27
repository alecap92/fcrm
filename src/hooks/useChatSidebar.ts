import { useState, useEffect, useCallback } from "react";
import { conversationService } from "../services/conversationService";
import { contactsService } from "../services/contactsService";
import { dealsService } from "../services/dealsService";
import { normalizeContact } from "../lib/parseContacts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/toast";

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

export const useChatSidebar = (
  chatId: string,
  conversation?: ConversationData
) => {
  // Estados
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [contact, setContact] = useState<any>(null);
  const [contactLoading, setContactLoading] = useState<boolean>(false);
  const [contactError, setContactError] = useState<boolean>(false);
  const [deals, setDeals] = useState<any[]>([]);

  // Hooks
  const { organization } = useAuth();
  const toast = useToast();

  // Función para manejar etiquetas
  const handleAddTag = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && newTag.trim()) {
        e.preventDefault();
        const updatedTags = [...tags, newTag.trim()];
        setTags(updatedTags);
        setNewTag("");

        try {
          if (!conversation) return;
          await conversationService.editConversation(conversation._id, {
            tags: updatedTags,
          });
        } catch (error) {
          console.error("Error al guardar la etiqueta:", error);
          setTags(tags);
        }
      }
    },
    [newTag, tags, conversation]
  );

  const handleDeleteTag = useCallback(
    async (tagToDelete: string) => {
      const updatedTags = tags.filter((tag) => tag !== tagToDelete);
      setTags(updatedTags);

      try {
        await conversationService.editConversation(chatId, {
          tags: updatedTags,
        });
      } catch (error) {
        console.error("Error al eliminar la etiqueta:", error);
        setTags(tags);
      }
    },
    [tags, chatId]
  );

  // Función para cambiar empleado asignado
  const handleEmployeeChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const employeeId = e.target.value;
      try {
        await conversationService.editConversation(chatId, {
          assignedTo: employeeId,
        });
      } catch (error) {
        console.error("Error al cambiar el empleado:", error);
      }
    },
    [chatId]
  );

  // Función para obtener contacto
  const handleFetchContact = useCallback(async () => {
    try {
      if (!conversation || !conversation.participants?.contact?.contactId) {
        setContactError(true);
        return;
      }

      setContactLoading(true);
      setContactError(false);

      const { data } = await contactsService.getContactById(
        conversation.participants.contact.contactId
      );

      const parsedContact = [data.contact].map(normalizeContact)[0];
      setContact(parsedContact);
      setDeals(data.deals);
      setContactLoading(false);
    } catch (error) {
      console.error("Error al obtener el contacto:", error);
      setContactError(true);
      setContactLoading(false);
    }
  }, [conversation]);

  // Función para crear contacto
  const handleCreateContact = useCallback(
    async (contactData: any) => {
      try {
        await contactsService.createContact(contactData);

        toast.show({
          title: "Contacto creado correctamente",
          description: "El contacto ha sido creado correctamente",
          type: "success",
        });

        // Resetear estados
        setContact(null);
        setDeals([]);
        setTags([]);
        setNewTag("");

        // Asociar contacto al chat
        await conversationService.editConversation(chatId, {
          participants: {
            contact: {
              contactId: contactData.mobile,
            },
          },
        });

        // Actualizar contacto
        await handleFetchContact();
      } catch (error) {
        console.error("Error al crear el contacto:", error);
        toast.show({
          title: "Error al crear el contacto",
          description: "El contacto no ha sido creado correctamente",
          type: "error",
        });
      }
    },
    [chatId, handleFetchContact, toast]
  );

  // Función para crear deal
  const handleCreateDeal = useCallback(
    async (dealData: any) => {
      try {
        const form = {
          title: dealData.name,
          amount: Number(dealData.value),
          closingDate: dealData.expectedCloseDate,
          associatedContactId: contact?._id,
          pipeline: "66c6370ad573dacc51e620f0",
          status: dealData.stage,
          fields: dealData.fields,
          products: dealData.products,
        };

        const response = await dealsService.createDeal(form as any);
        setDeals((prev: any[]) => [...prev, response.deal]);

        toast.show({
          title: "Negocio creado",
          description: "El nuevo negocio se ha creado exitosamente",
          type: "success",
        });
      } catch (error) {
        console.error("Error creating deal:", error);
        toast.show({
          title: "Error",
          description: "No se pudo crear el negocio",
          type: "error",
        });
      }
    },
    [contact, toast]
  );

  // Efectos
  useEffect(() => {
    handleFetchContact();
    if (organization) {
      setEmployees(organization.employees);
    }
  }, [organization, conversation, handleFetchContact]);

  useEffect(() => {
    if (conversation) {
      setTags(conversation.tags || []);
    }
  }, [conversation]);

  return {
    // Estados
    newTag,
    setNewTag,
    tags,
    employees,
    contact,
    contactLoading,
    contactError,
    deals,

    // Funciones
    handleAddTag,
    handleDeleteTag,
    handleEmployeeChange,
    handleCreateContact,
    handleCreateDeal,

    // Propiedades computadas
    hasContactId: !!conversation?.participants?.contact?.contactId,
  };
};
