import { useEffect, useState } from "react";
import {
  User,
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  DollarSign,
  PlusCircle,
  Clock,
  Trash2,
  BarChart3,
  CheckCircle2,
  Timer,
  Printer,
  MessageCircle,
  Send,
  ChevronDown,
  Tag,
  X,
  Pencil,
  Phone,
  Users,
  StickyNote,
  File,
} from "lucide-react";
import { contactsService } from "../services/contactsService";
import { useParams, useNavigate } from "react-router-dom";
import { Activity, Contact } from "../types/contact";
import { normalizeContact } from "../lib/parseContacts";
import AddContact from "../components/contacts/AddContact";
import { useToast } from "../components/ui/toast";
import PrintModal from "../components/contacts/PrintModal";
import ActivityModal from "../components/contacts/ActivityModal";
import { UploadModal } from "../components/documents/UploadModal";
import { DealDetailsModal } from "../components/deals/DealDetailsModal";
import { useAuth } from "../contexts/AuthContext";
import { PreviewModal } from "../components/documents/PreviewModal";
import quotesService from "../services/quotesService";
import { Quote } from "../types/quote";
import { useLoading } from "../contexts/LoadingContext";
import AiComments from "../components/contacts/AiComments";
import { ComposeEmail } from "../components/email/ComposeEmail";
import emailsService from "../services/emailService";
import { useChatModule } from "../components/chat/floating";
import ContactLayout from "../components/contacts/ContactLayout";
import ContactProfileCard from "../components/contacts/ContactProfileCard";
import ContactKpis from "../components/contacts/ContactKpis";
import Tabs from "../components/ui/Tabs";
import ActivityList from "../components/contacts/ActivityList";
import DealsList from "../components/contacts/DealsList";
import DocumentsList from "../components/contacts/DocumentsList";
import QuotationsList from "../components/contacts/QuotationsList";
import NotesPanel from "../components/contacts/NotesPanel";
import { useDeals } from "../contexts/DealsContext";
import { CreateDealModal } from "../components/deals/CreateDealModal";

interface Document {
  _id?: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export function ContactDetails() {
  const [newNote, setNewNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [tags, setTags] = useState<string[]>([
    "Cliente VIP",
    "Industria tecnológica",
  ]);
  const [newTag, setNewTag] = useState("");
  const { id } = useParams();
  const [contact, setContact] = useState([]);
  const [contactDetails, setContactDetails] = useState<Contact>({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    companyType: "",
    position: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    tags: [],
    createdAt: "",
    updatedAt: "",
    taxId: "",
    dv: "",
    notas: "",
    lifeCycle: "",
  });
  const [deals, setDeals] = useState([
    {
      _id: "1",
      amount: 0,
      closingDate: new Date(),
      createdAt: new Date(),
      pipeline: "Ventas",
      status: { name: "as" },
      title: "Nuevo negocio",
    },
  ]);
  const [dailyMetrics, setDailyMetrics] = useState({
    totalRevenue: "0",
    lastDeal: {
      createdAt: new Date(),
    },
    totalDeals: 0,
    totalNotes: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] =
    useState<boolean>(false);
  const [activityFormData, setActivityFormData] = useState<Activity>({
    activityType: "Reunion",
    title: "",
    date: "",
    notes: "",
    status: "incomplete",
    _id: "",
    organizationId: "",
    ownerId: "",
    contactId: "",
    createdAt: "",
    updatedAt: "",
    reminder: "",
  });
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showDealDetailsModal, setShowDealDetailsModal] = useState(false);
  const [dealId, setDealId] = useState("");
  const toast = useToast();
  const { user, organization } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [quotations, setQuotations] = useState<Quote[]>([]);
  const [leadScore, setLeadScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("activity");

  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const {
    openCreateDealModal,
    showCreateDealModal,
    closeCreateDealModal,
    createDeal,
  } = useDeals();

  const [aiComments, setAiComments] = useState<string>("");
  const [isLoadingAiComments, setIsLoadingAiComments] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Hook para integración con chat contextual
  const chatModule = useChatModule("contacts");

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const getContact = async () => {
    try {
      if (!id) return;

      showLoading("Cargando contacto...");

      const response: any = await contactsService.getContactById(id);
      const normalized = normalizeContact(response.data.contact);

      setDocuments(response.data.contact.files);

      setContact(response.data.contact);
      setContactDetails(normalized);
      setDailyMetrics(response.data.resume);
      setDeals(response.data.deals);
      setTags(normalized.tags || []);
      setLeadScore(response.data.contact.leadScore);

      await getActivities(response.data.contact._id);
      await handleGetQuotations();
    } catch (error) {
      console.error("Error al obtener los detalles del contacto:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los detalles del contacto",
        type: "error",
      });
    } finally {
      hideLoading();
    }
  };

  // const getAiComments = async () => {
  //   try {
  //     setIsLoadingAiComments(true);
  //     const response: any = await contactsService.getAiComments(id as any);
  //     setAiComments(response.data.analysis);
  //   } catch (error) {
  //     console.error("Error obteniendo comentarios de IA:", error);
  //     toast.show({
  //       title: "Error",
  //       description: "No se pudieron cargar los comentarios de IA",
  //       type: "error",
  //     });
  //   } finally {
  //     setIsLoadingAiComments(false);
  //   }
  // };

  const handleGetQuotations = async () => {
    try {
      const response: any = await quotesService.searchQuotes(id as any);

      setQuotations(response.data.quotations);
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error);
    }
  };

  const handlePrint = async (quoteId: string) => {
    try {
      showLoading("Generando PDF de la cotización...");
      const response = await quotesService.printQuote(quoteId);

      const blob = await response.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion_${quoteId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando el PDF:", error);
    } finally {
      hideLoading();
    }
  };

  const handleUpdateContact = async (updatedData: any) => {
    try {
      if (!id) return;

      // Format the data for the API
      const properties = [
        { key: "firstName", value: updatedData.firstName },
        { key: "lastName", value: updatedData.lastName },
        { key: "email", value: updatedData.email },
        { key: "phone", value: updatedData.phone },
        { key: "companyName", value: updatedData.companyName },
        { key: "companyType", value: updatedData.companyType },
        { key: "mobile", value: updatedData.mobile },
        { key: "idType", value: updatedData.idType },
        { key: "tags", value: updatedData.tags },
        { key: "phone", value: updatedData.phone },
        { key: "position", value: updatedData.position },
        { key: "city", value: updatedData.city },
        { key: "state", value: updatedData.state },
        { key: "country", value: updatedData.country },
        { key: "address", value: updatedData.address },
        { key: "idNumber", value: updatedData.idNumber },
        { key: "dv", value: updatedData.dv },
        { key: "notas", value: updatedData.notas },
        { key: "lifeCycle", value: updatedData.lifeCycle },
      ];

      await contactsService.updateContact(id, {
        ...contact,
        properties,
      });
      await getContact(); // Refrescar datos del contacto
      setShowEditModal(false);
      toast.show({
        title: "Éxito",
        description: "Contacto actualizado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error actualizando el contacto:", error);
      toast.show({
        title: "Error",
        description: "No se pudo actualizar el contacto",
        type: "error",
      });
    }
  };

  const getActivities = async (contactId: string) => {
    setIsLoadingActivities(true);
    try {
      const response: any = await contactsService.getActivities(contactId);
      setActivities(response.data);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Si el formulario tiene ID, estamos editando
      if (activityFormData._id) {
        console.log("activityFormData", contactDetails._id);
        await contactsService.updateActivity(activityFormData._id, {
          ...activityFormData,
          contactId: contactDetails._id,
        });
        toast.show({
          title: "Éxito",
          description: "Actividad actualizada correctamente",
          type: "success",
        });
      } else {
        // Si no tiene ID, estamos creando

        await contactsService.createActivity({
          ...activityFormData,
          contactId: contactDetails._id,
        });
        toast.show({
          title: "Éxito",
          description: "Actividad creada correctamente",
          type: "success",
        });
      }

      getContact();
      setShowActivityModal(false);

      // Resetear el formulario a valores iniciales
      setActivityFormData({
        activityType: "Reunion",
        title: "",
        date: "",
        notes: "",
        status: "incomplete",
        _id: "",
        organizationId: "",
        ownerId: "",
        contactId: "",
        createdAt: "",
        updatedAt: "",
        reminder: "",
      });
    } catch (error) {
      console.error("Error con la actividad:", error);
      toast.show({
        title: "Error",
        description: "Error al procesar la actividad",
        type: "error",
      });
    }
  };
  const deleteActivity = async (activityId: string) => {
    console.log("activityId", activityId);
    try {
      await contactsService.deleteActivity(activityId);
      toast.show({
        title: "Éxito",
        description: "Actividad eliminada correctamente",
        type: "success",
      });
      await getActivities(contactDetails._id);
    } catch (error) {
      console.error("Error eliminando la actividad:", error);
      toast.show({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        type: "error",
      });
    }
  };

  const deleteDocument = async (fileId?: string) => {
    if (!fileId) return;
    try {
      await contactsService.deleteFile(contactDetails._id, fileId);
      setDocuments(documents.filter((doc) => doc._id !== fileId));
      toast.show({
        title: "Éxito",
        description: "Documento eliminado correctamente",
        type: "success",
      });
      await getContact();
    } catch (error) {
      console.error("Error eliminando documento:", error);
      toast.show({
        title: "Error",
        description: "Error al eliminar documento",
        type: "error",
      });
    }
  };

  const handleUploadDocument = async (files: FileList) => {
    if (files.length === 0) return;

    try {
      const file = files[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("organizationId", organization?._id || "");
      formData.append("uploadedBy", user?._id || "");
      formData.append("contactId", contactDetails._id);

      await contactsService.uploadDocument(formData);

      toast.show({
        title: "Éxito",
        description: "Documento subido correctamente",
        type: "success",
      });
      getContact();
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast.show({
        title: "Error",
        description: "Error al subir documento",
        type: "error",
      });
    }
  };

  const handleSendEmail = async (form: {
    to: string[];
    subject: string;
    content: string;
  }) => {
    try {
      console.log("Enviando correo...", form);

      const response = await emailsService.sendEmail(form);
      console.log("Respuesta del servidor:", response);

      // Mostrar toast de éxito
      toast.show({
        title: "Correo enviado exitosamente",
        description: `El correo fue enviado a ${form.to.join(", ")}`,
        type: "success",
        duration: 4000,
      });

      // Cerrar el modal de email
      setShowEmailModal(false);
    } catch (error) {
      console.error("Error al enviar el correo:", error);

      // Mostrar toast de error
      toast.show({
        title: "Error al enviar el correo",
        description:
          "Hubo un problema al enviar el correo. Por favor, inténtalo de nuevo.",
        type: "error",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    getContact();
  }, [id]);

  // useEffect(() => {
  //   if (contactDetails._id) {
  //     // getAiComments();
  //   }
  // }, [contactDetails._id]);

  // Actualizar contexto del chat cuando cambien los datos del contacto
  useEffect(() => {
    if (contactDetails._id && deals.length >= 0) {
      const contactDataForChat = {
        ...contactDetails,
        deals,
        leadScore,
        dailyMetrics,
      };

      chatModule.updateChatContext(contactDataForChat, {
        currentPage: "detalles-contacto",
        totalCount: deals.length,
      });

      // Agregar sugerencias específicas basadas en los datos
      if (deals.length > 0) {
        const totalValue = deals.reduce(
          (sum, deal) => sum + (deal.amount || 0),
          0
        );
        const avgValue = totalValue / deals.length;

        if (avgValue > 10000) {
          chatModule.sendSuggestion(
            "Este es un cliente de alto valor, ¿cómo mantener la relación?"
          );
        }

        chatModule.sendSuggestion(
          "¿Cuál es el valor promedio de compra de este contacto?"
        );
      } else {
        chatModule.sendSuggestion(
          "¿Cómo convertir este contacto en su primer deal?"
        );
      }
    }
  }, [contactDetails, deals, leadScore, dailyMetrics]);

  return (
    <ContactLayout
      header={
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Detalles del contacto
            </h1>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="h-5 w-5 text-gray-600" />
                <span>Editar</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => {
                  openCreateDealModal();
                }}
              >
                <PlusCircle className="h-5 w-5" />
                <span>Nuevo Deal</span>
              </button>
            </div>
          </div>
        </div>
      }
      kpis={
        <ContactKpis
          totalRevenue={Number(dailyMetrics.totalRevenue || 0)}
          lastDealDate={dailyMetrics?.lastDeal?.createdAt || null}
          leadScore={leadScore}
        />
      }
      sidebar={
        <ContactProfileCard
          avatar={<User className="h-10 w-10 text-indigo-600" />}
          fullName={`${contactDetails.firstName} ${contactDetails.lastName}`}
          position={contactDetails.position}
          company={contactDetails.companyName}
          onWhatsApp={() => {
            const phoneToOpen = contactDetails.mobile || contactDetails.phone;
            if (phoneToOpen) {
              navigate(
                `/conversations?openPhone=${encodeURIComponent(phoneToOpen)}`
              );
            } else {
              toast.show({
                title: "Sin número",
                description: "Este contacto no tiene número de teléfono",
                type: "warning",
              });
            }
          }}
          onEmail={() => setShowEmailModal(true)}
          onCall={() => {
            const phone = contactDetails.mobile || contactDetails.phone;
            if (phone) {
              window.open(`tel:${phone}`, "_self");
            } else {
              toast.show({
                title: "Sin número",
                description: "Este contacto no tiene número de teléfono",
                type: "warning",
              });
            }
          }}
          onSchedule={() => setShowActivityModal(true)}
          info={[
            {
              icon: <Building2 className="h-5 w-5" />,
              label: "Empresa",
              value: contactDetails.companyName,
            },
            {
              icon: <PhoneCall className="h-5 w-5" />,
              label: "Celular",
              value: contactDetails.mobile || contactDetails.phone,
            },
            {
              icon: <Mail className="h-5 w-5" />,
              label: "Email",
              value: contactDetails.email,
            },
            {
              icon: <MapPin className="h-5 w-5" />,
              label: "Ubicación",
              value: (
                <span>
                  {contactDetails.address?.street}
                  {contactDetails.address?.city
                    ? `, ${contactDetails.address.city}`
                    : ""}
                  {contactDetails.address?.state
                    ? `, ${contactDetails.address.state}`
                    : ""}
                </span>
              ),
            },
          ]}
          tags={tags}
          onRemoveTag={removeTag}
          newTag={newTag}
          onNewTagChange={setNewTag}
          onAddTagKeyDown={addTag}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails(!showDetails)}
          extraDetails={[
            { label: "Telefono", value: contactDetails.phone },
            { label: "ID Type", value: contactDetails.idType },
            {
              label: "Número de Identificación",
              value: contactDetails.idNumber,
            },
            { label: "Digito de Verificación", value: contactDetails.dv },
            { label: "Notas", value: contactDetails.notas },
          ]}
        />
      }
    >
      <div className="space-y-8">
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          items={[
            {
              id: "activity",
              label: "Actividad",
              content: (
                <ActivityList
                  activities={activities}
                  searchValue={newNote}
                  onSearchChange={(v) => setNewNote(v)}
                  onCreate={() => setShowActivityModal(true)}
                  onSelect={(a) => {
                    setActivityFormData(a);
                    setShowActivityModal(true);
                  }}
                  onDelete={(id) => deleteActivity(id)}
                  isLoading={isLoadingActivities}
                />
              ),
            },
            {
              id: "deals",
              label: "Negocios",
              content: (
                <DealsList
                  deals={deals as any}
                  onOpen={(dId) => {
                    setDealId(dId);
                    setShowDealDetailsModal(true);
                  }}
                />
              ),
            },
            {
              id: "quotations",
              label: "Cotizaciones",
              content: (
                <QuotationsList
                  quotations={quotations}
                  onPrint={(num) => handlePrint(num)}
                />
              ),
            },
            {
              id: "files",
              label: "Archivos",
              content: (
                <DocumentsList
                  title="Archivos"
                  documents={documents as any}
                  onPreview={(doc) => {
                    setSelectedDocument(doc as any);
                    setShowPreviewModal(true);
                  }}
                  onDelete={(docId) => deleteDocument(docId)}
                  onOpenUpload={() => setShowUploadDocumentModal(true)}
                />
              ),
            },
            {
              id: "notes",
              label: "Notas",
              content: (
                <NotesPanel
                  initialNotes={contactDetails.notas || ""}
                  onSave={async (value) => {
                    // persiste las notas usando la API de updateContact existente
                    await handleUpdateContact({
                      ...contactDetails,
                      notas: value,
                    });
                  }}
                />
              ),
            },
            {
              id: "plugins",
              label: "Complementos",
              content: (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Printer className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Imprimir</div>
                          <div className="text-sm text-gray-500">
                            Imprime la vista actual del contacto.
                          </div>
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        onClick={() => setShowPrintModal(true)}
                      >
                        Imprimir
                      </button>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />

        <PreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          document={selectedDocument as any}
        />

        <UploadModal
          isOpen={showUploadDocumentModal}
          onClose={() => setShowUploadDocumentModal(false)}
          onUpload={handleUploadDocument}
        />

        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          onSubmit={handleAddActivity}
          formData={activityFormData}
          setFormData={setActivityFormData}
        />

        {showEmailModal ? (
          <ComposeEmail
            onClose={() => setShowEmailModal(false)}
            handleSendEmail={handleSendEmail}
            defaultRecipientsEmail={[contactDetails.email as any]}
          />
        ) : null}

        {/* Edit Contact Modal */}
        <AddContact
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateContact}
          initialData={contactDetails}
        />

        {/* Create Deal Modal (desde contexto) */}
        <CreateDealModal
          isOpen={showCreateDealModal}
          onClose={closeCreateDealModal}
          onSubmit={createDeal}
          initialStage={""}
          initialData={null}
          preselectedContact={contactDetails}
        />

        {showPrintModal && (
          <PrintModal
            contact={contact}
            onClose={() => setShowPrintModal(false)}
          />
        )}

        {showDealDetailsModal && (
          <DealDetailsModal
            // isOpen={showDealDetailsModal}
            onClose={() => setShowDealDetailsModal(false)}
            dealId={dealId}
            deal={[] as any}
            onEdit={() => setShowDealDetailsModal(true)}
          />
        )}
      </div>
    </ContactLayout>
  );
}
