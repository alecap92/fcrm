// Refactored SearchModal.tsx
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Building2,
  DollarSign,
  Calendar,
  Phone,
  MapPin,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { useDebouncer } from "../../hooks/useDebbouncer";
import advanceSearchService from "../../services/advanceSearchService";
import { normalizeContact } from "../../lib/parseContacts";
import type { Contact } from "../../types/contact";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "contacts" | "deals">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    contacts: Contact[];
    deals: any[];
  }>({
    contacts: [],
    deals: [],
  });

  const debouncedSearch = useDebouncer(searchTerm, 500);

  const handleSearch = async (term: string) => {
    try {
      setIsLoading(true);
      const response = await advanceSearchService.AdvanceSearch(term);
      console.log(response, 12);
      const contacts = response.contacts.map(normalizeContact);

      setSearchResults({ contacts, deals: response.deals });
    } catch (err) {
      setError("Ocurrió un error durante la búsqueda");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setActiveTab("all");
      setError(null);
    }
  }, [isOpen]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setError(null);
    setSearchResults({ contacts: [], deals: [] });
  };

  const handleNavigate = (type: "contacts" | "deals", id: string) => {
    navigate(`/${type}/${id}`);
    onClose();
  };

  const renderContact = (contact: Contact) => (
    <button
      key={contact._id}
      className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between group"
      onClick={() => handleNavigate("contacts", contact._id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {contact.firstName} {contact.lastName}
          </h3>
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {contact.companyName}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {contact.phone}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {contact.city}
            </div>
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  const renderDeal = (deal: any) => (
    <button
      key={deal._id}
      className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between group"
      onClick={() => handleNavigate("deals", deal._id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{deal.title}</h3>
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> ${deal.amount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{" "}
              {format(new Date(deal.closingDate), "MMM d, yyyy")}
            </div>
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-2xl rounded-lg shadow-xl mx-4 overflow-hidden"
      >
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts, deals, and more..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>

        <div className="flex border-b">
          {["all", "contacts", "deals"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === tab
                  ? "text-action border-b-2 border-action"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab as typeof activeTab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {tab === "contacts"
                ? searchResults.contacts.length
                : tab === "deals"
                ? searchResults.deals.length
                : searchResults.contacts.length + searchResults.deals.length}
              )
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          ) : searchTerm === "" ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">Start typing to search...</p>
            </div>
          ) : searchResults.contacts.length === 0 &&
            searchResults.deals.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">
                No results found for "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {(activeTab === "all" || activeTab === "contacts") &&
                searchResults.contacts.map(renderContact)}
              {(activeTab === "all" || activeTab === "deals") &&
                searchResults.deals.map(renderDeal)}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <kbd className="px-2 py-1 bg-white rounded text-xs border">⌘</kbd>
            <kbd className="px-2 py-1 bg-white rounded text-xs border">K</kbd>
            <span>to search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
