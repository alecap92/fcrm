import React, { useEffect, useState } from "react";
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
import { IContactDetails } from "../types/contact";

interface Note {
  id: number;
  text: string;
  date: string;
}

interface Deal {
  id: number;
  name: string;
  value: number;
  dueDate: string;
  progress: number;
  status: "active" | "pending" | "closed";
}

export function ContactDetails() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Follow up on Q1 proposal", date: "2024-03-10 14:30" },
  ]);
  const [newNote, setNewNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [tags, setTags] = useState<string[]>(["VIP Client", "Tech Industry"]);
  const [newTag, setNewTag] = useState("");
  const { id } = useParams();
  const [contactDetails, setContactDetails] = useState({
    firstName: "John",
    lastName: "Doe",
    position: "",
    email: "john.doe@techcorp.com",
    phone: "",
    mobile: "",
    address: "",
    city: "San Francisco",
    state: "California",
    companyName: "TechCorp Solutions",
    idType: "",
    idNumber: "",
    companyType: "Technology Services",
    totalIncome: "",
    price: "",
    lifeCycle: "",
    source: "",
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

  const getDisplayValue = (value: string) => {
    return value.trim() || "Not specified";
  };

  const getContact = async () => {
    try {
      if (!id) return;

      const response = (await contactsService.getContactById(id)) as any;
      const parsed = response.contact;
      setContactDetails(parsed);
      setDailyMetrics(response.resume);
      console.log(response.contact);
      setDeals(response.deals);
    } catch (error) {
      console.error("Error fetching contact details:", error);
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
                  {contactDetails.firstName} {contactDetails.lastName}
                </h1>
                <p className="text-gray-500">
                  {getDisplayValue(contactDetails.companyType)}
                </p>
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
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
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
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
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
                  {new Date(dailyMetrics.lastDeal.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )}
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
                      {getDisplayValue(contactDetails.companyName)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {getDisplayValue(contactDetails.companyType)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneCall className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-700">
                      {getDisplayValue(contactDetails.phone)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-700">
                      {getDisplayValue(contactDetails.email)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-700">
                      {getDisplayValue(contactDetails.address)}
                    </p>
                    <p className="text-gray-700">
                      {getDisplayValue(contactDetails.city)},{" "}
                      {getDisplayValue(contactDetails.state)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extended Details */}
              {showDetails && (
                <div className="mt-6 border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Mobile Phone
                      </p>
                      <p className="mt-1">
                        {getDisplayValue(contactDetails.mobile)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        ID Type
                      </p>
                      <p className="mt-1">
                        {getDisplayValue(contactDetails.idType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        ID Number
                      </p>
                      <p className="mt-1">
                        {getDisplayValue(contactDetails.idNumber)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Income
                      </p>
                      <p className="mt-1">
                        {getDisplayValue(contactDetails.totalIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="mt-1">
                        {getDisplayValue(contactDetails.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Life Cycle
                      </p>
                      <p className="mt-1">
                        {getDisplayValue(contactDetails.lifeCycle)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Source
                      </p>
                      <p className="mt-1">
                        {getDisplayValue(contactDetails.source)}
                      </p>
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
    </div>
  );
}
