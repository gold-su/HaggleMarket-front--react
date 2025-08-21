import React, { useState } from "react";
import "../componentCSS/LikeBox.css";

/**
 * 프레젠테이션 전용 LikeBox
 * props
 * - likeCount: number        (필수)
 * - items?: {id,title,price,img}[]  (선택, 없으면 카운트만 표시)
 * - onRemove?: (id)=>void    (선택, 있으면 X 버튼 노출)
 * - initiallyOpen?: boolean  (선택, 기본 true)
 */
export default function LikeBox({
  likeCount = 0,
  items = [],
  onRemove,
  initiallyOpen = true,
}) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <aside className={`likebox ${open ? "open" : "closed"}`}>
      <button className="likebox-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? ">" : "<"}
      </button>

      <div className="likebox-header">
        <h3>찜 목록</h3>
        <div className="likebox-count">
          현재 찜한 상품: <span>{likeCount}</span> 개
        </div>
      </div>

      {Array.isArray(items) && items.length > 0 && (
        <div className="likebox-body">
          {items.map((p) => (
            <div className="likebox-item" key={p.id}>
              <div className="likebox-thumb">
                {p.img ? (
                  <img src={p.img} alt={p.title} />
                ) : (
                  <div className="likebox-thumb--placeholder">No Image</div>
                )}
              </div>
              <div className="likebox-info">
                <div className="likebox-title" title={p.title}>
                  {p.title}
                </div>
                <div className="likebox-price">
                  {Number(p.price || 0).toLocaleString("ko-KR")}원
                </div>
              </div>
              {onRemove && (
                <button
                  className="likebox-unlike"
                  onClick={() => onRemove(p.id)}
                  aria-label="찜 해제"
                  title="찜 해제"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
