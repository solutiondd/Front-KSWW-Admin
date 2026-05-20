import axios from "axios";

export class TeacherService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
    this.imgBaseUrl = import.meta.env.VITE_APP_IMG_URL;
    this.token = localStorage.getItem("token");
  }

  async getTeachers(searchQuery = "", department = "", position = "") {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}users/teacher`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };

      const response = await axios.request(config);

      if (response.data && response.data.data) {
        let filtered = response.data.data;

        if (searchQuery) {
          filtered = filtered.filter(
            (teacher) =>
              teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              teacher.userid?.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        if (department) {
          filtered = filtered.filter(
            (teacher) => teacher.department === department,
          );
        }

        if (position) {
          filtered = filtered.filter(
            (teacher) => teacher.position === position,
          );
        }

        return { ...response.data, data: filtered };
      }

      return response.data;
    } catch (error) {
      console.error("Get teachers error:", error);
      throw error;
    }
  }

  async updateTeacher(id, formData) {
    try {
      const form = new FormData();
      form.append("userid", formData.userid);
      form.append("pre_name", formData.pre_name);
      form.append("first_name", formData.first_name);
      form.append("last_name", formData.last_name);
      form.append("position", formData.position);
      form.append("department", formData.department);
      form.append("status", formData.status);
      if (formData.rfid) form.append("rfid", formData.rfid);

      if (formData.picture) {
        form.append("picture", formData.picture);
      }

      let config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}users/teacher/${id}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        data: form,
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Update teacher error:", error);
      throw error;
    }
  }

  async createTeacher(formData) {
    try {
      const form = new FormData();
      form.append("userid", formData.userid);
      form.append("pre_name", formData.pre_name);
      form.append("first_name", formData.first_name);
      form.append("last_name", formData.last_name);
      form.append("position", formData.position);
      form.append("department", formData.department);
      form.append("status", formData.status);
      if (formData.rfid) form.append("rfid", formData.rfid);

      if (formData.picture) {
        form.append("picture", formData.picture);
      }

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}users/teacher`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        data: form,
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Create teacher error:", error);
      throw error;
    }
  }

  async deleteTeacher(teacherId) {
    try {
      this.token = localStorage.getItem("token");
      const config = {
        method: "delete",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}users/teacher/${teacherId}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Delete teacher error:", error);
      throw error;
    }
  }
}
