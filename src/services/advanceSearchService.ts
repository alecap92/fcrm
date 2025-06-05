import { apiService } from "../config/apiConfig";

const AdvanceSearch = async (searchParams: string): Promise<any> => {
  try {
    const response = await apiService.post(
      "/advancedSearch?search=573233625527",
      { searchParams }
    );

    return response;
  } catch (error) {
    console.error("Error in AdvanceSearch:", error);
    throw new Error("Failed to perform advanced search");
  }
};

const advanceSearchService = {
  AdvanceSearch,
};

export default advanceSearchService;
