import useLike from "./useLike";
import "./LikeHeart.css";

function HeartIcon({ active }) {
  return (
    <svg className="heart" viewBox="0 0 24 24">
      <path
        d="M12 21s-6.5-4.35-9.2-7.05C-1 11.35.2 6.5 4 6.5c2.2 0 3.7 1.7 4 2.2.3-.5 1.8-2.2 4-2.2 3.8 0 5 4.85 1.2 7.45C18.5 16.65 12 21 12 21z"
        fill={active ? '#e0245e' : 'none'}
        stroke="#e0245e"
        strokeWidth="2"
      />
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
      <HeartIcon active={liked} />
      {showCount && <span className="count">{count}</span>}
    </button>
  );
}