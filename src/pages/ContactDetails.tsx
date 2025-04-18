import { useEffect, useState } from "react";
import {
  User,
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  DollarSign,
  MessageSquare,
  Calendar,
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
} from "lucide-react";
import { contactsService } from "../services/contactsService";
import { useParams } from "react-router-dom";
import { Contact } from "../types/contact";
import { normalizeContact } from "../lib/parseContacts";
import AddContact from "../components/contacts/AddContact";
import { useToast } from "../components/ui/toast";
import PrintModal from "../components/contacts/PrintModal";

interface Note {
  id: number;
  text: string;
  date: string;
}

export function ContactDetails() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Follow up on Q1 proposal", date: "2024-03-10 14:30" },
  ]);
  const [newNote, setNewNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [tags, setTags] = useState<string[]>(["VIP Client", "Tech Industry"]);
  const [newTag, setNewTag] = useState("");
  const { id } = useParams();
  const [contact, setContact] = useState([]);
  const [contactDetails, setContactDetails] = useState<Contact>({
    id: "",
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
  const toast = useToast();

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([
        ...notes,
        {
          id: Date.now(),
          text: newNote,
          date: new Date().toLocaleString(),
        },
      ]);
      setNewNote("");
    }
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

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

      const response: any = await contactsService.getContactById(id);
      const normalized = normalizeContact(response.data.contact);

      setContact(response.data.contact);
      setContactDetails(normalized);
      setDailyMetrics(response.data.resume);
      setDeals(response.data.deals);
      setTags(normalized.tags || []);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      toast.show({
        title: "Error",
        description: "Failed to load contact details",
        type: "error",
      });
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

  useEffect(() => {
    getContact();
  }, [id]);

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
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
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
                <p className="text-sm text-gray-500">Total de notas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyMetrics.totalNotes}
                </p>
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
                  </div>
                </div>
              )}
            </div>

            {/* Deals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Deals</h2>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{deal.title}</h3>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(deal.closingDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="text-sm text-gray-500">Etapa: </span>
                          {deal.status.name}
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
                ))}
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Recent Conversations
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">Product Demo Call</p>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Discussed new feature requirements and timeline for Q2
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">Meeting Scheduled</p>
                      <span className="text-sm text-gray-500">1 week ago</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Follow-up meeting scheduled for next sprint planning
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addNote}
                    className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-700">{note.text}</p>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {note.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
