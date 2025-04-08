import { 
  ArrowLeft,
  Star,
  Reply,
  Forward,
  MoreVertical,
  Download,
  Paperclip,
  File
} from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import type { Email } from '../../types/email';

interface EmailViewProps {
  email: Email;
  onClose: () => void;
}

export function EmailView({ email, onClose }: EmailViewProps) {
  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {email.subject}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Star className={`w-4 h-4 ${email.isStarred ? 'text-yellow-400' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Reply className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Forward className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={email.from.avatar}
                alt={email.from.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {email.from.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {email.from.email}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(email.date), 'MMM d, yyyy h:mm a')}
            </div>
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: email.body }} />
          </div>

          {email.hasAttachments && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Archivos adjuntos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {email.attachments?.map((attachment) => (
                  <div
                    key={attachment.name}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <File className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.size} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}