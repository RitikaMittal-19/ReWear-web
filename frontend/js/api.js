// ============================================================
// api.js — ReWear API Client
// Add <script src="js/api.js"></script> to every HTML page
// BEFORE other JS files.
// ============================================================

const API_BASE = "https://rewear-backend-9coe.onrender.com/api";
// ↑ Change this to your deployed Render URL.
// For local dev: use "http://localhost:5000/api"

const Api = (() => {
  // ── Token helpers ──────────────────────────────────────────
  const getToken = () => localStorage.getItem("rewear_token");
  const setToken = (t) => localStorage.setItem("rewear_token", t);
  const removeToken = () => localStorage.removeItem("rewear_token");

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("rewear_user"));
    } catch {
      return null;
    }
  };
  const setUser = (u) => localStorage.setItem("rewear_user", JSON.stringify(u));
  const removeUser = () => localStorage.removeItem("rewear_user");

  const isLoggedIn = () => !!getToken();

  const logout = () => {
    removeToken();
    removeUser();
    window.location.href = "/Re-Wear-website/index.html";
  };

  // ── Core fetch wrapper ────────────────────────────────────
  const request = async (method, path, body = null, isFormData = false) => {
    const headers = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, config);
    const data = await res.json();

    if (!res.ok) {
      const msg = data.error || data.message || "Something went wrong.";
      throw new Error(msg);
    }
    return data;
  };

  const get = (path) => request("GET", path);
  const post = (path, body) => request("POST", path, body);
  const put = (path, body) => request("PUT", path, body);
  const patch = (path, body) => request("PATCH", path, body);
  const del = (path) => request("DELETE", path);
  const postForm = (path, formData) => request("POST", path, formData, true);
  const putForm = (path, formData) => request("PUT", path, formData, true);

  // ── Auth ──────────────────────────────────────────────────
  const auth = {
    register: (data) => post("/auth/register", data),
    login: (data) => post("/auth/login", data),
    me: () => get("/auth/me"),
  };

  // ── Items ─────────────────────────────────────────────────
  const items = {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return get(`/items${qs ? "?" + qs : ""}`);
    },
    getById: (id) => get(`/items/${id}`),
    getMine: () => get("/items/mine"),
    create: (formData) => postForm("/items", formData),
    update: (id, data) => put(`/items/${id}`, data),
    delete: (id) => del(`/items/${id}`),
  };

  // ── Orders ────────────────────────────────────────────────
  const orders = {
    getMine: () => get("/orders"),
    request: (itemId, note) => post("/orders", { itemId, note }),
    accept: (id) => patch(`/orders/${id}/accept`),
    reject: (id) => patch(`/orders/${id}/reject`),
    complete: (id) => patch(`/orders/${id}/complete`),
  };

  // ── Wishlist ──────────────────────────────────────────────
  const wishlist = {
    get: () => get("/wishlist"),
    add: (itemId) => post(`/wishlist/${itemId}`),
    remove: (itemId) => del(`/wishlist/${itemId}`),
  };

  // ── Users ─────────────────────────────────────────────────
  const users = {
    getProfile: (id) => get(`/users/${id}`),
    updateMe: (formData) => putForm("/users/me", formData),
  };

  // ── Admin ─────────────────────────────────────────────────
  const admin = {
    getStats: () => get("/admin/stats"),
    getUsers: (params = {}) => get(`/admin/users?${new URLSearchParams(params)}`),
    updateUser: (id, data) => patch(`/admin/users/${id}`, data),
    getItems: (params = {}) => get(`/admin/items?${new URLSearchParams(params)}`),
    updateItem: (id, status) => patch(`/admin/items/${id}`, { status }),
    getOrders: (params = {}) => get(`/admin/orders?${new URLSearchParams(params)}`),
  };

  // ── UI helpers ────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    const existing = document.getElementById("rw-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "rw-toast";
    toast.textContent = message;
    toast.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      padding:14px 22px; border-radius:10px; font-size:14px;
      font-weight:500; box-shadow:0 4px 20px rgba(0,0,0,0.15);
      background:${type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb"};
      color:#fff; transition:opacity .3s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3500);
  };

  const showError = (msg) => showToast(msg, "error");

  // ── Nav state update ──────────────────────────────────────
  const updateNavAuth = () => {
    const user = getUser();
    const loginBtn = document.querySelector("[data-nav-login]");
    const signupBtn = document.querySelector("[data-nav-signup]");
    const userMenu = document.querySelector("[data-nav-user]");

    if (user && isLoggedIn()) {
      if (loginBtn) loginBtn.style.display = "none";
      if (signupBtn) signupBtn.style.display = "none";
      if (userMenu) {
        userMenu.style.display = "flex";
        const nameEl = userMenu.querySelector("[data-user-name]");
        if (nameEl) nameEl.textContent = user.firstName + " " + user.lastName;
        const avatarEl = userMenu.querySelector("[data-user-avatar]");
        if (avatarEl && user.avatar) avatarEl.src = user.avatar;
      }
    }
  };

  return {
    getToken, setToken, removeToken,
    getUser, setUser, removeUser,
    isLoggedIn, logout,
    auth, items, orders, wishlist, users, admin,
    showToast, showError, updateNavAuth,
  };
})();

// Auto-update nav on every page load
document.addEventListener("DOMContentLoaded", () => Api.updateNavAuth());
