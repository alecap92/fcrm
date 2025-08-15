import { apiService } from "../config/apiConfig";

export const userService = {
  async updateUser(data: any) {
    const response = await apiService.put("/users", data);
    return response;
  },

  async updatePassword(oldPassword: string, newPassword: string) {
    const response = await apiService.put("/users/update-password", {
      oldPassword,
      newPassword,
    });
    return response;
  },
};


