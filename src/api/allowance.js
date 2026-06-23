import axios from "axios";

export class AllowanceService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  async getAllowance() {
    try {
      const response = await axios.get(`${this.baseUrl}attendance-allowance-setting`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching allowance:", error);
      throw error;
    }
  }

  async updateAllowance(data) {
    try {
      const response = await axios.put(
        `${this.baseUrl}attendance-allowance-setting`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating allowance:", error);
      throw error;
    }
  }
}
