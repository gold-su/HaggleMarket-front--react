// src/components/ProductCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../MainPagesCSS/productcard.css";
import LikeHeart from "../like/LikeHeart";

// 👇 가격 정규화 + 후보 키 탐색 유틸
const normalizePrice = (v) => {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    // "12,000원", "￦12,000", " 12 000 " 등 처리
    const cleaned = v.replace(/[^\d.-]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isNaN(n) ? null : n;
  }
  if (typeof v === "object") {
    // { amount: 12000 } or { value: "12,000" } 같은 구조 대비
    return normalizePrice(v.amount ?? v.value ?? null);
  }
  return null;
};

const getPriceNumber = (product, mode = "used") => {
  // 백엔드 응답에 따라 존재할 수 있는 후보 키들
  const auctionKeys = [
    "currentPrice",
    "price",
    "highestBid",
    "startPrice",
    "minPrice",
  ];
  const usedKeys = ["price", "sellingPrice", "amount", "priceWon"];
  const keys = mode === "auction" ? auctionKeys : usedKeys;

  for (const k of keys) {
    const n = normalizePrice(product?.[k]);
    if (n != null) return n;
  }
  return 0;
};

function ProductCard({ product, mode = "used", link, endsAt }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [leftText, setLeftText] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const navigate = useNavigate();

  // 1) 이미지 URL 안전 처리 (절대/상대/없음)
  const BASE =
    import.meta.env.VITE_API_BASE_URL ?? "https://hagglemarket.onrender.com";
  const imageSrc = useMemo(() => {
    const url = product?.thumbnailUrl ?? product?.imageUrl;
    if (!url) return "/no-image.png";
    return url.startsWith("http") ? url : `${BASE}${url}`;
  }, [product, BASE]);

  // 2) 가격 표기 (문자열/객체 모두 호환)
  const priceNumber = useMemo(
    () => getPriceNumber(product, mode),
    [product, mode]
  );
  const displayPrice = useMemo(
    () => priceNumber.toLocaleString() + "원",
    [priceNumber]
  );

  // 3) 이동 경로 분기 (link prop이 있으면 우선)
  const targetLink = link
    ? link
    : product.detailUrl
    ? product.detailUrl
    : mode === "auction"
    ? `/auction/detail/${product.id}`
    : `/products/detail/${product.id}`;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  const handleCardClick = () => {
    navigate(targetLink);
  };

  // 경매 남은 시간 카운트다운
  useEffect(() => {
    if (mode !== "auction" || !endsAt) {
      setLeftText("");
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = new Date(endsAt).getTime() - now;
      if (timeLeft <= 0) {
        setIsEnded(true);
        setLeftText("경매가 종료되었습니다.");
        clearInterval(interval);
        return;
      } else {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        const pad = (num) => String(num).padStart(2, "0");
        setLeftText(
          `남은 시간: ${pad(hours)}시간 ${pad(minutes)}분 ${pad(seconds)}초`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, endsAt]);

  return (
    <div
      className="product-card"
      tabIndex="0"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick();
      }}
      role="button"
      aria-label={`${product?.title ?? ""} 상세로 이동`}
    >
      <img
        src={imageSrc}
        alt={product?.title ?? "상품 이미지"}
        className="product-image"
        loading="lazy"
      />

      <div className="product-info">
        <div className="product-title">{product?.title}</div>

        {mode === "auction" && leftText && (
          <div className={`left-time ${isEnded ? "ended" : ""}`}>
            {leftText}
          </div>
        )}

        <div className="product-price-row">
          <div className="product-price">{displayPrice}</div>
          <LikeHeart
            id={product?.id} // 공용 id
            isAuction={mode === "auction"} // 경매 카드일 때만 true
            initialLiked={product?.liked}
            initialCount={product?.likeCount}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
