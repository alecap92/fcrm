import { apiService } from "../config/apiConfig";
import { Fragment } from "../types/fragment";

interface FragmentResponse {
  fragments: Fragment[];
  totalPages: number;
  currentPage: number;
  totalFragments: number;
}

const getFragments = async (page: number = 1, limit: number = 5) => {
  try {
    const response = await apiService.get<FragmentResponse>(
      `/fragments?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching fragments:", error);
    throw error;
  }
};

const getFragmentById = async (id: string) => {
  try {
    const response = await apiService.get<Fragment>(`/fragments/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching fragment ${id}:`, error);
    throw error;
  }
};

const searchFragments = async (search: string) => {
  try {
    const response = await apiService.get<FragmentResponse>(
      `/fragments/search?term=${encodeURIComponent(search)}`
    );
    return response;
  } catch (error) {
    console.error("Error searching fragments:", error);
    throw error;
  }
};

const createFragment = async (fragment: any) => {
  try {
    const response = await apiService.post<any>("/fragments", fragment);
    return response;
  } catch (error) {
    console.error("Error creating fragment:", error);
    throw error;
  }
};

const updateFragment = async (id: string, fragment: any) => {
  try {
    const response = await apiService.put<Fragment>(
      `/fragments/${id}`,
      fragment
    );
    return response;
  } catch (error) {
    console.error(`Error updating fragment ${id}:`, error);
    throw error;
  }
};

const deleteFragment = async (id: string) => {
  try {
    await apiService.delete(`/fragments/${id}`);
  } catch (error) {
    console.error(`Error deleting fragment ${id}:`, error);
    throw error;
  }
};

const fragmentsService = {
  getFragments,
  getFragmentById,
  searchFragments,
  createFragment,
  updateFragment,
  deleteFragment,
};

export default fragmentsService;
