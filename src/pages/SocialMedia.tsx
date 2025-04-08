import { useState } from "react";
import { SocialHeader } from "../components/social/SocialHeader";
import { Calendar } from "../components/social/Calendar";
import { PostGrid } from "../components/social/PostGrid";
import { OnboardingView } from "../components/social/OnboardingView";
import { useSocialMediaForm } from "../hooks/useSocialMediaForm";
import { useSocialMediaAPI } from "../hooks/useSocialMediaAPI";
import { Post } from "../types/social";
import { CreatePostModal } from "../components/social/CreatePostModal";

export function SocialMedia() {
  const [view, setView] = useState<"calendar" | "grid">("calendar");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
