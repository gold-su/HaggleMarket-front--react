// src/like/useLikeList.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
// 필요하면 주석 해제: import { jwtDecode } from "jwt-decode";

export default function useLikeList(limit = 20) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 기본(권장): 인증 사용자 기반
      let url = `/api/likes/sidebar?limit=${limit}`;

      // Fallback: 서버가 userNo 필요하면 사용 (주석 해제해서 쓰세요)
      // if (!token) return setItems([]);
      // const { userNo } = jwtDecode(token);
      // url = `/api/likes/sidebar?limit=${limit}&userNo=${userNo}`;

      const res = await axios.get(url, { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 토글 등으로 변경되면 다시 불러오기
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
