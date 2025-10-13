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
    if (/^https?:\/\//i.test(v)) return v; // 절대경로
    return `${BASE}${v.startsWith("/") ? "" : "/"}${v}`; // 상대경로
  };

  const getId = (p) => p?.id ?? p?.postId ?? p?.auctionId ?? null;
  const goDetail = (p) => {
    const id = getId(p);
    if (!id) return;
    const isAuction = p?.isAuction === true;
    navigate(isAuction ? `/auction/detail/${id}` : `/products/detail/${id}`);
  };

  // ── 화면 표시용 정규화 ─────────────────────────────────
  const normalized = useMemo(() => {
    return (Array.isArray(items) ? items : []).map((p, idx) => ({
      __key: `${p?.isAuction ? "auction" : "post"}-${getId(p) ?? "tmp-" + idx}`,
      id: getId(p) ?? `tmp-${idx}`,
      isAuction: p?.isAuction === true,
      thumbnailUrl: p?.thumbnailUrl ?? null,
      raw: p,
    }));
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

  return (
    <aside className={`likebox compact ${open ? "open" : "closed"}`}>
      <button
        className="likebox-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="찜 목록 열기/닫기"
      >
        {open ? ">" : "<"}
      </button>

      {pageItems.length > 0 ? (
        <div className="likebox-body">
          <div className="likebox-body--grid2">
            {pageItems.map((p) => (
              <button
                key={p.__key}
                className="likebox-thumb-only"
                onClick={() => goDetail(p.raw)}
                aria-label="상품 상세보기"
                title=""
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
            <div className="likebox-pager">
              <button className="pager-btn" onClick={prev} disabled={page === 0} aria-label="이전">
                ‹
              </button>
              <span className="pager-indicator">
                {page + 1}/{totalPages}
              </span>
              <button
                className="pager-btn"
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
        <div className="likebox-empty">표시할 상품이 없습니다.</div>
      )}
    </aside>
  );
}
