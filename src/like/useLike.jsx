// src/hooks/useLike.js
import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const readToken = () => localStorage.getItem("jwtToken");

export default function useLike(postId, initialLiked = false, initialCount = 0) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [count, setCount] = useState(Number.isFinite(initialCount) ? initialCount : 0);
  const [token, setToken] = useState(readToken());

  useEffect(() => {
    const sync = () => setToken(readToken());
    window.addEventListener("storage", sync);
    window.addEventListener("auth:changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth:changed", sync);
    };
  }, []);

  useEffect(() => {
    if (!postId) return;
    if (!token) { setLiked(false); setCount(initialCount || 0); return; }
    axios.get(`/api/products/${postId}/like`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setLiked(!!res.data.likedByMe);
        if (typeof res.data.likeCount !== "undefined") setCount(res.data.likeCount);
      })
      .catch(() => { });
  }, [postId, token]);

  // 토글 후 서버 응답으로 확정 동기화
  const toggle = useCallback(async () => {
    if (!token) { alert("로그인이 필요합니다."); return; }
    // 낙관적 업데이트(선택)
    const prevLiked = liked, prevCount = count;
    setLiked(!prevLiked);
    setCount(prev => prev + (prevLiked ? -1 : 1));
    try {
      const { data } = await axios.post(
        `/api/product/${postId}/like`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data) {
        if (typeof data.likedByMe !== "undefined") setLiked(!!data.likedByMe);
        if (typeof data.likeCount !== "undefined") setCount(data.likeCount);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    }
  }, [liked, count, postId, token]);

  return { liked, count, toggle };
}
