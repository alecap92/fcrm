import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Tag as TagIcon,
  MessageSquare,
  FileText,
  Link,
  BarChart,
  ChevronRight,
  Edit2,
} from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";
import type { Deal } from "../../types/deal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { normalizeContact } from "../../lib/parseContacts";

interface DealDetailsModalProps {
  deal: Deal;
  onClose: () => void;
  onEdit: () => void;
}

export function DealDetailsModal({
  deal,
  onClose,
  onEdit,
}: DealDetailsModalProps) {
  const navigate = useNavigate();
  const [contact, setContact] = useState<any>([]);

  const handleRedirect = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const parseContactInfo = () => {
    //  const response = await contactsService.searchContacts(searchTerm);
    //  setContacts(response.data.map(normalizeContact));

    const parsedContact = [deal.associatedContactId].map(normalizeContact);
    setContact(parsedContact[0]);
  };

  useEffect(() => {
    parseContactInfo();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {deal.title}
                  {console.log(deal) as any}
                </h2>
                <p
                  className="text-sm text-blue-500 cursor-pointer"
                  onClick={() => handleRedirect(contact.id)}
                >
                  {contact.firstName}
                </p>
                <p className="text-sm text-gray-500">{contact.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">New comment added</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Document attached</p>
                      <p className="text-sm text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Value updated</p>
                      <p className="text-sm text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Tasks</h3>
                  <Button variant="outline" size="sm">
                    Add Task
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-900">
                      Send updated proposal
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      Due tomorrow
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-900">
                      Schedule follow-up meeting
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      Due in 3 days
                    </span>
                  </div>
                </div>
              </div>

              {/* Files */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Files</h3>
                  <Button variant="outline" size="sm">
                    Upload File
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        proposal_v1.pdf
                      </p>
                      <p className="text-xs text-gray-500">
                        2.5 MB • Uploaded 2 days ago
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        contract.docx
                      </p>
                      <p className="text-xs text-gray-500">
                        1.8 MB • Uploaded 1 week ago
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deal Info */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Deal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Value
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ${deal.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Expected Close
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(deal.closingDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Created
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(deal.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {deal.associatedContactId?.properties?.companyName}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {deal.associatedContactId?.properties?.email}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {deal.associatedContactId?.properties?.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Fields */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Custom Fields
                </h3>
                <div className="space-y-3">
                  {deal.fields?.map((field: any) => (
                    <div
                      key={field.field._id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-500">
                        {field.field.name}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {field.value}
                      </span>
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
