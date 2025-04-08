import { useState } from 'react';
import { 
  Search,
  Plus,
  Star,
  Inbox,
  Send,
  Archive,
  Trash2,
  Tag,
  Mail,
  MoreVertical,
  Reply,
  Forward,
  Download,
  Paperclip,
  ChevronDown,
  X,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ComposeEmail } from '../components/email/ComposeEmail';
import { EmailList } from '../components/email/EmailList';
import { EmailView } from '../components/email/EmailView';
import { EmailSidebar } from '../components/email/EmailSidebar';
import type { Email, EmailFolder, EmailLabel } from '../types/email';

const folders: EmailFolder[] = [
  { id: 'inbox', name: 'Bandeja de entrada', icon: Inbox, count: 12 },
  { id: 'sent', name: 'Enviados', icon: Send },
  { id: 'starred', name: 'Destacados', icon: Star },
  { id: 'archive', name: 'Archivo', icon: Archive },
  { id: 'trash', name: 'Papelera', icon: Trash2 },
];

const labels: EmailLabel[] = [
  { id: 'important', name: 'Importante', color: '#EF4444' },
  { id: 'work', name: 'Trabajo', color: '#3B82F6' },
  { id: 'personal', name: 'Personal', color: '#10B981' },
  { id: 'todo', name: 'Por hacer', color: '#F59E0B' },
];

const dummyEmails: Email[] = [
  {
    id: '1',
    from: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    to: [
      { name: 'Me', email: 'me@example.com' }
    ],
    subject: 'Project Update - Q1 2024',
    preview: 'Here are the latest updates on our ongoing projects...',
    body: `
      <p>Hi there,</p>
      <p>I wanted to share some updates on our ongoing projects for Q1 2024:</p>
      <ul>
        <li>Website redesign is 80% complete</li>
        <li>Mobile app development is on track</li>
        <li>New features will be ready for testing next week</li>
      </ul>
      <p>Let me know if you have any questions.</p>
      <p>Best regards,<br>John</p>
    `,
    date: '2024-03-20T10:30:00Z',
    isRead: false,
    isStarred: true,
    hasAttachments: true,
    attachments: [
      { name: 'Q1-Report.pdf', size: 2.5, type: 'pdf' },
      { name: 'Project-Timeline.xlsx', size: 1.8, type: 'excel' }
    ],
    labels: ['work', 'important'],
    folder: 'inbox'
  },
  {
    id: '2',
    from: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    to: [
      { name: 'Me', email: 'me@example.com' }
    ],
    subject: 'Team Meeting Notes',
    preview: 'Here are the notes from today\'s team meeting...',
    body: `
      <p>Hello everyone,</p>
      <p>Here are the key points from today's team meeting:</p>
      <ul>
        <li>New project kickoff next Monday</li>
        <li>Team training sessions scheduled for next month</li>
        <li>Updated workflow process review</li>
      </ul>
      <p>Please review and let me know if I missed anything.</p>
      <p>Thanks,<br>Sarah</p>
    `,
    date: '2024-03-19T15:45:00Z',
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    labels: ['work'],
    folder: 'inbox'
  },
];

export function Email() {
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedEmail(null);
  };

  const handleComposeEmail = () => {
    setIsComposing(true);
    setSelectedEmail(null);
  };

  const handleSelectAllEmails = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmails(dummyEmails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectEmailCheckbox = (emailId: string) => {
    setSelectedEmails(current =>
      current.includes(emailId)
        ? current.filter(id => id !== emailId)
        : [...current, emailId]
    );
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <EmailSidebar
        folders={folders}
        labels={labels}
        selectedFolder={selectedFolder}
        onSelectFolder={handleSelectFolder}
        onCompose={handleComposeEmail}
      />

      {/* Email List */}
      <div className={`w-full lg:w-[400px] bg-white border-r ${selectedEmail ? 'hidden lg:block' : 'block'}`}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar correos..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <EmailList
          emails={dummyEmails}
          selectedEmail={selectedEmail}
          onSelectEmail={handleSelectEmail}
          selectedEmails={selectedEmails}
          onSelectEmailCheckbox={handleSelectEmailCheckbox}
          onSelectAll={handleSelectAllEmails}
        />
      </div>

      {/* Email View */}
      {selectedEmail ? (
        <EmailView
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      ) : !isComposing ? (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900">
              Selecciona un correo para ver
            </h2>
            <p className="mt-1 text-gray-500">
              Elige un correo de la lista para ver su contenido
            </p>
          </div>
        </div>
      ) : null}

      {/* Compose Email Modal */}
      {isComposing && (
        <ComposeEmail onClose={() => setIsComposing(false)} />
      )}
    </div>
  );
}