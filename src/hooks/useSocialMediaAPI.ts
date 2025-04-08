import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Post,
  SocialAccount,
  InstagramAccount,
  PostFormData,
} from "../types/social";
import socialMediaService from "../services/SocialMediaService";
import { useToast } from "../components/ui/toast";

export const useSocialMediaAPI = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userInfo, setUserInfo] = useState<any[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<
    InstagramAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const handleConnect = () => {
    const apiUrl = `https://1djx7r34-3001.use2.devtunnels.ms/api/v1/social/accounts/callback`; // url donde facebook responde
    const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=1604566880934254&redirect_uri=${apiUrl}&scope=email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish&state=${organization._id}`;

    window.open(url, "_blank");
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
    try {
      // traer los usuarios (ids) de las cuentas sociales para saber donde publicar
      const response = await socialMediaService.getInstagramAccounts();
      setInstagramAccounts(response.data);
    } catch (error) {
      console.error("Error fetching Instagram accounts:", error);
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

  const submitPost = async (
    form: PostFormData,
    mediaFile: File | null,
    setIsUploading: (value: boolean) => void,
    onSuccess: () => void
  ) => {
    try {
      setIsUploading(true);

      const scheduledDateTime = new Date(
        `${form.scheduledDate}T${form.scheduledTime}`
      );

      const formData: FormData = new FormData();
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

      if (mediaFile) {
        formData.append("mediaFile", mediaFile);
      }

      await socialMediaService.post(formData);

      // Show success message
      toast.show({
        title: "Exito",
        description: "Post creado con éxito",
        type: "success",
      });

      // Refresh posts data
      await fetchPosts();

      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Upload error", error);
      toast.show({
        title: "Error",
        description: "No se pudo crear la publicación",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMovePost = async (post: Post, newDate: Date) => {
    // Implement post rescheduling logic here
    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p._id === post._id ? { ...p, scheduledFor: newDate.toISOString() } : p
      )
    );

    // You would likely want to call an API here to update the post's scheduled time
    // await socialMediaService.updatePostSchedule(post._id, newDate.toISOString());
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchSocialAccounts(),
        fetchSocialMediaAccounts(),
        fetchPosts(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    accounts,
    posts,
    userInfo,
    instagramAccounts,
    isLoading,
    handleConnect,
    fetchSocialAccounts,
    fetchSocialMediaAccounts,
    fetchPosts,
    submitPost,
    handleMovePost,
    loadData,
  };
};
