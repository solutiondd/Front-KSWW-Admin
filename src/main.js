import { createApp } from "vue";
import "./assets/tailwind.css";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import App from "./App.vue";
import router from "./routes";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";
import axios from "axios";
import { UserService } from "./api/User.js";

const app = createApp(App);

app.use(createPinia());
app.use(router);

const CHUNK_RELOAD_KEY = "chunk-reload-attempted";
const isDynamicImportChunkError = (error) => {
  const message = String(error?.message || error || "");
  return /Failed to fetch dynamically imported module|Failed to load module script|Importing a module script failed|Loading chunk [\w-]+ failed/i.test(
    message,
  );
};

router.afterEach(() => {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
});

router.onError((error) => {
  if (!isDynamicImportChunkError(error)) return;

  const reloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
  if (reloaded === "1") return;

  sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  window.location.reload();
});

const authStore = useAuthStore();
const initialized = authStore.initializeAuth();

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const userService = new UserService();
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;
    const skipAuthRedirect = Boolean(originalRequest?.skipAuthRedirect);

    if (status === 401 && skipAuthRedirect) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (localStorage.getItem("refresh_token")) {
        try {
          await userService.refreshToken();
          originalRequest.headers["Authorization"] =
            axios.defaults.headers.common["Authorization"];
          return axios(originalRequest);
        } catch (e) {
          userService.logout();
          const loginPath = "/";
          if (window.location.pathname !== loginPath) {
            window.location.href = loginPath;
          }
          return Promise.reject(e);
        }
      } else {
        userService.logout();
        const loginPath = "/";
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath;
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

// ป้องกันการคลิกขวาบนรูปภาพทั่วทั้งหมด
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

app.mount("#app");
