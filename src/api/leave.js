import axios from "axios";

export class LeaveService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  // Leave Type
  async getLeaveTypes() {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-type`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Get leave types error:", error);
      throw error;
    }
  }

  async createLeaveType(data) {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-type`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          requires_attachment: data.requires_attachment,
        }),
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Create leave type error:", error);
      throw error;
    }
  }

  async updateLeaveType(id, data) {
    try {
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-type/${id}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          requires_attachment: data.requires_attachment,
        }),
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Update leave type error:", error);
      throw error;
    }
  }

  async deleteLeaveType(id) {
    try {
      const config = {
        method: "delete",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-type/${id}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Delete leave type error:", error);
      throw error;
    }
  }

  // Leave Request
  async getLeaveRequests(params = {}) {
    try {
        const cleanParams = {};
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                cleanParams[key] = String(value).trim();
            }
        });

        const response = await axios.get(`${this.baseUrl}leave-request`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            params: cleanParams,
        });
        
        return response.data;
    } catch (error) {
        console.error("Get leave requests error:", error);
        throw error;
    }
}

  async createLeaveRequest(data) {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-request`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          leave_type_id: data.leave_type_id,
          user_id: data.user_id,
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason,
          attachment_url: data.attachment_url,
        }),
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Create leave request error:", error);
      throw error;
    }
  }

  async approveLeaveRequest(id, approval_note) {
    try {
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-request/${id}/approve`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ approval_note }),
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Approve leave request error:", error);
      throw error;
    }
  }

  async rejectLeaveRequest(id, approval_note) {
    try {
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-request/${id}/reject`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ approval_note }),
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Reject leave request error:", error);
      throw error;
    }
  }

  async cancelLeaveRequest(id) {
    try {
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-request/${id}/cancel`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Cancel leave request error:", error);
      throw error;
    }
  }

  async updateLeaveRequest(id, data) {
    try {
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}leave-request/${id}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          leave_type_id: data.leave_type_id,
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason,
          attachment_url: data.attachment_url,
        }),
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Update leave request error:", error);
      throw error;
    }
  }

  // Attendance
  async manualAttendance(data) {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${this.baseUrl}attendance/manual`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          user_id: data.user_id,
          date: data.date,
          time: data.time,
          remark: data.remark,
        }),
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Manual attendance error:", error);
      throw error;
    }
  }
}
