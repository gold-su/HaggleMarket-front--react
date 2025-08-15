// src/components/like/LikeHeart.jsx
import useLike from "./useLike";
import "./LikeHeart.css";

export default function LikeHeart({ postId, initialLiked = false, initialCount = 0, showCount = false }) {
  const { liked, count, toggle } = useLike(postId, initialLiked, initialCount);

  const onClick = (e) => { e.stopPropagation(); e.preventDefault(); toggle(); };
  const onKeyDown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } };

  return (
    <button
      type="button"
      className={`heart-btn ${liked ? "on" : ""}`}
      aria-pressed={liked}
      aria-label={liked ? "찜 취소" : "찜하기"}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <span className="heart">{liked ? "♥" : "♡"}</span>
      {showCount && <span className="count">{count}</span>}
    </button>
  );
}
