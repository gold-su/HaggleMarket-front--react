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

  const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
  const resolveImg = (url) =>
    !url ? "/no-image.png" : url.startsWith("http") ? url : `${BASE}${url}`;
  const goDetail = (id) => navigate(`/products/detail/${id}`);

  // 페이지 계산 (한 페이지 4개 = 2x2)
  const pageSize = 4;
  const total = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageItems = useMemo(() => {
    const start = page * pageSize;
    return (items ?? []).slice(start, start + pageSize);
  }, [items, page]);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <aside className={`likebox compact ${open ? "open" : "closed"}`}>
      <button className="likebox-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? ">" : "<"}
      </button>

      <div className="likebox-header">
        <h3>찜 목록</h3>
        <div className="likebox-count">
          현재 찜한 상품: <span>{likeCount}</span> 개
        </div>
      </div>

      {/* 2x2 그리드 + 페이지 네비게이션 */}
      {pageItems.length > 0 && (
        <div className="likebox-body">
          <div className="likebox-body--grid2">
            {pageItems.map((p) => (
              <button
                key={p.id}
                className="likebox-thumb-only"
                onClick={() => goDetail(p.id)}
                aria-label="상품 상세보기"
              >
                <img
                  src={resolveImg(p.img)}
                  alt=""
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
                />
              </button>
            ))}
          </div>

          {/* 페이지 컨트롤: 좌/우 화살표 + 현재/전체 */}
          {totalPages > 1 && (
            <div className="likebox-pager">
              <button
                className="pager-btn"
                onClick={prev}
                disabled={page === 0}
                aria-label="이전"
              >
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
      )}
    </aside>
  );
}
