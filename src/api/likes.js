// src/api/likes.js
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_BASE ??
  "https://hagglemarket.onrender.com";

export async function fetchSidebarLikes(limit = 20) {
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${BASE}/api/products/likes/sidebar`, {
    params: { limit },
    headers,
  });
  return res.data ?? [];
}
