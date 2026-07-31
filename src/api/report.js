import axios from "axios";

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

const getAttendanceReport = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const queryParams = {
      start: params.start,
      end: params.end,
      role: params.role,
      name: params.name || "",
      department: params.department || "",
      userid: params.userid || "",
      page: params.page || 1,
      limit: params.limit || 20,
    };
    if (
      params.grade !== undefined &&
      params.grade !== null &&
      params.grade !== ""
    ) {
      queryParams.grade = params.grade;
    }
    if (
      params.classroom !== undefined &&
      params.classroom !== null &&
      params.classroom !== ""
    ) {
      queryParams.classroom = params.classroom;
    }

    const response = await axios.get(`${baseUrl}report/attendance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    throw error;
  }
};

const getLateReport = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const queryParams = {
      start: params.start,
      end: params.end,
      role: params.role,
      name: params.name ?? "",
      department: params.department ?? "",
      userid: params.userid ?? "",
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (
      params.grade !== undefined &&
      params.grade !== null &&
      params.grade !== ""
    ) {
      queryParams.grade = params.grade;
    }
    if (
      params.classroom !== undefined &&
      params.classroom !== null &&
      params.classroom !== ""
    ) {
      queryParams.classroom = params.classroom;
    }
    const response = await axios.get(`${baseUrl}report/late`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching late report:", error);
    throw error;
  }
};

const getMissedReport = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const queryParams = {
      start: params.start,
      end: params.end,
      role: params.role,
      name: params.name || "",
      department: params.department || "",
      userid: params.userid || "",
    };
    if (
      params.grade !== undefined &&
      params.grade !== null &&
      params.grade !== ""
    ) {
      queryParams.grade = params.grade;
    }
    if (
      params.classroom === 0 ||
      (params.classroom !== undefined &&
        params.classroom !== null &&
        params.classroom !== "")
    ) {
      queryParams.classroom = params.classroom;
    }
    const response = await axios.get(`${baseUrl}report/missed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching missed report:", error);
    throw error;
  }
};

const getStrangerReport = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}report/stranger`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        start: params.start,
        end: params.end,
        device_sn: params.device_sn || "",
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stranger report:", error);
    throw error;
  }
};

const getCommingPersonReport = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}report/commingperson`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date: params.date,
        role: params.role,
        name: params.name || "",
        department: params.department || "",
        userid: params.userid || "",
        page: params.page || 1,
        limit: params.limit || 5,
        grade: params.grade || "",
        classroom: params.classroom || 0,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching commingperson report:", error);
    throw error;
  }
};

const getRiskStudentReport = async (params = {}) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}report/riskstudent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching riskstudent report:", error);
    throw error;
  }
};

const getProgressReport = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}report/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date: params.date,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching progress report:", error);
    throw error;
  }
};

export default {
  getAttendanceReport,
  getLateReport,
  getMissedReport,
  getStrangerReport,
  getRiskStudentReport,
  getDailyStats: async (start, end) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}report/dailystats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start, end },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      throw error;
    }
  },
  getCommingPersonReport,
  getProgressReport,
};
