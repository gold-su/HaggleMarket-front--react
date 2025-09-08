// src/MainPages/ProductCard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MainPagesCSS/productcard.css';
import LikeHeart from '../like/LikeHeart';

function ProductCard({ product, mode = 'used', link, endsAt }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [leftText, setLeftText] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const navigate = useNavigate();

  const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
  const imageSrc = useMemo(() => {
    const url = product?.thumbnailUrl ?? product?.imageUrl;
    if (!url) return '/no-image.png';
    return url.startsWith('http') ? url : `${BASE}${url}`;
  }, [product, BASE]);

  const displayPrice = useMemo(() => {
    const raw = mode === 'auction'
      ? (product.currentPrice ?? product.price ?? product.highestBid ?? 0)
      : (product.price ?? 0);
    const num = typeof raw === 'number' ? raw : Number(raw || 0);
    return num.toLocaleString() + '원';
  }, [mode, product]);

  const targetLink = link
    ? link
    : product.detailUrl
      ? product.detailUrl
      : (mode === 'auction' ? `/auction/detail/${product.id}` : `/products/detail/${product.id}`);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  };

  const handleCardClick = () => navigate(targetLink);

  // 경매 남은 시간
  useEffect(() => {
    if (mode !== 'auction' || !endsAt) {
      setLeftText('');
      return;
    }
    const timer = setInterval(() => {
      const now = Date.now();
      const remain = new Date(endsAt).getTime() - now;
      if (remain <= 0) {
        setIsEnded(true);
        setLeftText('경매가 종료되었습니다.');
        clearInterval(timer);
        return;
      }
      const hours = Math.floor(remain / (1000 * 60 * 60));
      const minutes = Math.floor((remain % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remain % (1000 * 60)) / 1000);
      const pad = (n) => String(n).padStart(2, '0');
      setLeftText(`남은 시간: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, endsAt]);

  return (
    <div
      className="product-card"
      tabIndex="0"
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
      role="button"
      aria-label={`${product?.title ?? '상품'} 상세로 이동`}
    >
      {/* ✅ 고정 비율 래퍼 추가 */}
      <div className="product-image-wrap">
        {mode === 'auction' && <span className="product-badge">경매</span>}
        {mode === 'auction' && leftText && (
          <span className={`product-dday ${isEnded ? 'ended' : ''}`}>
            {isEnded ? '종료' : 'D-DAY'}
          </span>
        )}
        <img
          src={imageSrc}
          alt={product?.title ?? '상품 이미지'}
          className="product-image"
          loading="lazy"
        />
      </div>

      <div className="product-info">
        <div className="product-title" title={product?.title}>{product?.title}</div>
        <div className="product-description" title={product?.content || ''}>
          {product?.content || ''}
        </div>

        {mode === 'auction' && leftText && (
          <div className={`left-time ${isEnded ? 'ended' : ''}`}>{leftText}</div>
        )}

        <div className="product-price-row">
          <div className="product-price">{displayPrice}</div>

          {/* 간단 하트 토글 (별도 서버 연동 전제 X) */}
          <svg
            className={`favorite-icon ${isFavorite ? 'active' : ''}`}
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
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFavoriteClick(e);
              }
            }}
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
