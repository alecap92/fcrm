import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  MessageCircle,
  Briefcase,
  Users,
  Target,
  Zap,
  FileText,
  Bot,
  TrendingUp,
  DollarSign,
  UserPlus,
  Calendar,
  Settings,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

type FeatureType =
  | "conversations"
  | "deals"
  | "leads"
  | "contacts"
  | "automations"
  | "content";

interface Feature {
  id: FeatureType;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface BottomContent {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

const features: Feature[] = [
  {
    id: "conversations",
    title: "Conversaciones",
    icon: <MessageCircle className="w-5 h-5" />,
    description:
      "Gestiona todas tus conversaciones con clientes en un solo lugar",
  },
  {
    id: "deals",
    title: "Negocios",
    icon: <Briefcase className="w-5 h-5" />,
    description: "Administra tu pipeline de ventas y cierra más negocios",
  },
  {
    id: "leads",
    title: "Generación de Leads",
    icon: <Target className="w-5 h-5" />,
    description: "Genera y califica leads de manera automática",
  },
  {
    id: "contacts",
    title: "Contactos",
    icon: <Users className="w-5 h-5" />,
    description: "Organiza y segmenta tu base de datos de contactos",
  },
  {
    id: "automations",
    title: "Automatizaciones",
    icon: <Zap className="w-5 h-5" />,
    description: "Automatiza procesos repetitivos y ahorra tiempo",
  },
  {
    id: "content",
    title: "Plan de Contenido",
    icon: <FileText className="w-5 h-5" />,
    description: "Planifica y programa tu contenido de marketing",
  },
];

const bottomContentMap: Record<FeatureType, BottomContent> = {
  conversations: {
    icon: <MessageCircle className="w-6 h-6 text-white" />,
    title: "Escribe a tus contactos por WhatsApp",
    description:
      "Crea conversaciones por WhatsApp y guarda todo el historial de tus contactos.",
    bgColor: "bg-green-500",
    borderColor: "border-green-400",
  },
  deals: {
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    title: "LFT y Ticket promedio",
    description:
      "Analiza el tiempo de vida del cliente y el valor promedio de tus transacciones.",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-400",
  },
  leads: {
    icon: <UserPlus className="w-6 h-6 text-white" />,
    title: "Captura leads automáticamente",
    description:
      "Genera leads de calidad desde múltiples canales y califica automáticamente.",
    bgColor: "bg-purple-500",
    borderColor: "border-purple-400",
  },
  contacts: {
    icon: <Users className="w-6 h-6 text-white" />,
    title: "Base de datos centralizada",
    description:
      "Mantén toda la información de tus contactos organizada y actualizada.",
    bgColor: "bg-indigo-500",
    borderColor: "border-indigo-400",
  },
  automations: {
    icon: <Settings className="w-6 h-6 text-white" />,
    title: "Flujos de trabajo inteligentes",
    description:
      "Crea automatizaciones que trabajen por ti las 24 horas del día.",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-400",
  },
  content: {
    icon: <Calendar className="w-6 h-6 text-white" />,
    title: "Planificación de contenido",
    description:
      "Programa y gestiona tu contenido en redes sociales desde un solo lugar.",
    bgColor: "bg-pink-500",
    borderColor: "border-pink-400",
  },
};

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] =
    useState<FeatureType>("conversations");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({
        email,
        password,
        rememberMe,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implementar autenticación con Google Firebase
    console.log("Google login");
  };

  const handleFacebookLogin = () => {
    // TODO: Implementar autenticación con Facebook Firebase
    console.log("Facebook login");
  };

  const currentBottomContent = bottomContentMap[selectedFeature];

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Formulario de login (30%) */}
      <div className="w-[30%] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 xl:px-16 bg-white">
        <div className="mx-auto w-full max-w-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Accede a tu cuenta de
            </h2>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">FusiónCRM</h1>
          </div>

          {/* Botones de autenticación social en la misma fila */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <button
              onClick={handleFacebookLogin}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                o ingresa con tu correo
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D1345B] focus:border-[#D1345B] sm:text-sm"
                  placeholder="Correo electrónico"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D1345B] focus:border-[#D1345B] sm:text-sm"
                  placeholder="Contraseña"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#D1345B] focus:ring-[#D1345B] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Recuérdame
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#D1345B] hover:text-[#B12A4D]"
                >
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#D1345B] hover:bg-[#B12A4D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D1345B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Entrar a FusiónCRM"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="font-medium text-[#D1345B] hover:text-[#B12A4D]"
            >
              Crear Cuenta
            </Link>
          </p>
        </div>
      </div>

      {/* Panel derecho - Información y funcionalidades (70%) */}
      <div className="hidden lg:block relative w-[70%] px-25 xl:px-16 bg-gradient-to-br from-[#1F2A48] via-[#2A3B5C] to-[#1F2A48]">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative h-full flex flex-col justify-center px-12 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ahora la relación con tus clientes es mas cercana y eficiente
            </h2>
          </div>

          {/* Selector de funcionalidades */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedFeature === feature.id
                      ? "bg-[#D1345B] text-white shadow-lg"
                      : "bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-30"
                  }`}
                >
                  {feature.icon}
                  {feature.title}
                </button>
              ))}
            </div>

            {/* Contenido de la funcionalidad seleccionada */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D1345B] rounded-full mb-4">
                  {features.find((f) => f.id === selectedFeature)?.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {features.find((f) => f.id === selectedFeature)?.title}
                </h3>
                <p className="text-white text-opacity-90 text-lg leading-relaxed">
                  {features.find((f) => f.id === selectedFeature)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido dinámico según funcionalidad seleccionada */}
          <div
            className={`${currentBottomContent.bgColor} bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border ${currentBottomContent.borderColor} border-opacity-30`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 ${currentBottomContent.bgColor} rounded-full flex items-center justify-center`}
                >
                  {currentBottomContent.icon}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  {currentBottomContent.title}
                </h4>
                <p className="text-white text-opacity-80 text-sm">
                  {currentBottomContent.description}
                </p>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="absolute bottom-8 right-8">
            <div className="flex items-center gap-2 text-white">
              <img
                src="https://res.cloudinary.com/db6izsiwj/image/upload/v1748697006/logo-white_yyhsi9.png"
                alt="FusiónCRM"
                style={{ height: "100px" }}
                onError={(e) => {
                  // Fallback si la imagen no se encuentra
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
