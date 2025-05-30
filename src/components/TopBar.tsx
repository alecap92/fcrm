import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Building2,
  MessageCircle,
  Calendar,
  Settings,
  Package,
  Truck,
  LogOut,
  ChevronDown,
  Mail,
  FileText,
  BarChart,
  MessageSquare,
  ListTodo,
  Instagram,
  Briefcase,
  List,
  Menu,
  X,
  DollarSign,
  Zap,
  File,
  Brain,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { SearchModal } from "./search/SearchModal";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  items?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Contactos",
    icon: <Users className="w-4 h-4" />,
    items: [
      {
        label: "Directorio de Contactos",
        href: "/contacts",
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "Grupos y Listas",
        href: "/contacts/lists",
        icon: <List className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Negocios",
    icon: <Building2 className="w-4 h-4" />,
    items: [
      {
        label: "Informes",
        href: "/reports",
        icon: <BarChart className="w-4 h-4" />,
      },
      {
        label: "Cotizaciones",
        href: "/quotes",
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        label: "Facturas",
        href: "/invoices",
        icon: <FileText className="w-4 h-4" />,
      },

      {
        label: "Oportunidades",
        href: "/deals",
        icon: <Briefcase className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Comunicación",
    icon: <MessageCircle className="w-4 h-4" />,
    items: [
      {
        label: "WhatsApp",
        href: "/conversations",
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        label: "Fragmentos",
        href: "/snippets",
        icon: <FileText className="w-4 h-4" />,
      },
      { label: "Correo", href: "/email", icon: <Mail className="w-4 h-4" /> },
      {
        label: "Documentos",
        href: "/documents",
        icon: <File className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Planeación",
    icon: <Calendar className="w-4 h-4" />,
    items: [
      {
        label: "Proyectos y tareas",
        href: "/projects",
        icon: <ListTodo className="w-4 h-4" />,
      },
      {
        label: "Redes Sociales",
        href: "/social-media",
        icon: <Instagram className="w-4 h-4" />,
      },
      {
        label: "Estrategia",
        href: "/strategy",
        icon: <Brain className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Automatizaciones",
    icon: <Zap className="w-4 h-4" />,
    href: "/automations",
  },
];

const userMenuItems: MenuItem[] = [
  {
    label: "Configuración",
    href: "/settings",
    icon: <Settings className="w-4 h-4" />,
  },
  {
    label: "Productos",
    href: "/products",
    icon: <Package className="w-4 h-4" />,
  },
  {
    label: "Proveedores",
    href: "/suppliers",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    label: "Cerrar Sesión",
    href: "/logout",
    icon: <LogOut className="w-4 h-4" />,
  },
];

function MobileMenu({
  isOpen,
  onClose,
  items,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleExpanded = (label: string) => {
    setExpandedItems((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <div key={item.label} className="space-y-2">
              {item.items ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className="flex items-center justify-between w-full p-2 text-left rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedItems.includes(item.label)
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className="pl-4 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href || "#"}
                          className="flex items-center gap-3 p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                          onClick={onClose}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href || "#"}
                  className="flex items-center gap-3 p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { organization } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    setActiveMenu(null);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="bg-primary text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <Building2 className="w-8 h-8 transition-transform group-hover:scale-110" />
                <span className="ml-2 text-xl font-bold">CRM Pro</span>
              </Link>
            </div>

            {/* Main Navigation - Desktop */}
            <nav className="hidden lg:flex flex-1 items-center justify-center space-x-1">
              {menuItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  {item.items ? (
                    <button
                      className={`
                        flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium
                        transition-colors duration-150
                        ${
                          activeMenu === item.label
                            ? "bg-action text-white"
                            : "text-white hover:bg-primary-hover"
                        }
                      `}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      <ChevronDown
                        className={`
                        w-4 h-4 ml-1 transition-transform duration-200
                        ${
                          activeMenu === item.label
                            ? "transform rotate-180"
                            : ""
                        }
                      `}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.href || "#"}
                      className={`
                        flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium
                        transition-colors duration-150
                        text-white hover:bg-primary-hover
                      `}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Link>
                  )}

                  {/* Virtual gap to prevent accidental closing */}
                  {item.items && (
                    <div className="absolute -bottom-2 left-0 right-0 h-2" />
                  )}

                  {activeMenu === item.label && item.items && (
                    <div
                      className="
                        absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50
                        transform transition-all duration-200 ease-out opacity-0 group-hover:opacity-100
                      "
                      style={{
                        top: "calc(100% + 4px)",
                      }}
                    >
                      {/* Add a virtual gap at the top of the dropdown */}
                      <div className="absolute -top-2 left-0 right-0 h-2" />

                      <div className="py-1 relative">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.label}
                            to={subItem.href || "#"}
                            className="
                              flex items-center px-4 py-2 text-sm text-gray-700
                              hover:bg-action/10 hover:text-action
                              transition-colors duration-150
                            "
                          >
                            {subItem.icon}
                            <span className="ml-2">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-md hover:bg-primary-hover transition-colors duration-150"
                title="Buscar (⌘K)"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 group"
                >
                  <img
                    src={
                      organization?.logoUrl ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    }
                    alt={organization?.companyName || "Organization"}
                    className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-action transition-all duration-200"
                  />
                  <ChevronDown
                    className={`
                    w-4 h-4 transition-transform duration-200
                    ${isUserMenuOpen ? "transform rotate-180" : ""}
                  `}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {organization?.companyName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {organization?.email}
                        </p>
                      </div>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href || "#"}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-action/10 hover:text-action"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (item.label === "Cerrar Sesión") {
                              handleLogout();
                            }
                          }}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-primary-hover transition-colors duration-150"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={menuItems}
      />
    </>
  );
}

export { TopBar };
