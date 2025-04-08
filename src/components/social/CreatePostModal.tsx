import React, { useEffect, useState } from "react";
import {
  X,
  CalendarIcon,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  ImageIcon,
  Instagram,
  Facebook,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { PostFormData, FormErrors, InstagramAccount } from "../../types/social";
import { PostPreview } from "./PostPreview";
import socialMediaService from "../../services/SocialMediaService";
import integrationService from "../../services/integrationService";

interface CreatePostModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  form: PostFormData;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  errors: FormErrors;
  instagramAccounts: InstagramAccount[];
  mediaPreview: string | null;
  mediaFile: File | null;
  isUploading: boolean;
  handleSubmit: () => Promise<void>;
  handleFileButtonClick: () => void;
  handleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  previewPlatform: "instagram" | "facebook";
  setPreviewPlatform: (platform: "instagram" | "facebook") => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setMediaPreview: (preview: string | null) => void;
  setMediaFile: (file: File | null) => void;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  showCreateModal,
  setShowCreateModal,
  form,
  handleInputChange,
  errors,
  instagramAccounts,
  mediaPreview,
  mediaFile,
  isUploading,
  handleSubmit,
  handleFileButtonClick,
  handleMediaUpload,
  handleDragOver,
  handleDrop,
  previewPlatform,
  setPreviewPlatform,
  fileInputRef,
}) => {
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [openAi, setOpenAi] = useState(false);
  const [selectedContentType, setSelectedContentType] =
    useState<string>("post");

  const getOpenAiStatus = async () => {
    try {
      const response = await integrationService.getIntegrations();

      const openAiIntegration = response.data.find(
        (integration: any) =>
          integration.service === "openai" && integration.isActive
      );

      if (openAiIntegration) {
        setOpenAi(true);
      } else {
        setOpenAi(false);
      }
    } catch (error) {
      console.error("Error fetching OpenAI status:", error);
    }
  };

  useEffect(() => {
    getOpenAiStatus();
  }, []);

  // Function to handle AI content generation
  const generateAIContent = async () => {
    if (!aiPrompt) return;

    setIsGenerating(true);

    try {
      // Simulate API call (replace with actual API call in production)
      console.log(aiPrompt);
      const response = await socialMediaService.generatePost({
        prompt: aiPrompt,
      });

      console.log(response);

      // Update the form content with the generated text
      const textArea = document.querySelector(
        'textarea[name="content"]'
      ) as HTMLTextAreaElement;
      if (textArea) {
        textArea.value = response.content;

        // Trigger an input event to update the form state
        const event = new Event("input", { bubbles: true });
        textArea.dispatchEvent(event);

        // Also update the form directly
        const changeEvent = {
          target: {
            name: "content",
            value: response.content,
          },
        } as React.ChangeEvent<HTMLTextAreaElement>;

        handleInputChange(changeEvent);
      }

      // Close the AI modal
      setShowAIModal(false);
      setAiPrompt("");
    } catch (error) {
      console.error("Error generating AI content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!showCreateModal) {
    return null;
  }

  return (
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
                </div>
                {errors.media && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.media}
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenido <span className="text-red-500">*</span>
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-xs"
                    onClick={() => setShowAIModal(true)}
                    disabled={!openAi}
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
                    {openAi ? "Generar con IA" : "IA no disponible"}
                  </Button>
                </div>
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
                    {instagramAccounts.map((account) =>
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
                    {instagramAccounts.map((account) =>
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
              <PostPreview
                form={form}
                mediaPreview={mediaPreview}
                previewPlatform={previewPlatform}
                setPreviewPlatform={setPreviewPlatform}
              />
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
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

      {/* AI Content Generator Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Asistente de Contenido IA
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Qué tipo de contenido quieres generar?
                </label>
                <select
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="post">Texto de la imagen</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe lo que quieres generar
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={
                    selectedContentType === "post"
                      ? "Ej: Anuncio sobre nuestro nuevo producto de cuidado de la piel"
                      : selectedContentType === "caption"
                      ? "Ej: Una taza de café en nuestro local"
                      : "Ej: moda verano tendencias"
                  }
                />
              </div>
              <div className="text-xs text-gray-500 mb-4">
                <p>
                  • Sé específico para mejores resultados
                  <br />
                  • El contenido generado es una sugerencia y puedes editarlo
                  <br />• La IA no tiene acceso a tus imágenes
                </p>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAIModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={generateAIContent}
                disabled={isGenerating || !aiPrompt.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
