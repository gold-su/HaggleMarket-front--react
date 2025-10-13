// src/like/useLikeList.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_BASE ??
  "http://localhost:8080";

export default function useLikeList(limit = 20) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // ✅ 백엔드와 일치하는 엔드포인트
      const url = `${BASE}/api/products/likes/sidebar?limit=${limit}`;

      const res = await axios.get(url, { headers });
      const list = Array.isArray(res.data) ? res.data : [];

      // (선택) thumbnailUrl 절대경로 보정이 필요하면 주석 해제
      // const fixed = list.map(it => {
      //   const v = it.thumbnailUrl;
      //   if (!v) return it;
      //   if (/^https?:\/\//i.test(v)) return it;
      //   return { ...it, thumbnailUrl: `${BASE}${v.startsWith("/") ? "" : "/"}${v}` };
      // });

      setItems(list); // 또는 setItems(fixed);
    } catch (e) {
      console.error("fetch sidebar likes failed:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 토글/로그인 상태 변동 시 갱신
  useEffect(() => {
    const onChanged = () => fetchList();
    window.addEventListener("likes:changed", onChanged);
    window.addEventListener("auth:changed", onChanged);
    return () => {
      window.removeEventListener("likes:changed", onChanged);
      window.removeEventListener("auth:changed", onChanged);
    };
  }, [fetchList]);

  return { items, loading, refetch: fetchList };
}
