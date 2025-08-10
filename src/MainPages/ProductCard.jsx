import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 추가
import '../MainPagesCSS/productcard.css';

function ProductCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate(); // 훅 초기화

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  };

  const handleCardClick = () => {
    console.log("🔍 클릭된 product 객체:", product);
    console.log("➡️ 이동할 postId:", product.id);
    navigate(`/products/detail/${product.id}`); // 상세 페이지 경로 이동
  };

  return (
    <div className="product-card" tabIndex="0" onClick={handleCardClick}>
      <img
        src={`http://localhost:8080${product.imageUrl}`}
        alt={product.title}
        className="product-image"
      />
      <div className="product-info">
        <div className="product-title">{product.title}</div>
        <div className="product-description">{product.content || ''}</div>
        <div className="product-price-row">
          <div className="product-price">{product.price}</div>
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
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
