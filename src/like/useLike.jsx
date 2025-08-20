import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

const readToken = () => localStorage.getItem("jwtToken");


export default function useLike(
  postId,
  initialLiked = false,
  initialCount = 0,
  { onChanged } = {}
) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [count, setCount] = useState(Number.isFinite(initialCount) ? initialCount : 0);
  const [token, setToken] = useState(readToken());
  const baseUrl = "/api/products";
  const busyRef = useRef(false);

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

  // 초기값 변동 시 동기화
  useEffect(() => { setLiked(!!initialLiked); }, [initialLiked]);
  useEffect(() => { setCount(Number.isFinite(initialCount) ? initialCount : 0); }, [initialCount]);

  // 내 좋아요 여부 조회 (로그인시에만)
  useEffect(() => {
    if (!postId) return;
    if (!token) { setLiked(false); setCount(Number.isFinite(initialCount) ? initialCount : 0); return; }
    axios.get(`${baseUrl}/${postId}/like/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (typeof res.data?.liked !== "undefined") setLiked(!!res.data.liked); })
      .catch(err => {
        const s = err?.response?.status;
        if (s === 401 || s === 403) {
          localStorage.removeItem("jwtToken");
          window.dispatchEvent(new Event("auth:changed"));
        }
      });
  }, [postId, token, initialCount]);

  // 토글
  const toggle = useCallback(async () => {
    if (!token) { alert("로그인이 필요합니다."); return; }
    if (busyRef.current) return;
    busyRef.current = true;

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    // 낙관 업데이트
    setLiked(nextLiked);
    setCount(nextCount);

    try {
      const url = `${baseUrl}/${postId}/like`;
      const headers = { Authorization: `Bearer ${token}` };
      if (nextLiked) await axios.post(url, null, { headers });
      else await axios.delete(url, { headers });

      onChanged?.({ postId, liked: nextLiked, count: nextCount });
      window.dispatchEvent(new CustomEvent("like:updated", { detail: { postId, liked: nextLiked, count: nextCount } }));
    } catch (err) {
      // 롤백
      setLiked(prevLiked);
      setCount(prevCount);
      const s = err?.response?.status;
      if (s === 401 || s === 403) {
        alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
        localStorage.removeItem("jwtToken");
        window.dispatchEvent(new Event("auth:changed"));
      }
    } finally {
      busyRef.current = false;
    }
  }, [liked, count, postId, token, onChanged]);

  return { liked, count, toggle };
}
