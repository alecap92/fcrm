import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { SocialHeader } from "../components/social/SocialHeader";
import { Calendar } from "../components/social/Calendar";
import { PostGrid } from "../components/social/PostGrid";
import { OnboardingView } from "../components/social/OnboardingView";
import { useSocialMediaForm } from "../hooks/useSocialMediaForm";
import { useSocialMediaAPI } from "../hooks/useSocialMediaAPI";
import { Post } from "../types/social";
import { CreatePostModal } from "../components/social/CreatePostModal";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

export function SocialMedia() {
  const [view, setView] = useState<"calendar" | "grid">("calendar");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { organization } = useAuth();

  // Verificar si hay configuración básica de organización
  const hasBasicConfig = organization?.companyName && organization?.settings;

  // Si no hay configuración básica, mostrar mensaje de configuración
  if (!hasBasicConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configuración Requerida
            </h2>
            <p className="text-gray-600 mb-6">
              Para gestionar redes sociales necesitas configurar primero tu
              organización. Esto incluye información básica de la empresa y
              configuraciones generales.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Configura la organización para empezar a gestionar redes
                sociales
              </p>
              <Button onClick={() => navigate("/settings")} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Ir a Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Import hooks
  const {
    form,
    mediaPreview,
    mediaFile,
    errors,
    previewPlatform,
    isUploading,
    fileInputRef,
    handleInputChange,
    handleFileButtonClick,
    handleMediaUpload,
    handleDragOver,
    handleDrop,
    validateForm,
    resetForm,
    updateFormWithDate,
    setIsUploading,
    setMediaPreview,
    setMediaFile,
    setErrors,
    setPreviewPlatform,
  } = useSocialMediaForm();

  const {
    accounts,
    posts,
    userInfo,
    instagramAccounts,
    handleConnect,
    submitPost,
    handleMovePost,
  } = useSocialMediaAPI();

  const handleSelectPost = (post: Post) => {
    // Open edit modal
    console.log("Selected post:", post);
  };

  const handleSelectSlot = (start: Date) => {
    setSelectedDate(start);
    setShowCreateModal(true);
    updateFormWithDate(start);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await submitPost(form, mediaFile, setIsUploading, () => {
      resetForm();
      setShowCreateModal(false);
    });
  };

  // If accounts are not loaded or connected, show onboarding
  if (!accounts || !accounts.length || !userInfo) {
    return <OnboardingView handleConnect={handleConnect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SocialHeader
        view={view}
        setView={setView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setShowCreateModal={setShowCreateModal}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        form={form}
        handleInputChange={handleInputChange}
        errors={errors}
        instagramAccounts={instagramAccounts}
        mediaPreview={mediaPreview}
        mediaFile={mediaFile}
        isUploading={isUploading}
        handleSubmit={handleSubmit}
        handleFileButtonClick={handleFileButtonClick}
        handleMediaUpload={handleMediaUpload}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        previewPlatform={previewPlatform}
        setPreviewPlatform={setPreviewPlatform}
        fileInputRef={fileInputRef}
        setMediaPreview={setMediaPreview}
        setMediaFile={setMediaFile}
        setErrors={setErrors}
      />

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
          <PostGrid posts={posts} />
        )}
      </div>
    </div>
  );
}
