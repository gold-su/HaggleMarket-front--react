// src/like/useLike.jsx
import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

const readToken = () => localStorage.getItem("jwtToken");

/**
 * @param {number|string} id - postId 또는 auctionId
 * @param {object} opts
 * @param {boolean} opts.isAuction - 경매면 true, 기본 false(상품)
 * @param {boolean} [opts.initialLiked=false]
 * @param {number}  [opts.initialCount=0]
 * @param {function} [opts.onChanged] - 토글 성공 시 콜백
 */
export default function useLike(
  id,
  {
    isAuction = false,
    initialLiked = false,
    initialCount = 0,
    onChanged,
  } = {}
) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [count, setCount] = useState(Number.isFinite(initialCount) ? initialCount : 0);
  const [token, setToken] = useState(readToken());
  const busyRef = useRef(false);

  // 엔드포인트 세그먼트 분기
  const segment = isAuction ? "auctions" : "products";
  const baseUrl = `/api/${segment}`;

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

  // 내 좋아요 여부 조회
  useEffect(() => {
    if (!id) return;
    if (!token) { setLiked(false); setCount(Number.isFinite(initialCount) ? initialCount : 0); return; }
    axios.get(`${baseUrl}/${id}/like/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (typeof res.data?.liked !== "undefined") setLiked(!!res.data.liked);
      })
      .catch(err => {
        const s = err?.response?.status;
        if (s === 401 || s === 403) {
          localStorage.removeItem("jwtToken");
          window.dispatchEvent(new Event("auth:changed"));
        }
      });
  }, [id, token, baseUrl, initialCount]);

  // 토글
  const toggle = useCallback(async () => {
    if (!token) { alert("로그인이 필요합니다."); return; }
    if (busyRef.current || !id) return;
    busyRef.current = true;

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    // 낙관적 업데이트
    setLiked(nextLiked);
    setCount(nextCount);

    try {
      const url = `${baseUrl}/${id}/like`;
      const headers = { Authorization: `Bearer ${token}` };
      if (nextLiked) await axios.post(url, null, { headers });
      else await axios.delete(url, { headers });

      onChanged?.({ id, isAuction, liked: nextLiked, count: nextCount });
      // 사이드바 갱신 신호
      window.dispatchEvent(new Event("likes:changed"));
      window.dispatchEvent(new CustomEvent("like:updated", { detail: { id, isAuction, liked: nextLiked, count: nextCount } }));
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
  }, [liked, count, id, token, baseUrl, isAuction, onChanged]);

  return { liked, count, toggle };
}
