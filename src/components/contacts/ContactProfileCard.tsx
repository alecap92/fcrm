import { ChevronDown, Mail, MessageCircle, PhoneCall, Tag, X } from "lucide-react";
import { ReactNode } from "react";

type ContactProfileCardProps = {
  avatar?: ReactNode;
  fullName: string;
  position?: string;
  company?: string;
  onWhatsApp?: () => void;
  onEmail?: () => void;
  onCall?: () => void;
  onSchedule?: () => void;
  info: Array<{ icon: ReactNode; label: string; value?: ReactNode; href?: string }>;
  tags: string[];
  onRemoveTag: (tag: string) => void;
  newTag: string;
  onNewTagChange: (value: string) => void;
  onAddTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showDetails?: boolean;
  onToggleDetails?: () => void;
  extraDetails?: Array<{ label: string; value?: ReactNode }>;
};

export function ContactProfileCard({
  avatar,
  fullName,
  position,
  company,
  onWhatsApp,
  onEmail,
  onCall,
  onSchedule,
  info,
  tags,
  onRemoveTag,
  newTag,
  onNewTagChange,
  onAddTagKeyDown,
  showDetails,
  onToggleDetails,
  extraDetails,
}: ContactProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
          {avatar}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{fullName}</h3>
        {position ? <p className="text-gray-500">{position}</p> : null}
        {company ? <p className="text-gray-500">{company}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button onClick={onWhatsApp} className="bg-green-500 text-white rounded-lg px-3 py-2 hover:bg-green-600 transition-colors inline-flex items-center justify-center gap-2">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </button>
        <button onClick={onEmail} className="bg-blue-500 text-white rounded-lg px-3 py-2 hover:bg-blue-600 transition-colors inline-flex items-center justify-center gap-2">
          <Mail className="h-4 w-4" /> Email
        </button>
        <button onClick={onCall} className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2">
          <PhoneCall className="h-4 w-4" /> Call
        </button>
        <button onClick={onSchedule} className="bg-indigo-500 text-white rounded-lg px-3 py-2 hover:bg-indigo-600 transition-colors">
          Schedule
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {info.map((row, idx) => (
          <div className="flex items-start gap-3" key={idx}>
            <div className="text-gray-400 mt-1">{row.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{row.label}</p>
              {row.href ? (
                <a href={row.href} target="_blank" rel="noreferrer" className="text-gray-700 break-words hover:text-indigo-600">
                  {row.value}
                </a>
              ) : (
                <p className="text-gray-700 break-words">{row.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {typeof showDetails !== "undefined" && (
        <div className="mt-4">
          <button
            onClick={onToggleDetails}
            className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
          >
            {showDetails ? "Ver menos" : "Ver más"}
            <ChevronDown
              className={`h-4 w-4 ml-1 transform transition-transform ${showDetails ? "rotate-180" : ""}`}
            />
          </button>
          {showDetails && extraDetails && extraDetails.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-2">
              {extraDetails.map((d, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-gray-500">{d.label}</p>
                  <p className="mt-0.5 text-sm text-gray-700">{d.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <button onClick={() => onRemoveTag(tag)} className="ml-1 hover:text-indigo-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={newTag}
            onChange={(e) => onNewTagChange(e.target.value)}
            onKeyDown={onAddTagKeyDown}
            placeholder="Add tag..."
            className="bg-transparent border-none text-sm focus:outline-none w-24"
          />
        </div>
      </div>
    </div>
  );
}

export default ContactProfileCard;


