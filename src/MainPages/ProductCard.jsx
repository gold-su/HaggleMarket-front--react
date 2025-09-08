// src/components/ProductCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../MainPagesCSS/productcard.css";
import LikeHeart from "../like/LikeHeart";

function ProductCard({ product, mode = "used", link, endsAt }) {
  //product -> 상품 정보 객체 (제목, 가격, 이미지, 내용 등) / mode = 'used' 또는 'auction' / link -> 클릭 시 이동할 경로
  const [isFavorite, setIsFavorite] = useState(false); //isFavorite -> 찜 상태 관리
  const [leftText, setLeftText] = useState(""); //leftText -> 경매 마감 시간 표시용 (경매 모드에서만 사용)
  const [isEnded, setIsEnded] = useState(false); //isEnded -> 경매 종료 상태 관리
  const navigate = useNavigate(); //navigate -> 페이지 이동용 훅

  // 1) 이미지 URL 안전 처리 (절대/상대/없음)
  const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"; // BASE URL 환경 변수 (백엔드 API 주소)
  const imageSrc = useMemo(() => {
    //imageSrc -> 상품 이미지 URL 생성
    const url = product?.thumbnailUrl ?? product?.imageUrl; //썸네일 우선, 없으면 imageUrl 사용
    if (!url) return "/no-image.png"; //값이 없으면 /no-image.png 기본 이미지
    return url.startsWith("http") ? url : `${BASE}${url}`; //상대 경로면 BASE를 붙혀서 절대 경로로 변환
  }, [product, BASE]); //product나 BASE가 변할 때만 재계산

  // 2) 가격 표기 (경매는 currentPrice 우선)
  const displayPrice = useMemo(() => {
    const raw =
      mode === "auction"
        ? product.currentPrice ?? product.price ?? product.highestBid ?? 0 //경매 모드: currentPrice → 없으면 price → 없으면 highestBid → 없으면 0.
        : product.price ?? 0; //중고거래 모드: price → 없으면 0.
    const num = typeof raw === "number" ? raw : Number(raw || 0); //숫자가 문자열이면 Number()로 변환.
    return num.toLocaleString() + "원"; //천 단위 콤마 + "원"붙힘
  }, [mode, product]); //mode나 product가 변할 때만 재계산

  // 3) 이동 경로 분기 (link prop이 있으면 우선)
  const targetLink = link //link prop이 있으면 우선
    ? link // 없으면 product.detailUrl 우선, 그 다음 mode에 따라 분기
    : product.detailUrl
    ? product.detailUrl
    : mode === "auction"
    ? `/auction/detail/${product.id}`
    : `/products/detail/${product.id}`; // 경매 → /auction/{id} / 중고 → /products/detail/{id}
  const handleFavoriteClick = (e) => {
    //이벤트 핸들러: 찜하기 클릭
    e.stopPropagation(); //이벤트 전파 방지 (카드 클릭 이벤트로 이동하지 않도록)
    setIsFavorite((prev) => !prev); //찜 상태 토글
  };

  const handleCardClick = () => {
    navigate(targetLink); //카드 클릭 시 해당 링크로 이동
  };

  //경매 남은 시간 카운트다운
  useEffect(() => {
    if (mode != "auction" || !endsAt) {
      setLeftText(""); //경매가 아니면 남은 시간 표시 안함
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = new Date(endsAt).getTime() - now; // endsAt이 문자열이면 Date로 변환 후 getTime()으로 밀리초 단위로 변환
      if (timeLeft <= 0) {
        setIsEnded(true);
        setLeftText("경매가 종료되었습니다.");
        clearInterval(interval);
        return;
      } else {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        const pad = (num) => String(num).padStart(2, "0"); // 2자리 수로 패딩
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
      aria-label={`${product.title} 상세로 이동`}
    >
      <img
        src={imageSrc}
        alt={product?.title ?? "상품 이미지"}
        className="product-image"
        loading="lazy"
      />

      <div className="product-info">
        <div className="product-title">{product?.title}</div>
        <div className="product-description">{product?.content || ""}</div>

        {/* 경매 모드일 때 남은 시간 표시 */}
        {mode === "auction" && leftText && (
          <div className={`left-time ${isEnded ? "ended" : ""}`}>
            {leftText}
          </div>
        )}

        <div className="product-price-row">
          <div className="product-price">{displayPrice}</div>

          {/* 즐겨찾기(별/하트) 아이콘 */}
          <svg
            className={`favorite-icon ${isFavorite ? "active" : ""}`}
            viewBox="0 0 24 24"
            aria-label="찜하기"
            role="button"
            tabIndex="0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={handleFavoriteClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFavoriteClick(e);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
