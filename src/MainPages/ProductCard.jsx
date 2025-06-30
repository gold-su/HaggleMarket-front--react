// src/components/ProductCard.js
import React, { useState } from 'react';
import '../MainPagesCSS/productcard.css'; // CSS 파일 경로를 맞춰주세요

function ProductCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  };

  const handleCardClick = () => {
    window.location.href = product.detailUrl;
  };

  return (
    <div className="product-card" tabIndex="0" onClick={handleCardClick}>
      <img src={product.imageUrl} alt={product.title} className="product-image" />
      <div className="product-info">
        <div className="product-title">{product.title}</div>
        <div className="product-description">{product.description}</div>
        <div className='product-price-row'>
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
