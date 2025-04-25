import {
  Building2,
  Users,
  List,
  Lock,
  Plug,
  Mail,
  FileText,
  DollarSign,
  Quote,
  User2,
} from "lucide-react";
import type { SettingsSection } from "../../types/settings";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const menuItems = [
  {
    id: "organization" as const,
    label: "Perfil de la Organización",
    icon: Building2,
  },
  {
    id: "users" as const,
    label: "Usuarios",
    icon: Users,
  },
  {
    id: "contact-fields" as const,
    label: "Campos de Contacto",
    icon: List,
  },
  {
    id: "security" as const,
    label: "Seguridad",
    icon: Lock,
  },
  {
    id: "integrations" as const,
    label: "Integraciones",
    icon: Plug,
  },
  {
    id: "email" as const,
    label: "Configuración de Email",
    icon: Mail,
  },
  {
    id: "invoice" as const,
    label: "Configuración de Facturación",
    icon: FileText,
  },
  {
    id: "quotation" as const,
    label: "Configuración de Cotizaciones",
    icon: Quote,
  },
  {
    id: "deals" as const,
    label: "Configuración de Negocios",
    icon: DollarSign,
  },
  {
    id: "lead-scoring" as const,
    label: "Lead Scoring",
    icon: User2,
  },
];

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg
              ${
                activeSection === item.id
                  ? "bg-action text-white"
                  : "text-gray-900 hover:bg-gray-100"
              }
            `}
            onClick={() => onSectionChange(item.id)}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
