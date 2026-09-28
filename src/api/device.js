import axios from "axios";

class DeviceService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  async getDevices() {
    try {
      const response = await axios.get(`${this.baseUrl}device`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      throw error;
    }
  }

  async createDevice(data) {
    try {
      const formData = new URLSearchParams();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      const response = await axios.post(`${this.baseUrl}device`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating device:", error);
      throw error;
    }
  }

  async updateDevice(id, data) {
    try {
      const formData = new URLSearchParams();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      const response = await axios.patch(
        `${this.baseUrl}device/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating device:", error);
      throw error;
    }
  }

  async deleteDevice(id) {
    try {
      const response = await axios.delete(`${this.baseUrl}device/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting device:", error);
      throw error;
    }
  }

  async sendCommand(commandData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}monitor/command`,
        commandData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending command:", error);
      throw error;
    }
  }
}

export default new DeviceService();
