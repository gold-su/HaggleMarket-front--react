import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../componentCSS/LikeBox.css";

export default function LikeBox({
  likeCount = 0,
  items = [],
  initiallyOpen = true,
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const BASE =
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_BASE ??
    "http://localhost:8080";

  // ── 유틸 ───────────────────────────────────────────────
  const resolveUrl = (v) => {
    if (!v || v === "null") return "/no-image.png";
    if (typeof v !== "string") v = String(v);
    if (/^https?:\/\//i.test(v)) return v;
    return `${BASE}${v.startsWith("/") ? "" : "/"}${v}`;
  };

  // ✅ ID 추출 로직 — auction/post 구분 관계없이 대응
  const getId = (p) => {
    if (!p) return null;
    return (
      p.postId ??
      p.id ??
      p.auctionId ??
      p.productId ??
      p.raw?.postId ??
      p.raw?.id ??
      p.raw?.auctionId ??
      p.raw?.productId ??
      null
    );
  };

  // ✅ 이동 처리 — auction 필드도 인식
  const goDetail = (p) => {
    const id = getId(p);
    if (!id || id === "tmp") return;

    const isAuction =
      p?.isAuction === true ||
      p?.auction === true ||
      p?.raw?.isAuction === true ||
      p?.raw?.auction === true;

    navigate(isAuction ? `/auction/detail/${id}` : `/products/detail/${id}`);
  };

  // 🔍 서버 응답 확인용 로그
  console.log("🔍 LikeBox items from server:", items);

  // ── 정규화 ───────────────────────────────────────────────
  const normalized = useMemo(() => {
    return (Array.isArray(items) ? items : []).map((p, idx) => {
      const id = getId(p);
      const isAuction =
        p?.isAuction === true ||
        p?.auction === true ||
        p?.raw?.isAuction === true ||
        p?.raw?.auction === true;
      return {
        __key: `${isAuction ? "auction" : "post"}-${id ?? "tmp-" + idx}`,
        id: id ?? `tmp-${idx}`,
        isAuction,
        thumbnailUrl: p?.thumbnailUrl ?? p?.raw?.thumbnailUrl ?? null,
        raw: p,
      };
    });
  }, [items]);

  // ── 페이지네이션(2x2) ─────────────────────────────────
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(normalized.length / pageSize));
  const pageItems = useMemo(() => {
    const start = page * pageSize;
    return normalized.slice(start, start + pageSize);
  }, [normalized, page]);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  // ── 렌더 ───────────────────────────────────────────────
  return (
    <aside className={`like-box ${open ? "open" : "closed"}`}>
      <button
        className="like-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="찜 목록 열기/닫기"
      >
        {open ? "⟩" : "⟨"}
      </button>

      {pageItems.length > 0 ? (
        <div className="like-content">
          <div className="like-thumbnails">
            {pageItems.map((p) => (
              <button
                key={p.__key}
                className="like-thumb"
                onClick={() => goDetail(p.raw)}
                aria-label="상품 상세보기"
              >
                <img
                  src={resolveUrl(p.thumbnailUrl)}
                  alt=""
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
                />
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="like-pagination">
              <button
                className="page-btn"
                onClick={prev}
                disabled={page === 0}
                aria-label="이전"
              >
                ‹
              </button>
              <span className="page-indicator">
                {page + 1}/{totalPages}
              </span>
              <button
                className="page-btn"
                onClick={next}
                disabled={page === totalPages - 1}
                aria-label="다음"
              >
                ›
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="like-empty">표시할 상품이 없습니다.</div>
      )}
    </aside>
  );
}
