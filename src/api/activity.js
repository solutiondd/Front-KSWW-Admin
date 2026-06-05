import axios from "axios";

export class ActivityService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  async getActivities(startDate, endDate, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        const text = String(value).trim();
        if (!text) return;
        params.append(key, text);
      });

      const queryString = params.toString();

      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}student-activities${queryString ? `?${queryString}` : ""}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Get activities error:", error);
      throw error;
    }
  }

  async createActivity(data) {
    try {
      const payload = { ...data };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}student-activities`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: JSON.stringify(payload),
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Create activity error:", error);
      throw error;
    }
  }

  async updateActivity(id, data) {
    try {
      const payload = { ...data };

      let config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}student-activities/${id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: JSON.stringify(payload),
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Update activity error:", error);
      throw error;
    }
  }

  async deleteActivity(id) {
    try {
      let config = {
        method: "delete",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}student-activities/${id}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Delete activity error:", error);
      throw error;
    }
  }
}
