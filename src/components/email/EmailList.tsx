import { format } from 'date-fns';
import { Star, Paperclip } from 'lucide-react';
import type { Email } from '../../types/email';

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  selectedEmails: string[];
  onSelectEmailCheckbox: (emailId: string) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  selectedEmails,
  onSelectEmailCheckbox,
  onSelectAll,
}: EmailListProps) {
  return (
    <div className="divide-y divide-gray-200">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-action focus:ring-action"
            checked={selectedEmails.length === emails.length}
            onChange={onSelectAll}
          />
          <span className="text-sm text-gray-500">
            {selectedEmails.length > 0
              ? `${selectedEmails.length} seleccionados`
              : 'Seleccionar todos'}
          </span>
        </div>
      </div>

      {emails.map((email) => (
        <div
          key={email.id}
          className={`
            flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50
            ${selectedEmail?.id === email.id ? 'bg-action/5' : ''}
            ${!email.isRead ? 'bg-blue-50' : ''}
          `}
          onClick={() => onSelectEmail(email)}
        >
          <input
            type="checkbox"
            className="rounded border-gray-300 text-action focus:ring-action"
            checked={selectedEmails.includes(email.id)}
            onChange={(e) => {
              e.stopPropagation();
              onSelectEmailCheckbox(email.id);
            }}
          />
          <button
            className={`
              p-1 rounded-full hover:bg-gray-200
              ${email.isStarred ? 'text-yellow-400' : 'text-gray-400'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle star logic here
            }}
          >
            <Star className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={email.from.avatar}
                  alt={email.from.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className={`text-sm font-medium ${!email.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                  {email.from.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(email.date), 'MMM d, h:mm a')}
              </span>
            </div>
            <h3 className={`text-sm ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              {email.subject}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {email.preview}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {email.hasAttachments && (
                <Paperclip className="w-4 h-4 text-gray-400" />
              )}
              {email.labels?.map((labelId) => (
                <span
                  key={labelId}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-action/10 text-action"
                >
                  {labelId}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}