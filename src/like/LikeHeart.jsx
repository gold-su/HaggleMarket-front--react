import useLike from "./useLike";
import "./LikeHeart.css";

function CoinHIcon({ active }) {
  const fillColor = active ? "#80DEEA" : "#E0F7FA"; // 파스텔 하늘색 계열
  const strokeColor = "#26C6DA";                    // 조금 진한 파스텔톤

  return (
    <svg className="coin" width="28" height="28" viewBox="0 0 48 48">
      {/* 바탕 원 */}
      <circle cx="24" cy="24" r="20" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
      {/* 안쪽 링 */}
      <circle cx="24" cy="24" r="15" fill="none" stroke={strokeColor} strokeWidth="3" />
      {/* 중앙 H */}
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="central"
        fontSize="20" fontWeight="bold"
        fill={strokeColor} fontFamily="Arial, sans-serif"
      >
        H
      </text>
    </svg>
  );
}

export default function LikeHeart({
  postId,
  initialLiked = false,
  initialCount = 0,
  showCount = false,  // 카드에서는 기본 false
  textMode = false,   // 상세에서 "찜하기/찜취소" 텍스트 버튼
  onChanged,
}) {
  const { liked, count, toggle } = useLike(postId, initialLiked, initialCount, { onChanged });

  const onClick = (e) => { e.stopPropagation(); e.preventDefault(); toggle(); };
  const onKeyDown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } };

  if (textMode) {
    return (
      <button
        type="button"
        className={`like-text-btn ${liked ? "on" : ""}`}
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-pressed={liked}
        aria-label={liked ? "찜취소" : "찜하기"}
        title={liked ? "찜취소" : "찜하기"}
      >
        {liked ? "찜취소" : "찜하기"}{showCount ? ` (${count})` : ""}
      </button>
    );
  }

  // 카드용 아이콘 버튼
  return (
    <button
      type="button"
      className={`heart-btn ${liked ? "on" : ""}`}
      aria-pressed={liked}
      aria-label={liked ? "찜취소" : "찜하기"}
      onClick={onClick}
      onKeyDown={onKeyDown}
      title={liked ? "찜취소" : "찜하기"}
    >
      <CoinHIcon active={liked} />
      {showCount && <span className="count">{count}</span>}
    </button>
  );
}