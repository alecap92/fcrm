import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { PostFormData, FormErrors } from "../types/social";

export const useSocialMediaForm = () => {
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewPlatform, setPreviewPlatform] = useState<
    "instagram" | "facebook"
  >("instagram");
  const [isUploading, setIsUploading] = useState(false);

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const newErrors: FormErrors = {};

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

  const resetForm = () => {
    setForm({
      content: "",
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      scheduledTime: format(new Date(), "HH:mm"),
      instagramAccount: "",
      facebookAccount: "",
      mediaUrls: [],
    });
    setMediaPreview(null);
    setMediaFile(null);
    setErrors({});
  };

  const updateFormWithDate = (date: Date) => {
    setForm({
      ...form,
      scheduledDate: format(date, "yyyy-MM-dd"),
      scheduledTime: format(date, "HH:mm"),
    });
  };

  return {
    form,
    setForm,
    mediaPreview,
    setMediaPreview,
    mediaFile,
    setMediaFile,
    errors,
    setErrors,
    previewPlatform,
    setPreviewPlatform,
    isUploading,
    setIsUploading,
    fileInputRef,
    handleInputChange,
    handleFileButtonClick,
    handleMediaUpload,
    handleDragOver,
    handleDrop,
    validateForm,
    resetForm,
    updateFormWithDate,
  };
};
