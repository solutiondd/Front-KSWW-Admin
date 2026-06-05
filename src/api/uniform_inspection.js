import axios from "axios";

export class UniformInspectionService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  async getUniformInspections({
    date = "",
    grade = "",
    classroom = "",
    limit = 50,
    page = 1,
  } = {}) {
    try {
      const params = {
        limit,
        page,
        ...(date ? { date } : {}),
        ...(grade ? { grade } : {}),
        ...(classroom !== "" && classroom !== null && classroom !== undefined
          ? { classroom }
          : {}),
      };

      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}uniform-inspections`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Get uniform inspections error:", error);
      throw error;
    }
  }

  async getUniformInspectionById(id) {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}uniform-inspections/${id}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Get uniform inspection by id error:", error);
      throw error;
    }
  }

  async createUniformInspection(data) {
    try {
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}uniform-inspections`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: JSON.stringify(data),
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Create uniform inspection error:", error);
      throw error;
    }
  }

  async updateUniformInspection(id, data) {
    try {
      let config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}uniform-inspections/${id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: JSON.stringify(data),
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Update uniform inspection error:", error);
      throw error;
    }
  }
}
