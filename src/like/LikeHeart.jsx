// src/like/LikeHeart.jsx
import useLike from "./useLike";
import "./LikeHeart.css";

function HeartIcon({ active, size = 28 }) {
  return (
    <svg
      className="heart"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {active ? (
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3
             19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#e0245e"
          stroke="#e0245e"
          strokeWidth="2"
        />
      ) : (
        <path
          d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3
             4.42 3 2 5.42 2 8.5
             c0 3.78 3.4 6.86 8.55 11.54L12 21.35
             l1.45-1.32C18.6 15.36 22 12.28 22 8.5
             22 5.42 19.58 3 16.5 3z"
          fill="none"
          stroke="#e0245e"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

export default function LikeHeart({
  // ✅ 호환성: 기존 postId 그대로 가능
  postId,
  // ✅ 경매 전용 id도 지원
  auctionId,
  // ✅ 혹시 부모가 직접 id 넘기면 그걸 우선
  id: explicitId,
  // ✅ 명시적으로 경매 여부 강제하고 싶을 때
  isAuction: isAuctionProp = false,

  initialLiked = false,
  initialCount = 0,
  showCount = false, // 카드에서는 보통 false
  textMode = false, // 상세에서 텍스트 버튼
  onChanged,
}) {
  // id/타입 자동 판별
  const id = explicitId ?? postId ?? auctionId;
  const isAuction = isAuctionProp || auctionId != null;

  const { liked, count, toggle } = useLike(id, {
    isAuction,
    initialLiked,
    initialCount,
    onChanged,
  });

  const onClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggle();
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  };

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
        {liked ? "찜취소" : "찜하기"}
        {showCount ? ` (${count})` : ""}
      </button>
    );
  }

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
      <HeartIcon active={liked} size={22} />
      {showCount && <span className="count">{count}</span>}
    </button>
  );
}
