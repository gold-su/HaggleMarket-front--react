// src/hooks/useLike.js (B안 최종)
import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const readToken = () => localStorage.getItem("jwtToken");

export default function useLike(postId, initialLiked = false, initialCount = 0) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [count, setCount] = useState(Number.isFinite(initialCount) ? initialCount : 0);
  const [token, setToken] = useState(readToken());
  const baseUrl = "/api/products";

  // 로그인/로그아웃 시 토큰 동기화
  useEffect(() => {
    const sync = () => setToken(readToken());
    window.addEventListener("storage", sync);
    window.addEventListener("auth:changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth:changed", sync);
    };
  }, []);

  // ✅ 내 좋아요 여부 조회: 로그인 상태에서만 /like/me 호출
  useEffect(() => {
    if (!postId) return;
    if (!token) {             // 비로그인: 서버 호출 안 함 (403 방지)
      setLiked(false);
      setCount(initialCount || 0);
      return;
    }
    axios.get(`${baseUrl}/${postId}/like/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (typeof res.data?.liked !== "undefined") setLiked(!!res.data.liked);
      })
      .catch(err => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          // 만료/무효 토큰 정리(선택)
          localStorage.removeItem("jwtToken");
          window.dispatchEvent(new Event("auth:changed"));
        }
      });
  }, [postId, token, initialCount]);

  // ✅ 토글: liked면 DELETE, 아니면 POST (서버가 204여도 낙관적 업데이트 유지)
  const toggle = useCallback(async () => {
    if (!token) { alert("로그인이 필요합니다."); return; }

    const prevLiked = liked, prevCount = count;
    // 낙관적 업데이트
    setLiked(!prevLiked);
    setCount(v => v + (prevLiked ? -1 : 1));

    try {
      if (prevLiked) {
        await axios.delete(`${baseUrl}/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${baseUrl}/${postId}/like`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // 서버가 카운트를 돌려주지 않으면 여기서 더 할 건 없음 (낙관값 유지)
    } catch (err) {
      // 실패 시 롤백
      setLiked(prevLiked);
      setCount(prevCount);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
        localStorage.removeItem("jwtToken");
        window.dispatchEvent(new Event("auth:changed"));
      }
    }
  }, [liked, count, postId, token]);

  return { liked, count, toggle };
}
