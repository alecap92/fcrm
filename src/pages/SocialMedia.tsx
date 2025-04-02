import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Grid,
  Instagram,
  Facebook,
  Search,
  Filter,
  MoreVertical,
  Image as ImageIcon,
  Clock,
  X,
  Check,
  AlertCircle,
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Send,
  User,
  Globe,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/social/Calendar";
import { format } from "date-fns";
// import type { Post, SocialAccount } from "../types/social";
import { useAuth } from "../contexts/AuthContext";
import socialMediaService from "../services/SocialMediaService";
import { useToast } from "../components/ui/toast";
import { Post } from "../types/social";

interface SocialAccount {
  id: string;
  type: "instagram" | "facebook";
  name: string;
  username: string;
  avatar: string;
  isConnected: boolean;
}

interface PostFormData {
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  instagramAccount: string;
  facebookAccount: string;
  mediaUrls: string[];
}

const dummyAccounts: SocialAccount[] = [
  {
    id: "1",
    type: "facebook",
    name: "Business Page",
    username: "Business Page",
    avatar:
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    isConnected: false,
  },
];

const dummyPosts: Post[] = [
  {
    _id: "1",
    content:
      "🌟 Exciting news! Check out our latest collection. #fashion #style",
    facebookAccountId: "123456789",
    instagramAccountId: "987654321",
    mediaUrls: [
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=500&h=500&fit=crop",
    ],
    scheduledDate: "2023-10-15",
    scheduledTime: "14:00",
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-10-01T12:00:00Z",
    organizationId: "org123",
    platforms: ["instagram", "facebook"],
    scheduledFor: "2023-10-15T14:00:00Z",
    socialAccountId: "1",
    status: "scheduled",
  },
];

export function SocialMedia() {
  const [view, setView] = useState<"calendar" | "grid">("calendar");
  const [accounts, setAccounts] = useState<SocialAccount[]>(dummyAccounts);
  const [posts, setPosts] = useState<Post[]>(dummyPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userInfo, setUserInfo] = useState([]);
  const [instagramAccounts, setInstagramAccounts] = useState([]);
  const [form, setForm] = useState<PostFormData>({
    content: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    scheduledTime: format(new Date(), "HH:mm"),
    instagramAccount: "",
    facebookAccount: "",
    mediaUrls: [],
  });
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{
    content?: string;
    platforms?: string;
    media?: string;
    date?: string;
  }>({});
  const [previewPlatform, setPreviewPlatform] = useState<
    "instagram" | "facebook"
  >("instagram");
  const toast = useToast();

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { organization } = useAuth();

  const handleConnect = () => {
    const apiUrl = `https://1djx7r34-3001.use2.devtunnels.ms/api/v1/social/accounts/callback`; // url donde facebook responde
    const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=1604566880934254&redirect_uri=${apiUrl}&scope=email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish&state=${organization._id}`;

    window.open(url, "_blank");
  };

  const handleSelectPost = (post: Post) => {
    // Open edit modal
    console.log("Selected post:", post);
  };

  const handleSelectSlot = (start: Date) => {
    setSelectedDate(start);
    setShowCreateModal(true);

    // Pre-fill the form with the selected date and time
    setForm({
      ...form,
      scheduledDate: format(start, "yyyy-MM-dd"),
      scheduledTime: format(start, "HH:mm"),
    });

    // Clear any previous errors
    setErrors({});
  };

  const handleMovePost = (post: Post, newDate: Date) => {
    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p._id === post._id ? { ...p, scheduledFor: newDate.toISOString() } : p
      )
    );
  };

  const fetchSocialAccounts = async () => {
    try {
      const response = await socialMediaService.getSocialMedia();

      if (response) {
        setAccounts(response);
      }

      // Solicitar /me para saber si el token esta bueno
      const meResponse = await socialMediaService.getMe();
      setUserInfo(meResponse.userInfo);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
    }
  };

  const fetchSocialMediaAccounts = async () => {
    // traer los usuarios (ids) de las cuentas sociales para saber donde publicar
    const response = await socialMediaService.getInstagramAccounts();

    setInstagramAccounts(response.data);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    // Clear error for this field if it exists
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Function to trigger file input click
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({
          ...errors,
          media: "File size exceeds 10MB limit",
        });
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/quicktime",
      ];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          media:
            "Invalid file type. Please upload an image (JPG, PNG, GIF) or video (MP4, MOV)",
        });
        return;
      }

      // Clear any previous media error
      if (errors.media) {
        setErrors({
          ...errors,
          media: undefined,
        });
      }

      setMediaFile(file);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  // Handle drag and drop functionality
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({
          ...errors,
          media: "File size exceeds 10MB limit",
        });
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/quicktime",
      ];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          media:
            "Invalid file type. Please upload an image (JPG, PNG, GIF) or video (MP4, MOV)",
        });
        return;
      }

      // Clear any previous media error
      if (errors.media) {
        setErrors({
          ...errors,
          media: undefined,
        });
      }

      setMediaFile(file);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate content
    if (!form.content.trim()) {
      newErrors.content = "Post content is required";
    } else if (form.content.length > 2200) {
      newErrors.content = "Content exceeds maximum length of 2200 characters";
    }

    // Validate platforms
    if (!form.instagramAccount && !form.facebookAccount) {
      newErrors.platforms = "Please select at least one platform";
    }

    // Validate date
    const scheduledDateTime = new Date(
      `${form.scheduledDate}T${form.scheduledTime}`
    );
    if (scheduledDateTime < new Date()) {
      newErrors.date = "Scheduled time must be in the future";
    }

    // Instagram requires media
    if (form.instagramAccount && !mediaFile) {
      newErrors.media = "Instagram posts require an image or video";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true);

      const scheduledDateTime = new Date(
        `${form.scheduledDate}T${form.scheduledTime}`
      );

      const formData: any = new FormData();
      formData.append("content", form.content);
      formData.append("scheduledFor", scheduledDateTime.toISOString());
      formData.append("instagramAccountId", form.instagramAccount);
      formData.append("facebookAccountId", form.facebookAccount);
      formData.append(
        "platforms",
        JSON.stringify([
          ...(form.instagramAccount ? ["instagram"] : []),
          ...(form.facebookAccount ? ["facebook"] : []),
        ])
      );
      formData.append("mediaFile", mediaFile);

      await socialMediaService.post(formData);

      // Clear form fields
      setForm({
        content: "",
        scheduledDate: format(new Date(), "yyyy-MM-dd"),
        scheduledTime: format(new Date(), "HH:mm"),
        instagramAccount: "",
        facebookAccount: "",
        mediaUrls: [],
      });

      // Show success message

      toast.show({
        title: "Exito",
        description: "Post creado con éxito",
        type: "success",
      });

      // Close modal
      setShowCreateModal(false);
    } catch (error) {
      console.error("Upload error", error);
      toast.show({
        title: "Exito",
        description: "No se pudieron cargar las integraciones",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await socialMediaService.getPosts(1, 100);

      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Function to render Instagram-style preview
  const renderInstagramPreview = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md mx-auto">
        {/* Header */}
        <div className="p-3 flex items-center border-b">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold">Your Business</p>
            <p className="text-xs text-gray-500">New York, NY</p>
          </div>
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </div>

        {/* Media */}
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {mediaPreview ? (
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No media selected</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3">
          <div className="flex justify-between mb-2">
            <div className="flex gap-4">
              <Heart className="w-6 h-6" />
              <MessageCircle className="w-6 h-6" />
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="w-6 h-6 border-2 border-black"></div>
            </div>
          </div>

          {/* Likes */}
          <p className="text-sm font-semibold mb-1">123 likes</p>

          {/* Caption */}
          <div className="text-sm mb-1">
            <span className="font-semibold mr-1">Your Business</span>
            <span>{form.content || "Your caption will appear here"}</span>
          </div>

          {/* Comments */}
          <p className="text-xs text-gray-500 mb-1">View all 24 comments</p>
          <p className="text-xs text-gray-400">2 HOURS AGO</p>
        </div>
      </div>
    );
  };

  // Function to render Facebook-style preview
  const renderFacebookPreview = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md mx-auto">
        {/* Header */}
        <div className="p-3 flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold">Your Business</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{format(new Date(), "MMM d 'at' h:mm a")}</span>
              <span className="mx-1">•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </div>

        {/* Content */}
        <div className="px-3 pb-3">
          <p className="text-sm mb-3">
            {form.content || "Your post content will appear here"}
          </p>
        </div>

        {/* Media */}
        {mediaPreview ? (
          <div className="border-t border-b border-gray-200">
            <img src={mediaPreview} alt="Preview" className="w-full h-auto" />
          </div>
        ) : (
          <div className="border-t border-b border-gray-200 bg-gray-100 p-12 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No media selected</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-3">
          {/* Likes and comments count */}
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-1">
                <ThumbsUp className="w-2 h-2 text-white" />
              </div>
              <span>42</span>
            </div>
            <div>
              <span>12 comments • 5 shares</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex border-t border-gray-200 pt-2">
            <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-100 rounded-md">
              <ThumbsUp className="w-5 h-5 mr-2" />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-100 rounded-md">
              <MessageCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-100 rounded-md">
              <Share2 className="w-5 h-5 mr-2" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchSocialAccounts();
    fetchSocialMediaAccounts();
    fetchPosts();
  }, []);

  if (!accounts || !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Social Media Accounts
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              To start planning and scheduling your content, connect your social
              media accounts first.
            </p>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Conecta tu facebook
                    </h3>
                    <p className="text-sm text-gray-500">
                      Debes iniciar sesion y otorgar los accesos para conectar
                      tu cuenta de facebook e instagram. Asi podremos publicar
                      contenido desde acá.
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleConnect()}>Conectar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Social Media
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Plan and schedule your social media content
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-lg p-1 flex items-center">
                <button
                  className={`p-1.5 rounded ${
                    view === "calendar"
                      ? "bg-white shadow"
                      : "hover:bg-white/50"
                  }`}
                  onClick={() => setView("calendar")}
                  title="Vista Calendario"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
                <button
                  className={`p-1.5 rounded ${
                    view === "grid" ? "bg-white shadow" : "hover:bg-white/50"
                  }`}
                  onClick={() => setView("grid")}
                  title="Vista Cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Publicación
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="rounded-lg border-gray-300">
                  <option>Todas las plataformas</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todos los estados</option>
                  <option>Borrador</option>
                  <option>Programado</option>
                  <option>Publicado</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todas las fechas</option>
                  <option>Hoy</option>
                  <option>Esta semana</option>
                  <option>Este mes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Nueva Publicación
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contenido <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="content"
                      value={form.content}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full rounded-lg ${
                        errors.content
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-action focus:border-action"
                      }`}
                      placeholder="Escribe tu publicación..."
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.content}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {form.content.length}/2200 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programación <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="scheduledDate"
                          value={form.scheduledDate}
                          onChange={handleInputChange}
                          className={`w-full pl-10 rounded-lg ${
                            errors.date
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-action focus:border-action"
                          }`}
                          min={format(new Date(), "yyyy-MM-dd")}
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          name="scheduledTime"
                          value={form.scheduledTime}
                          onChange={handleInputChange}
                          className={`w-full pl-10 rounded-lg ${
                            errors.date
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-action focus:border-action"
                          }`}
                        />
                      </div>
                    </div>
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 border-b mb-4">
                      Plataformas <span className="text-red-500">*</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Instagram className="w-4 h-4 inline-block mr-2" />
                        <span className="text-sm">Instagram</span>
                      </label>
                      <select
                        name="instagramAccount"
                        value={form.instagramAccount}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg ${
                          errors.platforms
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-action focus:border-action"
                        } mb-2`}
                      >
                        <option value="">- seleccionar cuenta -</option>
                        {instagramAccounts.map((account: any) =>
                          account.instagram_business_account?.id ? (
                            <option
                              key={account.instagram_business_account.id}
                              value={account.instagram_business_account.id}
                            >
                              {account.name}
                            </option>
                          ) : null
                        )}
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Facebook className="w-4 h-4 inline-block mr-2" />
                        <span className="text-sm">Facebook</span>
                      </label>
                      <select
                        name="facebookAccount"
                        value={form.facebookAccount}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg ${
                          errors.platforms
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-action focus:border-action"
                        } mb-2`}
                      >
                        <option value="">- seleccionar cuenta -</option>
                        {instagramAccounts.map((account: any) =>
                          account.id ? (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ) : null
                        )}
                      </select>
                    </div>
                    {errors.platforms && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.platforms}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Multimedia{" "}
                      {form.instagramAccount && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 ${
                        errors.media ? "border-red-300" : ""
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {mediaPreview ? (
                        <div className="relative">
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full h-auto rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setMediaPreview(null);
                              setMediaFile(null);
                              // Clear media error if it exists
                              if (errors.media) {
                                setErrors({
                                  ...errors,
                                  media: undefined,
                                });
                              }
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-gray-100">
                              <ImageIcon className="w-6 h-6 text-gray-600" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Arrastra y suelta imágenes o videos aquí
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            PNG, JPG, GIF hasta 10MB
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFileButtonClick}
                          >
                            Seleccionar archivos
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                            onChange={handleMediaUpload}
                          />
                        </div>
                      )}
                    </div>
                    {errors.media && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.media}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Vista previa
                      </label>
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          className={`px-3 py-1 text-xs rounded-md ${
                            previewPlatform === "instagram"
                              ? "bg-white shadow-sm"
                              : "text-gray-600"
                          }`}
                          onClick={() => setPreviewPlatform("instagram")}
                        >
                          Instagram
                        </button>
                        <button
                          className={`px-3 py-1 text-xs rounded-md ${
                            previewPlatform === "facebook"
                              ? "bg-white shadow-sm"
                              : "text-gray-600"
                          }`}
                          onClick={() => setPreviewPlatform("facebook")}
                        >
                          Facebook
                        </button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      {previewPlatform === "instagram"
                        ? renderInstagramPreview()
                        : renderFacebookPreview()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isUploading ||
                  !form.content ||
                  (!form.instagramAccount && !form.facebookAccount) ||
                  (form.instagramAccount && !mediaFile)
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Programar publicación
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {view === "calendar" ? (
          <Calendar
            posts={posts}
            onSelectPost={handleSelectPost}
            onSelectSlot={handleSelectSlot}
            onMovePost={handleMovePost}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  {post.mediaUrls[0] && (
                    <img
                      src={post.mediaUrls[0]}
                      alt=""
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  )}

                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/90 hover:bg-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {post.platforms.includes("instagram") && (
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Instagram className="w-4 h-4" />
                      </div>
                    )}
                    {post.platforms.includes("facebook") && (
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Facebook className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      #1
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(post.scheduledFor), "MMM d, h:mm a")}
                    </div>
                    <span
                      className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : post.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : post.status === "draft"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }
                    `}
                    >
                      {post.status.charAt(0).toUpperCase() +
                        post.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
