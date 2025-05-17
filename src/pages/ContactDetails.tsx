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
import { useParams } from "react-router-dom";
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
  const [tags, setTags] = useState<string[]>(["VIP Client", "Tech Industry"]);
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
      pipeline: "Sales",
      status: { name: "as" },
      title: "New Deal",
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

  const { showLoading, hideLoading } = useLoading();

  const [aiComments, setAiComments] = useState<string>("");
  const [isLoadingAiComments, setIsLoadingAiComments] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

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
      console.error("Error fetching contact details:", error);
      toast.show({
        title: "Error",
        description: "Failed to load contact details",
        type: "error",
      });
    } finally {
      hideLoading();
    }
  };

  const getAiComments = async () => {
    try {
      setIsLoadingAiComments(true);
      const response: any = await contactsService.getAiComments(id as any);
      setAiComments(response.data.analysis);
    } catch (error) {
      console.error("Error obteniendo comentarios de IA:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los comentarios de IA",
        type: "error",
      });
    } finally {
      setIsLoadingAiComments(false);
    }
  };

  const handleGetQuotations = async () => {
    try {
      const response: any = await quotesService.searchQuotes(id as any);

      setQuotations(response.data.quotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
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
      console.error("Error generating PDF:", error);
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
      await getContact(); // Refresh contact data
      setShowEditModal(false);
      toast.show({
        title: "Success",
        description: "Contact updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.show({
        title: "Error",
        description: "Failed to update contact",
        type: "error",
      });
    }
  };

  const getActivities = async (contactId: string) => {
    const response: any = await contactsService.getActivities(contactId);
    console.log(response.data);
    setActivities(response.data);
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
          title: "Success",
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
          title: "Success",
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
        title: "Success",
        description: "Activity deleted successfully",
        type: "success",
      });
      await getActivities(contactDetails._id);
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.show({
        title: "Error",
        description: "Failed to delete activity",
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
        title: "Success",
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
        title: "Success",
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
    console.log(" click");
    console.log(form, " form");

    const response = await emailsService.sendEmail(form);
    console.log(response, " response");
  };

  useEffect(() => {
    getContact();
  }, [id]);

  useEffect(() => {
    if (contactDetails._id) {
      getAiComments();
    }
  }, [contactDetails._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-10 w-10 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {contactDetails.firstName} {contactDetails.lastName}{" "}
                </h1>
                <p className="text-gray-500">{contactDetails.companyType}</p>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-indigo-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Add tag..."
                    className="bg-transparent border-none text-sm focus:outline-none w-24"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowPrintModal(true)}
              >
                <Printer className="h-5 w-5 text-gray-600" />
                <span>Print</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Send className="h-5 w-5" />
                <span>Email</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="h-5 w-5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${dailyMetrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Negocios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyMetrics.totalDeals}
                </p>
              </div>
              <PlusCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lead Score</p>
                <p className="text-2xl font-bold text-gray-900">{leadScore}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ultimo pedido</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyMetrics?.lastDeal?.createdAt
                    ? new Date(
                        dailyMetrics.lastDeal.createdAt
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Sin negocios"}
                </p>
              </div>
              <Timer className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Contact Information</h2>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  {showDetails ? "Show Less" : "Show More"}
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transform transition-transform ${
                      showDetails ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="text-gray-700">
                      {contactDetails.companyName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneCall className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Celular</p>
                    <p className="text-gray-700">{contactDetails.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-700">{contactDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-700">
                      {contactDetails.address?.street}
                    </p>
                    <p className="text-gray-700">
                      {contactDetails.address?.city},{" "}
                      {contactDetails.address?.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extended Details */}
              {showDetails && (
                <div className="mt-6 border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Telefono
                      </p>
                      <p className="mt-1">{contactDetails.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        ID Type
                      </p>
                      <p className="mt-1">{contactDetails.idType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Número de Identificación
                      </p>
                      <p className="mt-1">{contactDetails.idNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Digito de Verificación
                      </p>
                      <p className="mt-1">{contactDetails.dv}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Notas</p>
                      <p className="mt-1">{contactDetails.notas}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Deals</h2>
              <div className="space-y-4">
                {deals.length > 0 ? (
                  deals.map((deal) => (
                    <div key={deal._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3
                            className="font-medium cursor-pointer hover:text-indigo-600 transition-colors text-blue-500"
                            onClick={() => {
                              setDealId(deal._id);
                              setShowDealDetailsModal(true);
                            }}
                          >
                            {deal.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Due:{" "}
                            {new Date(deal.closingDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="text-sm text-gray-500">
                              Etapa:{" "}
                            </span>
                            {deal?.status?.name}
                            {console.log(deal.status) as any}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <span className="font-semibold text-green-500">
                            {deal.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay negocios</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-1">
            <div
              className={`bg-white rounded-lg shadow p-6 my-2 relative ${
                isLoadingAiComments ? "gradient-border" : ""
              }`}
            >
              {isLoadingAiComments && (
                <div className="absolute inset-0 gradient-border-animation rounded-lg pointer-events-none"></div>
              )}
              <h2 className="text-lg font-semibold mb-4">Comentarios de IA</h2>
              {isLoadingAiComments ? (
                <p className="text-gray-500">Cargando comentarios de IA...</p>
              ) : aiComments === "" ? (
                <p className="text-gray-500">
                  Aquí puedes ver los comentarios de la IA sobre el contacto.
                </p>
              ) : (
                <AiComments comments={aiComments} />
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Actividades</h2>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Buscar Actividad..."
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity._id}
                      className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setActivityFormData(activity);
                        setShowActivityModal(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {activity.activityType === "Reunion" && (
                            <Users className="h-4 w-4 text-blue-500" />
                          )}
                          {activity.activityType === "Llamada" && (
                            <Phone className="h-4 w-4 text-green-500" />
                          )}
                          {activity.activityType === "Correo" && (
                            <Mail className="h-4 w-4 text-red-500" />
                          )}
                          {activity.activityType === "Nota" && (
                            <StickyNote className="h-4 w-4 text-yellow-500" />
                          )}
                          <p className="text-gray-700">{activity.title}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteActivity(activity._id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {activity.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold mb-4">Documentos</h2>
                <button
                  onClick={() => setShowUploadDocumentModal(true)}
                  className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors hover:scale-105"
                >
                  <PlusCircle className="h-5 w-5" />
                </button>
              </div>
              {documents.length === 0 && (
                <p className="text-gray-500">No hay documentos</p>
              )}
              {documents.length > 0 &&
                documents.map((document) => (
                  <div className="space-y-4" key={document._id}>
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowPreviewModal(true);
                        }}
                      >
                        <File className="h-5 w-5 text-gray-400" />
                        <p className="text-gray-700">{document.name}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(document._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6 mt-4">
              <h2 className="text-lg font-semibold mb-4">Cotizaciones</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  {quotations.length > 0 ? (
                    quotations.map((quotation) => (
                      <div
                        className="flex items-center space-x-2"
                        key={quotation._id}
                      >
                        <File className="h-5 w-5 text-gray-400" />
                        <div className="flex gap-2">
                          <p
                            className="text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
                            onClick={() =>
                              handlePrint(quotation.quotationNumber)
                            }
                          >
                            {quotation.quotationNumber}
                          </p>
                          <p className="text-gray-500">
                            (
                            {new Date(
                              quotation.creationDate
                            ).toLocaleDateString()}
                            )
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay cotizaciones</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
  );
}
