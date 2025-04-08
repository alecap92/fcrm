import axios from "axios";
import { apiService } from "../config/apiConfig";

const getSocialMedia = async () => {
  const response = await apiService.get<any>("/social/accounts");

  return response.data;
};

const getMe = async () => {
  const response = await apiService.get<any>("/social/accounts/me");

  return response.data;
};

const getInstagramAccounts = async () => {
  const response = await apiService.get<any>("/social/accounts/instagram");

  return response.data;
};

const post = async (data: any): Promise<any> => {
  const response = await axios.post<any>(
    import.meta.env.VITE_API_BASE_URL + "/social/posts",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }
  );

  return response;
};

const getPosts = async (page: number, limit: number) => {
  const response = await apiService.get<any>(
    `/social/posts?page=${page}&limit=${limit}`
  );

  return response;
};

const generatePost = async (prompt: any) => {
  const response = await apiService.post<any>("/social/posts/generate", prompt);

  return response;
};

const socialMediaService = {
  getSocialMedia,
  getMe,
  getInstagramAccounts,
  post,
  getPosts,
  generatePost,
};

export default socialMediaService;
